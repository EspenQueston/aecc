const mongoose = require('mongoose');
const config = require('../config/keys');
const LearningResource = require('../models/LearningResource');

const RESOURCES = [
  // ── Formations ──
  {
    type: 'formation', title: 'Chinois Mandarin (HSK)',
    description: 'Préparez vos examens HSK avec des ressources complètes.',
    url: 'https://www.chinesetest.cn', icon: 'fas fa-language',
    color: '#B7222D', level: 'tous-niveaux', slug: 'chinois-mandarin', order: 1,
    longDescription: "Le HSK (Hanyu Shuiping Kaoshi) est l'examen de compétence en chinois mandarin reconnu internationalement. Ce site officiel fournit tout ce dont vous avez besoin pour vous préparer aux niveaux 1 à 6.\n\nVous y trouverez des examens blancs, du vocabulaire officiel, et la possibilité de vous inscrire aux sessions d'examen.",
    advantages: ['Plateforme officielle du HSK', 'Examens blancs gratuits disponibles', 'Inscription en ligne aux sessions d\'examen', 'Vocabulaire officiel par niveau', 'Résultats consultables en ligne'],
    disadvantages: ['Interface parfois en chinois uniquement', 'Navigation peu intuitive', 'Peu de cours interactifs disponibles'],
    details: ['Les niveaux vont de HSK 1 (150 mots) à HSK 6 (5000+ mots)', 'Certaines universités exigent HSK 4 ou 5 pour l\'admission', 'Les sessions d\'examen ont lieu environ chaque mois', 'Le certificat HSK est valable 2 ans']
  },
  {
    type: 'formation', title: 'Compétences Numériques',
    description: 'Programmation, design et outils numériques essentiels.',
    url: 'https://www.freecodecamp.org', icon: 'fas fa-laptop-code',
    color: '#2563eb', level: 'debutant', slug: 'competences-numeriques', order: 2,
    longDescription: "freeCodeCamp est une plateforme gratuite et open-source qui offre des cours de programmation et de développement web. C'est l'une des meilleures ressources pour apprendre à coder de zéro.\n\nDes milliers d'étudiants à travers le monde l'utilisent pour se former aux métiers du numérique.",
    advantages: ['100% gratuit et open-source', 'Certificats reconnus par les employeurs', 'Projets pratiques à chaque étape', 'Communauté très active et bienveillante', 'Parcours structurés du débutant à l\'avancé'],
    disadvantages: ['Contenu principalement en anglais', 'Pas de suivi personnalisé par un tuteur', 'Certains sujets avancés non couverts'],
    details: ['Couvre HTML, CSS, JavaScript, Python, et plus', 'Chaque certification nécessite ~300 heures de travail', 'Forum d\'entraide disponible', 'Les projets réalisés peuvent servir de portfolio']
  },
  {
    type: 'formation', title: 'Développement Professionnel',
    description: 'CV, entretiens, réseautage et recherche de stage.',
    url: 'https://www.linkedin.com/learning', icon: 'fas fa-briefcase',
    color: '#059669', level: 'intermediaire', slug: 'developpement-professionnel', order: 3,
    longDescription: "LinkedIn Learning propose des cours de qualité professionnelle sur le développement de carrière, le leadership, et les softs skills essentiels pour réussir sur le marché du travail.\n\nAvec un compte LinkedIn, vous avez souvent accès à un mois d'essai gratuit.",
    advantages: ['Cours dispensés par des experts du domaine', 'Certificats ajoutables à votre profil LinkedIn', 'Large catalogue (16000+ cours)', 'Accessible sur mobile et desktop', 'Sous-titres en plusieurs langues'],
    disadvantages: ['Abonnement payant après la période d\'essai', 'Contenu pas toujours adapté au contexte africain', 'Nécessite une bonne connexion Internet'],
    details: ['1 mois d\'essai gratuit souvent disponible', 'Les certificats sont reconnus par les recruteurs', 'Les cours durent en moyenne 1 à 3 heures', 'Disponible via certaines universités chinoises']
  },
  {
    type: 'formation', title: 'Entrepreneuriat',
    description: 'Business plan, marketing digital et e-commerce.',
    url: 'https://www.coursera.org', icon: 'fas fa-chart-line',
    color: '#d97706', level: 'avance', slug: 'entrepreneuriat', order: 4,
    longDescription: "Coursera offre des cours d'universités renommées (Stanford, Yale, HEC) sur l'entrepreneuriat, le marketing digital et la gestion d'entreprise.\n\nBeaucoup de cours permettent l'audit gratuit, et des aides financières sont disponibles pour les certificats.",
    advantages: ['Cours d\'universités prestigieuses', 'Aide financière disponible sur demande', 'Audit gratuit de la plupart des cours', 'Spécialisations complètes en entrepreneuriat', 'Diplômes en ligne reconnus'],
    disadvantages: ['Les certificats sont payants', 'Rythme parfois intense', 'Certains cours ne sont pas en français'],
    details: ['Aide financière couvre 100% des frais', 'Les spécialisations prennent 3 à 6 mois', 'Possibilité de diplômes de Master complets', 'Partenariats avec Google, IBM, Meta']
  },
  {
    type: 'formation', title: 'Rédaction Académique',
    description: 'Mémoires, thèses et articles scientifiques.',
    url: 'https://www.edx.org', icon: 'fas fa-book-open',
    color: '#7c3aed', level: 'tous-niveaux', slug: 'redaction-academique', order: 5,
    longDescription: "edX propose des cours gratuits sur la rédaction scientifique et académique, fournis par des universités partenaires comme Harvard, MIT et l'université de Michigan.\n\nCes cours vous aideront à structurer vos mémoires, thèses et articles de recherche selon les normes internationales.",
    advantages: ['Cours de Harvard et MIT gratuits (audit)', 'Méthodologie de recherche structurée', 'Outils pratiques pour la rédaction', 'Modules sur la citation et bibliographie'],
    disadvantages: ['Certificats vérifiés payants', 'Contenu principalement en anglais', 'Pas de correction de travaux personnels'],
    details: ['Couvre APA, MLA, et styles de citation chinois', 'Cours de statistiques pour la recherche disponibles', 'Recommandé dès le Master 1', 'Complémentaire aux cours de votre université']
  },
  {
    type: 'formation', title: 'Relations Sino-Africaines',
    description: 'Commerce, diplomatie et opportunités Chine-Afrique.',
    url: 'https://www.focac.org', icon: 'fas fa-globe-africa',
    color: '#e11d48', level: 'intermediaire', slug: 'relations-sino-africaines', order: 6,
    longDescription: "Le Forum sur la Coopération Sino-Africaine (FOCAC) est la plateforme officielle de la coopération Chine-Afrique. Ce site donne accès aux déclarations, plans d'action et opportunités de collaboration.\n\nComprendre le FOCAC est essentiel pour tout étudiant africain en Chine souhaitant exploiter les opportunités de cette coopération.",
    advantages: ['Source officielle d\'information sur la coopération', 'Documents et déclarations en français', 'Informations sur les bourses et échanges', 'Accès aux plans d\'action triannuels'],
    disadvantages: ['Site parfois lent à charger', 'Mises à jour irrégulières', 'Interface datée'],
    details: ['Le FOCAC se réunit tous les 3 ans', 'Inclut 53 pays africains et la Chine', 'Couvre commerce, éducation, santé, infrastructure', 'Le dernier sommet date de 2024 (Beijing)']
  },

  // ── YouTube ──
  {
    type: 'youtube', title: 'ChineseClass101',
    description: 'Cours de chinois structurés', url: 'https://www.youtube.com/@ChineseClass101',
    icon: 'fab fa-youtube', color: '#dc2626', order: 1,
    longDescription: "ChineseClass101 propose des leçons vidéo structurées pour apprendre le chinois mandarin. Les vidéos couvrent la prononciation, la grammaire, le vocabulaire et la culture chinoise.\n\nLa chaîne est idéale pour les débutants complets et les niveaux intermédiaires.",
    advantages: ['Leçons courtes et faciles à suivre (5-15 min)', 'Prononciation claire par des natifs', 'Sous-titres en anglais et chinois', 'Mise à jour régulière avec du nouveau contenu'],
    disadvantages: ['Le contenu avancé est sur l\'app payante', 'Pas de sous-titres en français', 'Publicités fréquentes sur YouTube'],
    details: ['Plus de 1000 vidéos gratuites', 'L\'app offre 7 jours d\'essai gratuit', 'Idéal pour préparer HSK 1-3', 'Séries thématiques: voyages, business, vie quotidienne']
  },
  {
    type: 'youtube', title: 'Mandarin Corner',
    description: 'Conversations réelles et vocabulaire', url: 'https://www.youtube.com/@MandarinCorner',
    icon: 'fab fa-youtube', color: '#dc2626', order: 2,
    longDescription: "Mandarin Corner se distingue par ses vidéos de conversations authentiques filmées dans la rue et dans des situations réelles en Chine.\n\nChaque vidéo inclut les sous-titres en pinyin, caractères et anglais, ce qui est parfait pour améliorer la compréhension orale.",
    advantages: ['Conversations authentiques et naturelles', 'Sous-titres trilingues (pinyin/caractères/anglais)', 'Découverte de la culture chinoise réelle', 'Contenu unique et immersif'],
    disadvantages: ['Rythme parfois rapide pour débutants', 'Pas de cours de grammaire structurés', 'Contenu en anglais uniquement'],
    details: ['Vidéos filmées dans différentes villes chinoises', 'PDF de vocabulaire souvent disponibles', 'Recommandé à partir du niveau HSK 3', 'Les interviews de rue sont très populaires']
  },
  {
    type: 'youtube', title: 'Chinese Zero to Hero',
    description: 'Programme complet HSK 1-6', url: 'https://www.youtube.com/@ChineseZerotoHero',
    icon: 'fab fa-youtube', color: '#dc2626', order: 3,
    longDescription: "Chinese Zero to Hero offre un programme d'apprentissage complet et structuré suivant le curriculum HSK de 1 à 6.\n\nLa chaîne est tenue par un couple sino-canadien qui rend l'apprentissage du chinois accessible et amusant.",
    advantages: ['Programme structuré niveau par niveau', 'Explications claires et pédagogiques', 'Exercices pratiques intégrés', 'Suivi du curriculum HSK officiel'],
    disadvantages: ['Le programme complet est payant sur leur site', 'Progression lente pour les avancés', 'Vidéos longues (30-45 min)'],
    details: ['Couvre intégralement HSK 1 à 6', 'Le site web offre des exercices interactifs', 'Recommandé comme complément aux cours universitaires', 'Les vidéos HSK 1-2 sont entièrement gratuites']
  },
  {
    type: 'youtube', title: 'Yoyo Chinese',
    description: 'Vidéos courtes et pratiques', url: 'https://www.youtube.com/@YoyoChinese',
    icon: 'fab fa-youtube', color: '#dc2626', order: 4,
    longDescription: "Yoyo Chinese propose des vidéos courtes et dynamiques, idéales pour apprendre des expressions pratiques et du vocabulaire du quotidien.\n\nLa fondatrice, Yangyang, est connue pour son style d'enseignement clair et engageant.",
    advantages: ['Vidéos courtes et digestes (3-10 min)', 'Style d\'enseignement engageant', 'Focus sur le chinois pratique du quotidien', 'Explications culturelles intégrées'],
    disadvantages: ['Le cours complet est payant', 'Moins de contenu grammatical approfondi', 'Pas de sous-titres en français'],
    details: ['Plus de 500 vidéos gratuites sur YouTube', 'L\'app propose un test de niveau gratuit', 'Idéal pour les tout débutants', 'Séries populaires: grammaire, tons, caractères']
  },

  // ── Liens Utiles ──
  {
    type: 'useful-link', title: 'ScholarQuest (Bizkeyz)',
    description: 'Recherche de bourses internationales', url: 'https://bizkeyz.com',
    icon: 'fas fa-search', color: '#2563eb', highlight: true, featured: true, order: 1,
    longDescription: "ScholarQuest (Bizkeyz) est une plateforme africaine dédiée à la recherche de bourses d'études internationales. Elle centralise les opportunités de financement pour les étudiants africains.\n\nLa plateforme couvre les bourses CSC, les bourses européennes, et bien d'autres programmes de financement.",
    advantages: ['Moteur de recherche dédié aux bourses', 'Informations actualisées régulièrement', 'Focus sur les étudiants africains', 'Guide étape par étape pour les candidatures', 'Newsletter avec les nouvelles opportunités'],
    disadvantages: ['Certaines informations peuvent être en retard', 'Pas toutes les bourses sont couvertes', 'Interface en cours d\'amélioration'],
    details: ['Couvre les bourses dans 50+ pays', 'Section spéciale pour les bourses en Chine', 'Conseils pour les lettres de motivation', 'Communauté active sur les réseaux sociaux']
  },
  {
    type: 'useful-link', title: 'CSC (China Scholarship)',
    description: 'Bourses du gouvernement chinois', url: 'https://www.csc.edu.cn',
    icon: 'fas fa-graduation-cap', color: '#dc2626', order: 2,
    longDescription: "Le China Scholarship Council (CSC) gère les bourses du gouvernement chinois, le plus grand programme de bourses pour les étudiants internationaux en Chine.\n\nCe programme couvre les frais de scolarité, l'hébergement, l'assurance médicale et offre une allocation mensuelle.",
    advantages: ['Bourse complète (scolarité + logement + allocation)', 'Allocation mensuelle de 2500-3500 CNY', 'Assurance médicale incluse', 'Accessible pour Licence, Master et Doctorat'],
    disadvantages: ['Très compétitif (taux d\'acceptation ~20%)', 'Processus de candidature complexe', 'Délais stricts à respecter', 'Site web parfois difficile à naviguer'],
    details: ['Candidatures ouvertes de janvier à avril', 'Nécessite souvent une lettre d\'admission préalable', 'Le HSK n\'est pas toujours obligatoire pour postuler', 'Plus de 280 universités participantes']
  },
  {
    type: 'useful-link', title: 'CUCAS',
    description: 'Admission universités chinoises', url: 'https://www.cucas.cn',
    icon: 'fas fa-university', color: '#7c3aed', order: 3,
    longDescription: "CUCAS (China's University and College Admission System) est un portail officiel facilitant l'admission des étudiants internationaux dans les universités chinoises.\n\nIl simplifie le processus de candidature en permettant de postuler à plusieurs universités via une seule plateforme.",
    advantages: ['Candidature en ligne simplifiée', 'Plus de 300 universités référencées', 'Possibilité de postuler sans intermédiaire', 'Service client réactif en anglais'],
    disadvantages: ['Frais de service pour certaines candidatures', 'Pas toutes les universités sont incluses', 'Certaines informations non mises à jour'],
    details: ['Couvre les programmes en chinois et en anglais', 'Offre des services de traduction', 'Aide au choix de programme', 'Partenaire officiel de nombreuses universités']
  },
  {
    type: 'useful-link', title: 'HSK Online',
    description: 'Inscriptions et résultats HSK', url: 'https://www.chinesetest.cn',
    icon: 'fas fa-file-alt', color: '#059669', order: 4,
    longDescription: "Le site officiel du HSK (Hanyu Shuiping Kaoshi) permet de s'inscrire aux examens, consulter les résultats et télécharger les certificats.\n\nC'est la référence incontournable pour tout étudiant préparant un examen de compétence en chinois.",
    advantages: ['Site officiel du HSK', 'Inscription en ligne rapide', 'Résultats disponibles sous 1 mois', 'Examens blancs HSK disponibles gratuitement'],
    disadvantages: ['Interface en chinois par défaut', 'Le paiement en ligne ne fonctionne pas toujours', 'Navigation complexe pour les nouveaux utilisateurs'],
    details: ['Examens HSK 1-6 et HSKK (oral)', 'Sessions d\'examen presque chaque mois', 'Les résultats sont valables 2 ans', 'Certaines universités organisent aussi des sessions']
  },
  {
    type: 'useful-link', title: 'Pleco Dictionary',
    description: 'Dictionnaire chinois mobile', url: 'https://www.pleco.com',
    icon: 'fas fa-book', color: '#d97706', order: 5,
    longDescription: "Pleco est considéré comme le meilleur dictionnaire chinois-anglais gratuit sur mobile. L'application offre la reconnaissance de caractères par caméra, la recherche par pinyin et par radical.\n\nC'est un outil indispensable pour tout étudiant en Chine, que ce soit en cours ou dans la vie quotidienne.",
    advantages: ['Application gratuite et très complète', 'Reconnaissance de caractères par caméra', 'Fonctionne hors ligne', 'Prononciation audio des mots', 'Flashcards intégrées pour la mémorisation'],
    disadvantages: ['Les modules avancés sont payants', 'Pas de dictionnaire chinois-français intégré', 'Interface un peu datée'],
    details: ['Disponible sur iOS et Android', 'Le module OCR est un achat in-app', 'Recommandé par la majorité des profs de chinois', 'Le dictionnaire de base contient 130 000+ entrées']
  },
];

async function seed() {
  try {
    await mongoose.connect(config.mongoURI);
    console.log('Connected to MongoDB');

    // Clear existing resources
    await LearningResource.deleteMany({});
    console.log('Cleared existing learning resources');

    // Insert new resources
    await LearningResource.insertMany(RESOURCES);
    console.log(`Inserted ${RESOURCES.length} learning resources (${RESOURCES.filter(r => r.type === 'formation').length} formations, ${RESOURCES.filter(r => r.type === 'youtube').length} YouTube, ${RESOURCES.filter(r => r.type === 'useful-link').length} links)`);

    console.log('Done');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
