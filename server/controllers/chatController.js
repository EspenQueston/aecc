const ChatConversation = require('../models/ChatConversation');
const Event = require('../models/Event');
const FAQ = require('../models/FAQ');

// System prompt cache — rebuilt at most every 5 minutes
let _systemPromptCache = null;
let _systemPromptBuiltAt = 0;
const SYSTEM_PROMPT_TTL_MS = 5 * 60 * 1000;

async function buildSystemPrompt() {
  const now = Date.now();
  if (_systemPromptCache && (now - _systemPromptBuiltAt) < SYSTEM_PROMPT_TTL_MS) {
    return _systemPromptCache;
  }

  let ragContext = "Voici des informations issues de la base de données de l'AECC :\n\n";

  try {
     const events = await Event.find().sort({ date: -1 }).limit(3);
     if (events.length > 0) {
       ragContext += "--- Événements récents / à venir ---\n";
       events.forEach(e => {
         ragContext += `- ${e.title} (${new Date(e.date).toLocaleDateString()}) : ${e.description.substring(0, 100)}...\n`;
       });
     }
  } catch(e){ console.error("RAG Event Query Error:", e); }

  try {
      const faqs = await FAQ.find().limit(5);
      if (faqs.length > 0) {
          ragContext += "\n--- FAQ (Foire Aux Questions) ---\n";
          faqs.forEach(f => {
             ragContext += `Q: ${f.question}\nR: ${f.answer}\n`;
          });
      }
  } catch(e){ console.error("RAG FAQ Query Error:", e); }
  
  _systemPromptCache = `Tu es l'assistant de l'AECC (Association des Étudiants Congolais en Chine). Tu réponds poliment, de façon claire et tu fournis des informations précises basées sur ce contexte.
Ne donne pas d'informations fausses.

${ragContext}

Si l'utilisateur demande de parler à un agent, indique qu'il va être transféré à un administrateur et dis de patienter. Tu vas générer les réponses suivantes en te référant au contexte. Garde le contexte en mémoire.`;
  _systemPromptBuiltAt = Date.now();
  return _systemPromptCache;
}

async function getOpenRouterStream(messages, onChunk, onComplete) {
   const openaiKey = process.env.OPENROUTER_API_KEY;
   if (!openaiKey) {
      throw new Error("Missing OPENROUTER_API_KEY in environment variables.");
   }

   const body = {
      model: process.env.OPENROUTER_DEFAULT_MODEL || "deepseek/deepseek-chat:free",
      messages: messages,
      stream: true
   };

   const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://aecc-china.com", 
        "X-Title": "AECC Chatbot"
      },
      body: JSON.stringify(body)
   });
   
   if (!response.ok) {
     const text = await response.text();
     throw new Error(`OpenRouter API Error: ${response.status} ${text}`);
   }
   
   const reader = response.body.getReader();
   const decoder = new TextDecoder("utf-8");
   let fullText = "";

   try {
     while (true) {
       const { done, value } = await reader.read();
       if (done) break;
       const chunk = decoder.decode(value, { stream: true });
       const lines = chunk.split('\n');
       for (const line of lines) {
         if (line.startsWith('data: ') && line !== 'data: [DONE]') {
           try {
             const data = JSON.parse(line.slice(6));
             if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
               const text = data.choices[0].delta.content;
               fullText += text;
               onChunk(text);
             }
           } catch(e) {
             if (process.env.NODE_ENV !== 'production') console.warn('SSE parse error:', e.message);
           }
         }
       }
     }
     onComplete(fullText);
   } catch (err) {
     console.error("Stream reading error:", err);
     onComplete(fullText);
   }
}

