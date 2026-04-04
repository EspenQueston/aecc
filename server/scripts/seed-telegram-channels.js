const mongoose = require('mongoose');
const { mongoURI } = require('../config/keys');
const TelegramChannel = require('../models/TelegramChannel');

const CHANNELS = [
  // Finances & Économie
  { name: 'Finance & Investing', description: 'Actualités financières, stratégies d\'investissement et éducation financière', url: 'https://t.me/financeinvesting', category: 'finances-economie', icon: 'fas fa-chart-line', language: 'en', featured: true },
  { name: 'Économie Africaine', description: 'Analyses et perspectives sur l\'économie africaine et les marchés émergents', url: 'https://t.me/economieafricaine', category: 'finances-economie', icon: 'fas fa-globe-africa', language: 'fr' },
  { name: 'Personal Finance Tips', description: 'Conseils pratiques de gestion de finances personnelles et d\'épargne', url: 'https://t.me/personalfinancetips', category: 'finances-economie', icon: 'fas fa-piggy-bank', language: 'en' },

  // Computer Science
  { name: 'Programming & Dev', description: 'Cours, tutoriels et ressources en programmation (Python, JS, Java, C++)', url: 'https://t.me/programmingdev', category: 'computer-science', icon: 'fas fa-code', language: 'en', featured: true },
  { name: 'AI & Machine Learning', description: 'Intelligence artificielle, deep learning et data science', url: 'https://t.me/aimachinelearning', category: 'computer-science', icon: 'fas fa-robot', language: 'en' },
  { name: 'Cybersecurity Channel', description: 'Sécurité informatique, ethical hacking et protection des données', url: 'https://t.me/cybersecurity', category: 'computer-science', icon: 'fas fa-shield-alt', language: 'en' },
  { name: 'Web Development', description: 'Développement web frontend/backend, React, Node.js, frameworks modernes', url: 'https://t.me/webdev', category: 'computer-science', icon: 'fas fa-globe', language: 'en' },

  // Droit & Law
  { name: 'Droit International', description: 'Droit international, droit des affaires et jurisprudence', url: 'https://t.me/droitinternational', category: 'droit-law', icon: 'fas fa-balance-scale', language: 'fr', featured: true },
  { name: 'Law Students Resources', description: 'Ressources académiques pour étudiants en droit, cas pratiques', url: 'https://t.me/lawstudents', category: 'droit-law', icon: 'fas fa-book-open', language: 'en' },

  // Business & Commerce
  { name: 'Import-Export Chine-Afrique', description: 'Guide pratique du commerce sino-africain, sourcing et logistique', url: 'https://t.me/importexportchineafrique', category: 'business-commerce', icon: 'fas fa-shipping-fast', language: 'fr', featured: true },
  { name: 'Entrepreneurship Hub', description: 'Startups, business plans, levée de fonds et success stories', url: 'https://t.me/entrepreneurhub', category: 'business-commerce', icon: 'fas fa-rocket', language: 'en' },
  { name: 'E-Commerce & Dropshipping', description: 'Vente en ligne, dropshipping, Amazon FBA et Alibaba', url: 'https://t.me/ecommercedrop', category: 'business-commerce', icon: 'fas fa-shopping-cart', language: 'multi' },

  // Agriculture & Élevage
  { name: 'Agriculture Moderne', description: 'Techniques agricoles modernes, agritech et agriculture durable', url: 'https://t.me/agriculturemoderne', category: 'agriculture-elevage', icon: 'fas fa-tractor', language: 'fr' },
  { name: 'Agribusiness Africa', description: 'Opportunités agrobusiness en Afrique, transformation alimentaire', url: 'https://t.me/agribusinessafrica', category: 'agriculture-elevage', icon: 'fas fa-leaf', language: 'en' },

  // Marketing & Communication
  { name: 'Digital Marketing Pro', description: 'SEO, réseaux sociaux, publicité digitale et growth hacking', url: 'https://t.me/digitalmarketingpro', category: 'marketing-communication', icon: 'fas fa-ad', language: 'en', featured: true },
  { name: 'Content Creation', description: 'Création de contenu, storytelling, branding personnel', url: 'https://t.me/contentcreation', category: 'marketing-communication', icon: 'fas fa-pen-fancy', language: 'en' },

  // Cryptomonnaie
  { name: 'Crypto Academy', description: 'Formation complète sur Bitcoin, Ethereum, DeFi et trading crypto', url: 'https://t.me/cryptoacademy', category: 'cryptomonnaie', icon: 'fab fa-bitcoin', language: 'en', featured: true },
  { name: 'Blockchain & Web3', description: 'Technologie blockchain, smart contracts, NFTs et Web3', url: 'https://t.me/blockchainweb3', category: 'cryptomonnaie', icon: 'fas fa-link', language: 'en' },

  // Sciences — sous-parties
  { name: 'Physics World', description: 'Physique fondamentale, mécanique quantique, astrophysique', url: 'https://t.me/physicsworld', category: 'sciences-physique', icon: 'fas fa-atom', language: 'en' },
  { name: 'Chemistry Channel', description: 'Chimie organique, inorganique, biochimie et laboratoire', url: 'https://t.me/chemistrychannel', category: 'sciences-chimie', icon: 'fas fa-flask', language: 'en' },
  { name: 'Biology & Life Sciences', description: 'Biologie cellulaire, génétique, écologie et biotechnologie', url: 'https://t.me/biologylifesciences', category: 'sciences-biologie', icon: 'fas fa-dna', language: 'en' },
  { name: 'Mathématiques Avancées', description: 'Algèbre, analyse, probabilités, statistiques et mathématiques appliquées', url: 'https://t.me/mathematiques', category: 'sciences-mathematiques', icon: 'fas fa-square-root-alt', language: 'fr' },
  { name: 'Medical Students', description: 'Médecine, anatomie, pharmacologie et cas cliniques', url: 'https://t.me/medicalstudents', category: 'sciences-medecine', icon: 'fas fa-stethoscope', language: 'en', featured: true },
  { name: 'Engineering Hub', description: 'Ingénierie civile, mécanique, électrique et projets pratiques', url: 'https://t.me/engineeringhub', category: 'sciences-ingenierie', icon: 'fas fa-cogs', language: 'en' },

  // Langues
  { name: 'Learn Chinese (HSK)', description: 'Préparation HSK, vocabulaire, grammaire et pratique du mandarin', url: 'https://t.me/learnchinese', category: 'langues', icon: 'fas fa-language', language: 'multi', featured: true },
  { name: 'English Learning', description: 'IELTS, TOEFL, grammaire anglaise et conversation', url: 'https://t.me/englishlearning', category: 'langues', icon: 'fas fa-comments', language: 'en' },

  // AECC
  { name: 'AECC Communauté', description: 'Groupe principal de discussion de l\'AECC — entraide et échanges', url: 'https://t.me/aecccommunaute', category: 'aecc', icon: 'fas fa-users', language: 'fr', featured: true },
  { name: 'AECC Bourses & Opportunités', description: 'Partage de bourses, stages et opportunités professionnelles', url: 'https://t.me/aeccbourses', category: 'aecc', icon: 'fas fa-gift', language: 'fr' },
  { name: 'AECC Annonces', description: 'Annonces officielles, événements et communications du bureau', url: 'https://t.me/aeccannonces', category: 'aecc', icon: 'fas fa-bullhorn', language: 'fr' },
];

async function seed() {
  await mongoose.connect(mongoURI);
  console.log('Connected to MongoDB');

  const existing = await TelegramChannel.countDocuments();
  if (existing > 0) {
    console.log(`${existing} channels already exist. Clearing...`);
    await TelegramChannel.deleteMany({});
  }

  await TelegramChannel.insertMany(CHANNELS);
  console.log(`Inserted ${CHANNELS.length} Telegram channels`);

  await mongoose.disconnect();
  console.log('Done');
}

seed().catch(err => { console.error(err); process.exit(1); });
