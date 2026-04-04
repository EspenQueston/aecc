const ChatConversation = require('../models/ChatConversation');

// Bot auto-responses based on keywords (priority order — first match wins)
const BOT_RESPONSES = [
  // Greetings
  { keywords: ['bonjour', 'salut', 'hello', 'hi', 'bonsoir', 'coucou', 'hey', 'bsr', 'bjr'],
    response: 'Bonjour ! Bienvenue sur le chat de l\'AECC. Comment puis-je vous aider ?\n\nVoici quelques sujets courants :\n• Adhésion à l\'AECC\n• Bourses d\'études\n• Visa & Documents\n• Logement\n• Vie quotidienne\n• Événements\n\nTapez votre question ou "agent" pour parler à un administrateur.' },

  // Agent / human transfer
  { keywords: ['agent', 'humain', 'administrateur', 'admin', 'personne', 'opérateur', 'operateur', 'parler à quelqu'],
    response: 'Je transfère votre conversation à un administrateur. Veuillez patienter, un membre de l\'équipe vous répondra dès que possible.' },

  // Membership
  { keywords: ['adhésion', 'adhesion', 'membre', 'inscrire', 'inscription', 'rejoindre', 'cotisation', 'carte membre', 'devenir membre'],
    response: 'Pour devenir membre de l\'AECC :\n1. Créez un compte sur notre plateforme via la page d\'inscription\n2. Les frais d\'adhésion sont de 50 RMB (10 RMB carte + 40 RMB uniforme)\n3. La cotisation mensuelle est de 10 RMB\n\nL\'adhésion est ouverte à tout étudiant congolais (République du Congo) en Chine.' },

  // Scholarships
  { keywords: ['bourse', 'scholarship', 'csc', 'financement', 'subvention', 'aide financière', 'aide financiere', 'stipend'],
    response: 'Les principales bourses pour étudier en Chine :\n• Bourse CSC (Chinese Government Scholarship) — la plus complète\n• Bourses provinciales (Jiangsu, Zhejiang, Shanghai…)\n• Bourses universitaires d\'excellence\n• Bourse du gouvernement congolais\n\nConsultez notre page Bourses ou la section Ressources pour les guides détaillés.\nVisitez : csc.edu.cn pour les candidatures CSC.' },

  // Visa & Documents
  { keywords: ['visa', 'passeport', 'titre de séjour', 'titre de sejour', 'residence permit', 'permis de séjour', 'renouvellement visa', 'x1', 'x2'],
    response: 'Informations sur le visa étudiant en Chine :\n• Visa X1 : études de plus de 180 jours (à convertir en titre de séjour sous 30 jours)\n• Visa X2 : études de moins de 180 jours\n\nDocuments nécessaires :\n• Passeport valide (+ 6 mois)\n• Formulaire JW201/JW202\n• Admission Notice\n• Examen médical (formulaire officiel)\n\nPour le renouvellement, rendez-vous au bureau de la police locale (PSB) avant expiration.' },

  // Housing
  { keywords: ['logement', 'appartement', 'chambre', 'dortoir', 'louer', 'loyer', 'hébergement', 'hebergement', 'housing', 'dormitory'],
    response: 'Options de logement en Chine :\n• Dortoir universitaire : 800–3000 RMB/mois (le plus simple)\n• Appartement en colocation : 1500–4000 RMB/mois selon la ville\n• Studio individuel : 2500–6000 RMB/mois\n\nConseils :\n• Utilisez les apps : 58同城, 贝壳找房, Lianjia\n• Enregistrez-vous toujours au poste de police dans les 24h après emménagement\n• Vérifiez le contrat avant de signer\n\nContactez l\'AECC pour des conseils personnalisés selon votre ville.' },

  // Events
  { keywords: ['événement', 'evenement', 'event', 'activité', 'activite', 'fête', 'fete', 'soirée', 'soiree', 'gala'],
    response: 'L\'AECC organise régulièrement :\n• Assemblées Générales (2x/an)\n• Soirées culturelles et galas\n• Tournois sportifs\n• Séminaires académiques\n• Journée de l\'indépendance (15 août)\n\nConsultez la page Événements pour le calendrier complet !' },

  // Chinese language
  { keywords: ['chinois', 'mandarin', 'hsk', 'apprendre', 'langue', 'chinese', 'hanyu', '汉语', 'hsk1', 'hsk2', 'hsk3', 'hsk4', 'hsk5', 'hsk6'],
    response: 'Ressources pour apprendre le chinois :\n• HSK (examen officiel) : inscriptions sur chinesetest.cn\n• App recommandée : Pleco (dictionnaire gratuit)\n• Notre page Apprentissage contient des chaînes YouTube et formations\n• Niveaux HSK : 1 (débutant) à 6 (avancé)\n\nConseil : pratiquez avec vos camarades chinois au quotidien !' },

  // Money & Banking
  { keywords: ['argent', 'banque', 'transfert', 'envoyer argent', 'western union', 'wise', 'alipay', 'wechat pay', 'paiement', 'rmb', 'yuan', 'change'],
    response: 'Finances en Chine :\n• Ouvrir un compte bancaire : Bank of China, ICBC (passeport + inscription universitaire)\n• Paiements mobiles : Alipay et WeChat Pay (indispensables)\n• Transferts internationaux : Wise (recommandé), Western Union\n• Taux de change : vérifiez sur xe.com\n\nConseil : activez Alipay/WeChat Pay dès votre arrivée.' },

  // Health
  { keywords: ['santé', 'sante', 'hôpital', 'hopital', 'médecin', 'medecin', 'maladie', 'assurance', 'pharmacie', 'urgence médicale'],
    response: 'Santé en Chine :\n• Assurance médicale : obligatoire pour les étudiants (souvent incluse dans les frais)\n• Hôpitaux : privilégiez les hôpitaux internationaux ou les services étrangers (外宾部)\n• Urgences : appelez le 120\n• Pharmacies : 药店 (yaodian) ouvertes partout\n\nL\'AECC dispose d\'un fonds de solidarité pour les urgences médicales.' },

  // Transport
  { keywords: ['transport', 'métro', 'metro', 'bus', 'train', 'avion', 'taxi', 'didi', 'voyage', 'déplacement'],
    response: 'Transports en Chine :\n• Métro : le plus pratique (2-10 RMB)\n• Bus : très économique (1-2 RMB)\n• Train : CRH/Gaotie pour les longues distances (trip.com ou 12306.cn)\n• Taxi/VTC : utilisez DiDi (équivalent d\'Uber)\n• Vélos partagés : Hellobike, Meituan Bike\n\nConseil : obtenez une carte de transport locale pour des réductions.' },

  // Food
  { keywords: ['nourriture', 'manger', 'restaurant', 'cuisine', 'repas', 'cantine', 'halal', 'africain', 'supermarché'],
    response: 'Alimentation en Chine :\n• Cantines universitaires : 10-20 RMB/repas (le moins cher)\n• Restaurants : 30-80 RMB/repas\n• Livraison : Meituan (美团) et Ele.me (饿了么)\n• Produits africains : magasins spécialisés dans les quartiers internationaux\n• Supermarchés : Walmart, Carrefour, Hema\n\nConseil : téléchargez Meituan pour les livraisons et bonnes affaires.' },

  // Work & Jobs
  { keywords: ['travail', 'emploi', 'job', 'stage', 'temps partiel', 'part-time', 'carrière', 'carriere', 'cv', 'entretien'],
    response: 'Emploi et stages en Chine :\n• Les étudiants peuvent faire du temps partiel avec autorisation de l\'université\n• Sites d\'offres : eChinacities.com, LinkedIn, BOSS直聘\n• CV international : utilisez le format Europass\n• Stages : contactez le bureau des affaires internationales de votre université\n\nConsultez notre page Ressources pour plus de guides.' },

  // Contact
  { keywords: ['contact', 'email', 'téléphone', 'telephone', 'wechat', 'joindre', 'écrire', 'ecrire'],
    response: 'Contactez l\'AECC :\n• Email : m.moukendicluivert@gmail.com\n• WeChat : AECC_Official\n• Formulaire de contact sur notre site (page Contact)\n\nNous répondons sous 24-48h.' },

  // Thanks
  { keywords: ['merci', 'thanks', 'thank', 'super', 'parfait', 'excellent', 'génial', 'genial', 'top'],
    response: 'De rien ! N\'hésitez pas si vous avez d\'autres questions. L\'AECC est là pour vous accompagner tout au long de votre parcours en Chine.' },

  // Help / Emergency
  { keywords: ['aide', 'help', 'urgence', 'problème', 'probleme', 'sos', 'danger', 'détresse'],
    response: 'En cas d\'urgence :\n• Police : 110\n• Ambulance : 120\n• Pompiers : 119\n• Ambassade du Congo à Pékin : +86-10-65321658\n\nContactez l\'AECC immédiatement :\n• WeChat : AECC_Official\n• Email : m.moukendicluivert@gmail.com\n\nL\'AECC dispose d\'un fonds de solidarité pour aider les membres en difficulté.' },

  // Weather
  { keywords: ['météo', 'meteo', 'climat', 'temps', 'froid', 'chaud', 'hiver', 'été', 'pluie', 'neige'],
    response: 'Climat en Chine (varie selon les régions) :\n• Nord (Pékin, Harbin) : hivers très froids (-20°C), étés chauds\n• Centre (Shanghai, Wuhan) : 4 saisons marquées\n• Sud (Guangzhou, Kunming) : subtropical, doux toute l\'année\n\nConseil : préparez des vêtements adaptés à votre ville d\'accueil.' },

  // About AECC
  { keywords: ['aecc', 'association', 'qui êtes-vous', 'qui etes-vous', 'c\'est quoi', 'présentation', 'presentation', 'historique'],
    response: 'L\'AECC (Association des Étudiants Congolais en Chine) :\n• Créée le 1er Août 2000 à Pékin\n• Devise : Unité – Travail – Réussite\n• Mission : accompagner et unir les étudiants congolais en Chine\n• Services : orientation, aide administrative, événements culturels, solidarité\n\nVisitez la page "À propos" pour en savoir plus !' },
];