exports.startChat = async (req, res) => {
  try {
    const { visitorName, visitorEmail, conversationId } = req.body;
    if (conversationId) {
      const existing = await ChatConversation.findById(conversationId);
      if (existing && existing.status === 'active') {
        return res.json({ success: true, data: existing });
      }
    }
    const chat = new ChatConversation({
      visitorName: visitorName || 'Visiteur',
      visitorEmail: visitorEmail || '',
      messages: [{
        sender: 'bot',
        message: 'Bonjour ! 👋 Bienvenue sur le chat de l\'AECC. Je suis votre assistant IA. Comment puis-je vous aider aujourd\'hui ?'
      }]
    });
    await chat.save();
    res.status(201).json({ success: true, data: chat });
  } catch (err) {
    console.error("StartChat Error:", err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ msg: 'Message is required' });
    }

    const chat = await ChatConversation.findById(req.params.id);
    if (!chat) return res.status(404).json({ msg: 'Conversation not found' });
    if (chat.status === 'closed') return res.status(400).json({ msg: 'Conversation is closed' });

    const trimmed = message.trim();
    chat.messages.push({ sender: 'user', message: trimmed });
    chat.lastMessageAt = new Date();
    await chat.save();

    // Agent transfer — short-circuit before SSE
    const lowerMessage = trimmed.toLowerCase();
    const agentKeywords = ['agent', 'humain', 'administrateur', 'admin', 'personne'];
    if (agentKeywords.some(kw => lowerMessage.includes(kw))) {
      chat.messages.push({ sender: 'bot', message: 'Je transfère votre conversation à un administrateur. Veuillez patienter, un membre de l\'équipe vous répondra dès que possible.' });
      await chat.save();
      return res.json({ success: true, data: chat });
    }

    // Open SSE connection immediately — client starts receiving before context is built
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Build message history (system prompt served from cache after first call)
    const history = [];
    history.push({ role: 'system', content: await buildSystemPrompt() });
    chat.messages.slice(-10).forEach(m => {
      history.push({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.message });
    });

    try {
      await getOpenRouterStream(history, 
        (textChunk) => {
          res.write(`data: ${JSON.stringify({ text: textChunk })}\n\n`);
        },
        async (fullBotReply) => {
          chat.messages.push({ sender: 'bot', message: fullBotReply });
          await chat.save();
          res.write('data: [DONE]\n\n');
          res.end();
        }
      );
    } catch(aiError) {
      console.error("AI Generation Error:", aiError.message);
      const errMsg = "Désolé, l'assistant IA est temporairement indisponible. Veuillez réessayer ou demander un agent.";
      res.write(`data: ${JSON.stringify({ text: errMsg })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
      chat.messages.push({ sender: 'bot', message: errMsg });
      await chat.save();
    }
  } catch (err) {
    console.error("SendMessage Error:", err.message);
    if (!res.headersSent) {
      res.status(500).json({ msg: 'Server Error' });
    } else {
      res.end();
    }
  }
};

exports.getConversation = async (req, res) => {
  try {
    const chat = await ChatConversation.findById(req.params.id);
    if (!chat) return res.status(404).json({ msg: 'Conversation not found' });
    res.json({ success: true, data: chat });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Conversation not found' });
    res.status(500).json({ msg: 'Server Error' });
  }
};

exports.getChats = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const chats = await ChatConversation.find(filter).sort({ lastMessageAt: -1 }).skip(startIndex).limit(limit);
    const total = await ChatConversation.countDocuments(filter);

    res.json({
      success: true,
      pagination: { total, page, pages: Math.ceil(total / limit) },
      data: chats
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

exports.adminReply = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) return res.status(400).json({ msg: 'Message is required' });

    const chat = await ChatConversation.findById(req.params.id);
    if (!chat) return res.status(404).json({ msg: 'Conversation not found' });

    chat.messages.push({ sender: 'admin', message: message.trim() });
    chat.lastMessageAt = new Date();
    await chat.save();

    res.json({ success: true, data: chat });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

exports.closeChat = async (req, res) => {
  try {
    const chat = await ChatConversation.findByIdAndUpdate(req.params.id, { status: 'closed' }, { new: true });
    if (!chat) return res.status(404).json({ msg: 'Conversation not found' });
    res.json({ success: true, data: chat });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

exports.deleteChat = async (req, res) => {
  try {
    const chat = await ChatConversation.findByIdAndDelete(req.params.id);
    if (!chat) return res.status(404).json({ msg: 'Conversation not found' });
    res.json({ success: true, msg: 'Chat deleted' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Conversation not found' });
    res.status(500).json({ msg: 'Server Error' });
  }
};