function getBotResponse(message) {
  const lower = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const entry of BOT_RESPONSES) {
    if (entry.keywords.some(kw => {
      const normalized = kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return lower.includes(normalized);
    })) {
      return entry.response;
    }
  }
  // Default fallback if no keyword matched
  return 'Je n\'ai pas trouvé de réponse précise à votre question. Voici ce que je peux vous aider avec :\n\n• Adhésion — tapez "adhésion"\n• Bourses — tapez "bourse"\n• Visa — tapez "visa"\n• Logement — tapez "logement"\n• Événements — tapez "événement"\n• Chinois/HSK — tapez "chinois"\n• Urgence — tapez "urgence"\n\nOu tapez "agent" pour parler à un administrateur.';
}

// @desc    Start or get a chat conversation (public)
exports.startChat = async (req, res) => {
  try {
    const { visitorName, visitorEmail, conversationId } = req.body;

    // Resume existing conversation
    if (conversationId) {
      const existing = await ChatConversation.findById(conversationId);
      if (existing && existing.status === 'active') {
        return res.json({ success: true, data: existing });
      }
    }

    // Create new conversation
    const chat = new ChatConversation({
      visitorName: visitorName || 'Visiteur',
      visitorEmail: visitorEmail || '',
      messages: [{
        sender: 'bot',
        message: 'Bonjour ! 👋 Bienvenue sur le chat de l\'AECC. Comment puis-je vous aider ?\n\nTapez votre question ou sélectionnez un sujet :\n• Adhésion\n• Bourses\n• Événements\n• Contact\n\nTapez "agent" pour parler à un administrateur.'
      }]
    });
    await chat.save();
    res.status(201).json({ success: true, data: chat });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Send a message in a chat conversation (public)
exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ msg: 'Message is required' });
    }

    const chat = await ChatConversation.findById(req.params.id);
    if (!chat) return res.status(404).json({ msg: 'Conversation not found' });
    if (chat.status === 'closed') return res.status(400).json({ msg: 'Conversation is closed' });

    // Add user message
    chat.messages.push({ sender: 'user', message: message.trim() });
    chat.lastMessageAt = new Date();

    // Try bot auto-response
    const botReply = getBotResponse(message.trim());
    if (botReply) {
      chat.messages.push({ sender: 'bot', message: botReply });
    }

    await chat.save();
    res.json({ success: true, data: chat });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Get conversation messages (public - for polling)
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

// @desc    Admin: Get all conversations
exports.getChats = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const chats = await ChatConversation.find(filter)
      .sort({ lastMessageAt: -1 })
      .skip(startIndex)
      .limit(limit);

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

// @desc    Admin: Reply to a chat conversation
exports.adminReply = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ msg: 'Message is required' });
    }

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

// @desc    Admin: Close a chat conversation
exports.closeChat = async (req, res) => {
  try {
    const chat = await ChatConversation.findByIdAndUpdate(
      req.params.id,
      { status: 'closed' },
      { new: true }
    );
    if (!chat) return res.status(404).json({ msg: 'Conversation not found' });
    res.json({ success: true, data: chat });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Admin: Delete a chat conversation
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
