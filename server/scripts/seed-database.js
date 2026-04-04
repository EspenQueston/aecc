const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/congolese-students-china';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected');

    const User = require('../models/User');
    const Event = require('../models/Event');
    const Resource = require('../models/Resource');
    const FAQ = require('../models/FAQ');
    const Post = require('../models/wordpress/Post');
    const Term = require('../models/wordpress/Term');
    const TermTaxonomy = require('../models/wordpress/TermTaxonomy');
    const TermRelationship = require('../models/wordpress/TermRelationship');

    // Get admin user as author
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('❌ No admin user found. Run reset-admin.js first.');
      process.exit(1);
    }
    const authorId = admin._id;
    console.log(`Using admin: ${admin.email}`);

    // =========================================
    // SEED FAQ
    // =========================================
    await FAQ.deleteMany({});
    const faqs = await FAQ.insertMany([
      { question: 'Comment rejoindre l\'AECC ?', answer: 'Créez un compte sur notre plateforme en remplissant le formulaire d\'inscription. L\'adhésion est ouverte à tout étudiant congolais (République du Congo) régulier en Chine ayant accepté les buts et Statuts de l\'Association. Les frais d\'adhésion sont de 50 RMB (10 RMB pour la carte de membre + 40 RMB pour l\'uniforme).', category: 'membership', order: 1 },
      { question: 'L\'AECC est-elle présente dans ma ville ?', answer: 'L\'AECC couvre toutes les 31 provinces de Chine avec des représentants dans les principales villes universitaires : Beijing, Shanghai, Guangzhou, Wuhan, Chengdu, Nanjing, Hangzhou, Xi\'an, Changsha, Shenyang, Harbin et Dalian. Si votre ville n\'a pas encore de représentant, vous pouvez vous porter volontaire !', category: 'membership', order: 2 },
      { question: 'Comment participer aux événements ?', answer: 'Consultez notre page Événements pour voir les activités à venir. Les membres inscrits reçoivent des notifications par email et WeChat. Vous pouvez également rejoindre nos groupes Telegram pour être informé en temps réel.', category: 'events', order: 3 },
      { question: 'Comment obtenir de l\'aide pour une urgence ?', answer: 'Contactez-nous immédiatement via WeChat (AECC_Official) ou par email à contact@aecc.org. L\'AECC dispose d\'un fonds de solidarité pour aider les membres en situation d\'urgence (problèmes médicaux, financiers ou administratifs).', category: 'general', order: 4 },
      { question: 'Quelles bourses sont disponibles pour les étudiants congolais ?', answer: 'Plusieurs types de bourses sont accessibles : la bourse CSC (Chinese Government Scholarship), les bourses provinciales, les bourses universitaires et la bourse du gouvernement congolais. Consultez notre section Ressources pour plus de détails et les dates limites de candidature.', category: 'scholarships', order: 5 },
      { question: 'Comment postuler à la bourse CSC ?', answer: 'La bourse CSC nécessite une candidature via le site officiel du China Scholarship Council (csc.edu.cn). Les documents requis incluent : formulaire de candidature, relevés de notes, diplômes, plan d\'études, lettres de recommandation et certificat médical. L\'AECC organise des ateliers annuels pour aider les candidats.', category: 'scholarships', order: 6 },
      { question: 'L\'adhésion à l\'AECC est-elle payante ?', answer: 'Oui, conformément à l\'Article 9 des Statuts, l\'adhésion est payante et se fait librement et volontairement auprès du bureau de la ville. Le montant est de 50 RMB dont 10 RMB pour la carte de membre et 40 RMB pour l\'uniforme de l\'Association (obligatoire). La cotisation statutaire mensuelle est de 10 RMB.', category: 'membership', order: 7 },
      { question: 'Comment puis-je contribuer à l\'AECC ?', answer: 'Vous pouvez contribuer de plusieurs façons : devenir représentant dans votre ville, organiser des événements locaux, partager des ressources éducatives, participer au mentorat des nouveaux arrivants, ou proposer des articles pour notre blog.', category: 'general', order: 8 },
      { question: 'Comment transférer de l\'argent entre la Chine et le Congo ?', answer: 'Plusieurs options sont disponibles : WeChat Pay, Alipay, transferts bancaires internationaux (ICBC, Bank of China), et services comme Western Union ou WorldRemit. Consultez notre guide dans la section Ressources pour comparer les frais et délais.', category: 'administrative', order: 9 },
      { question: 'Comment renouveler mon visa étudiant ?', answer: 'Le renouvellement du visa étudiant (X1/X2) se fait via le bureau des affaires étrangères (Entry-Exit Administration) de votre ville. Documents nécessaires : passeport, JW201/202, formulaire d\'inscription universitaire, photos et formulaire de demande. Commencez les démarches au moins 30 jours avant l\'expiration.', category: 'administrative', order: 10 },
      { question: 'Comment préparer l\'examen HSK ?', answer: 'L\'AECC recommande plusieurs ressources : les chaînes YouTube (ChineseClass101, Mandarin Corner), l\'application Pleco, les manuels Standard Course HSK, et les sessions d\'étude en groupe organisées par notre communauté. Consultez notre page Apprentissage pour plus de détails.', category: 'academic', order: 11 },
      { question: 'Que faire en cas de problème avec mon université ?', answer: 'Contactez d\'abord le bureau des affaires internationales de votre université. Si le problème persiste, l\'AECC peut intervenir en tant que médiateur. Nous avons des contacts dans plusieurs universités et pouvons vous accompagner dans vos démarches.', category: 'academic', order: 12 },
    ]);
    console.log(`✅ ${faqs.length} FAQ items seeded`);

    // =========================================
    // SEED EVENTS
    // =========================================
    await Event.deleteMany({});
    const now = new Date();
    const events = await Event.insertMany([
      {
        title: 'Gala Annuel de l\'AECC 2026',
        description: 'Rejoignez-nous pour le gala annuel de l\'Association des Étudiants Congolais en Chine ! Une soirée inoubliable de célébration, de networking et de reconnaissance des réalisations de notre communauté. Au programme : discours, performances musicales, repas congolais et remise de prix d\'excellence académique.',
        location: 'Beijing International Hotel, Salle de bal principale',
        startDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
        type: 'cultural',
        organizer: authorId
      },
      {
        title: 'Atelier : Préparer sa candidature CSC 2027',
        description: 'Atelier pratique pour guider les étudiants dans la préparation de leur dossier de candidature à la bourse du gouvernement chinois (CSC). Sujets couverts : rédaction du plan d\'études, lettres de recommandation, choix des universités et conseils des boursiers actuels.',
        location: 'Zoom (en ligne)',
        startDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        type: 'academic',
        organizer: authorId
      },
      {
        title: 'Tournoi de Football Inter-Villes',
        description: 'Le tournoi annuel de football rassemblant les équipes des principales villes chinoises. Venez supporter votre ville ! Catégories : hommes et femmes. Inscriptions ouvertes jusqu\'au 15 mai. Lots et trophées pour les gagnants.',
        location: 'Guangzhou Sports Center',
        startDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 47 * 24 * 60 * 60 * 1000),
        type: 'cultural',
        organizer: authorId
      },
      {
        title: 'Séminaire : Réussir sa thèse en Chine',
        description: 'Des doctorants et professeurs partagent leurs conseils pour réussir sa recherche et sa soutenance de thèse dans les universités chinoises. Discussion sur la méthodologie de recherche, la publication d\'articles et la collaboration avec les directeurs de thèse chinois.',
        location: 'Wuhan University, Salle de conférences B301',
        startDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        type: 'seminar',
        organizer: authorId
      },
      {
        title: 'Networking : Carrières après la Chine',
        description: 'Table ronde avec des alumni qui ont réussi leur insertion professionnelle après leurs études en Chine. Secteurs couverts : tech, commerce international, diplomatie, entrepreneuriat. Occasion unique de créer des connexions professionnelles.',
        location: 'Shanghai Jiao Tong University, Innovation Center',
        startDate: new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        type: 'networking',
        organizer: authorId
      },
      {
        title: 'Accueil des Nouveaux Étudiants - Rentrée 2026',
        description: 'Session d\'orientation pour les étudiants congolais nouvellement arrivés en Chine. Au programme : conseils pratiques sur la vie quotidienne, ouverture de compte bancaire, carte SIM, transport public, et présentation des services de l\'AECC.',
        location: 'Beijing Language and Culture University, Auditorium A',
        startDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        type: 'workshop',
        organizer: authorId
      },
      {
        title: 'Fête de l\'Indépendance du Congo',
        description: 'Célébration de l\'indépendance de la République du Congo ! Rejoignez-nous pour une journée de festivités : danses traditionnelles, musique congolaise, plats typiques (saka-saka, pondu, mikate) et discours patriotiques.',
        location: 'Nanjing African Students Center',
        startDate: new Date(now.getTime() + 75 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 75 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
        type: 'cultural',
        organizer: authorId
      },
      {
        title: 'Workshop : WeChat Pay & Alipay pour débutants',
        description: 'Atelier pratique pour apprendre à configurer et utiliser WeChat Pay et Alipay au quotidien en Chine. Inclut : liaison de carte bancaire, paiements QR, transferts entre amis et mini-programmes utiles.',
        location: 'Chengdu, Sichuan University (Salle 205)',
        startDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        type: 'workshop',
        organizer: authorId
      },
    ]);
    console.log(`✅ ${events.length} events seeded`);

    // =========================================
    // SEED RESOURCES
    // =========================================
    await Resource.deleteMany({});
    const resources = await Resource.insertMany([
      { title: 'Guide complet de la bourse CSC', description: 'Document détaillé expliquant toutes les étapes pour postuler à la bourse du gouvernement chinois, incluant les documents nécessaires, les critères de sélection et les conseils des boursiers.', type: 'Document', category: 'Scholarship', externalUrl: 'https://www.csc.edu.cn', user: authorId },
      { title: 'Liste des universités chinoises acceptant les étudiants congolais', description: 'Répertoire complet des universités partenaires en Chine avec leurs programmes, conditions d\'admission et contacts.', type: 'Document', category: 'Academic', externalUrl: 'https://www.cucas.cn', user: authorId },
      { title: 'Guide de survie en Chine pour les nouveaux arrivants', description: 'Tout ce qu\'il faut savoir pour bien commencer sa vie en Chine : transport, logement, nourriture, communication, santé et culture.', type: 'Tutorial', category: 'General', externalUrl: '#', user: authorId },
      { title: 'HSK Standard Course - Niveau 1 à 6', description: 'Ressources d\'apprentissage du chinois mandarin suivant le programme officiel HSK. Vocabulaire, grammaire et exercices pour chaque niveau.', type: 'Course', category: 'Academic', externalUrl: 'https://www.chinesetest.cn', user: authorId },
      { title: 'Comment rédiger un CV international', description: 'Guide pratique pour créer un CV adapté au marché du travail chinois et international. Modèles et exemples inclus.', type: 'Tutorial', category: 'Career', externalUrl: '#', user: authorId },
      { title: 'Groupe Telegram AECC Communauté', description: 'Rejoignez notre groupe principal de discussion. Échanges, entraide et actualités en temps réel pour toute la communauté.', type: 'Telegram', category: 'General', externalUrl: 'https://t.me/aecc_community', user: authorId },
      { title: 'Groupe Telegram Bourses & Opportunités', description: 'Canal dédié au partage de bourses d\'études, stages, emplois et opportunités professionnelles pour les étudiants congolais.', type: 'Telegram', category: 'Scholarship', externalUrl: 'https://t.me/aecc_scholarships', user: authorId },
      { title: 'ScholarQuest - Recherche de bourses', description: 'Plateforme de recherche de bourses d\'études internationales. Filtrez par pays, domaine d\'études et niveau académique.', type: 'External Link', category: 'Scholarship', externalUrl: 'https://bizkeyz.com', user: authorId },
      { title: 'Guide des transferts d\'argent Congo-Chine', description: 'Comparatif des méthodes de transfert d\'argent entre la Chine et le Congo : frais, délais, limites et conseils pour économiser.', type: 'Tutorial', category: 'Administrative', externalUrl: '#', user: authorId },
      { title: 'Procédure de renouvellement de visa étudiant', description: 'Guide étape par étape pour renouveler votre visa X1 ou X2 en Chine. Documents nécessaires, délais et bureaux compétents.', type: 'Document', category: 'Administrative', externalUrl: '#', user: authorId },
      { title: 'Offres d\'emploi pour étudiants africains en Chine', description: 'Liste actualisée des entreprises chinoises et internationales qui recrutent des talents africains. Stages et emplois à temps partiel.', type: 'External Link', category: 'Employment', externalUrl: '#', user: authorId },
      { title: 'Apprendre le chinois avec Pleco', description: 'Le meilleur dictionnaire chinois-français-anglais sur mobile. Inclut la reconnaissance de caractères, la prononciation et des flashcards.', type: 'External Link', category: 'Academic', externalUrl: 'https://www.pleco.com', user: authorId },
    ]);
    console.log(`✅ ${resources.length} resources seeded`);

    // =========================================
    // SEED BLOG POSTS (WordPress-style)
    // =========================================
    // First, create categories
    await Term.deleteMany({});
    await TermTaxonomy.deleteMany({});
    await TermRelationship.deleteMany({});
    await Post.deleteMany({});

    const categoryNames = ['Actualités', 'Vie Étudiante', 'Bourses', 'Culture', 'Conseils', 'Témoignages'];
    const terms = [];
    const taxonomies = [];

    for (const name of categoryNames) {
      const term = await Term.create({ name, slug: name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-') });
      const taxonomy = await TermTaxonomy.create({ term_id: term._id, taxonomy: 'category', description: `Articles de la catégorie ${name}` });
      terms.push(term);
      taxonomies.push(taxonomy);
    }
    console.log(`✅ ${terms.length} blog categories created`);

    const blogPosts = [
      {
        title: 'Bienvenue sur le nouveau site de l\'AECC',
        content: '<p>Nous sommes ravis de vous présenter le nouveau site web de l\'Association des Étudiants Congolais en Chine ! Cette plateforme a été conçue pour mieux servir notre communauté.</p><h3>Nouvelles fonctionnalités</h3><ul><li><strong>Profils étudiants</strong> — Créez votre profil et rejoignez la communauté</li><li><strong>Événements</strong> — Découvrez et inscrivez-vous aux activités de l\'AECC</li><li><strong>Ressources</strong> — Accédez à des guides, tutoriels et documents utiles</li><li><strong>Blog</strong> — Suivez les actualités et témoignages de notre communauté</li></ul><p>N\'hésitez pas à explorer le site et à nous faire part de vos suggestions pour l\'améliorer !</p>',
        excerpt: 'Découvrez le nouveau site de l\'AECC avec ses fonctionnalités dédiées aux étudiants congolais en Chine.',
        categoryIndex: 0, status: 'publish'
      },
      {
        title: 'Guide complet : Postuler à la bourse CSC 2026-2027',
        content: '<p>La bourse du gouvernement chinois (CSC) est l\'une des bourses les plus convoitées pour les étudiants internationaux. Voici un guide détaillé pour maximiser vos chances.</p><h3>Étapes de candidature</h3><ol><li><strong>Choisir une université</strong> — Consultez la liste des universités partenaires sur cucas.cn</li><li><strong>Préparer les documents</strong> — CV, lettres de recommandation, plan d\'études, relevés de notes</li><li><strong>Soumettre en ligne</strong> — Via le portail CSC (campuschina.org)</li><li><strong>Obtenir une lettre d\'admission</strong> — Contactez directement les universités</li></ol><h3>Conseils importants</h3><p>Commencez votre candidature au moins 3 mois avant la date limite. Faites relire votre plan d\'études par un professeur. Préparez les certifications HSK si possible.</p><p><strong>Date limite :</strong> Généralement entre janvier et avril de chaque année.</p>',
        excerpt: 'Toutes les étapes et conseils pour réussir votre candidature à la bourse CSC.',
        categoryIndex: 2, status: 'publish'
      },
      {
        title: 'Mon premier semestre à l\'Université de Pékin : témoignage',
        content: '<p>Je m\'appelle Sarah, étudiante en Master de Relations Internationales à l\'Université de Pékin. Voici mon expérience après un semestre.</p><h3>L\'arrivée</h3><p>Les premiers jours étaient intimidants. La barrière linguistique, le décalage culturel et l\'éloignement de la famille sont les défis majeurs. Heureusement, l\'AECC m\'a connectée avec d\'autres étudiants congolais qui m\'ont guidée.</p><h3>La vie académique</h3><p>Les cours sont exigeants mais passionnants. Les professeurs sont accessibles et encouragent la participation. La bibliothèque est ouverte 24h/24. J\'ai rejoint un groupe de recherche qui travaille sur les relations sino-africaines.</p><h3>Conseils aux futurs étudiants</h3><ul><li>Apprenez les bases du chinois avant d\'arriver</li><li>Rejoignez l\'AECC dès votre arrivée</li><li>Explorez la ville et la culture locale</li><li>Restez connecté avec votre famille via WeChat</li></ul>',
        excerpt: 'Témoignage d\'une étudiante congolaise sur sa première expérience à l\'Université de Pékin.',
        categoryIndex: 5, status: 'publish'
      },
      {
        title: '5 applications indispensables pour vivre en Chine',
        content: '<p>La Chine a son propre écosystème numérique. Voici les 5 applications que tout étudiant doit installer dès son arrivée.</p><h3>1. WeChat (微信)</h3><p>L\'application tout-en-un : messagerie, paiement, services publics. Indispensable pour communiquer et payer partout en Chine.</p><h3>2. Alipay (支付宝)</h3><p>Alternative à WeChat Pay avec plus de fonctionnalités bancaires. Permet aussi de commander des taxis et de la nourriture.</p><h3>3. Baidu Maps (百度地图)</h3><p>Le Google Maps chinois. Bien plus précis que Google Maps en Chine pour la navigation et les transports en commun.</p><h3>4. Pleco</h3><p>Le meilleur dictionnaire chinois-anglais-français. Reconnaissance de caractères par caméra, flashcards et OCR.</p><h3>5. Taobao (淘宝)</h3><p>Le géant du e-commerce. Trouvez tout ce dont vous avez besoin à des prix compétitifs avec livraison rapide.</p>',
        excerpt: 'Les 5 applications essentielles pour tout étudiant vivant en Chine.',
        categoryIndex: 4, status: 'publish'
      },
      {
        title: 'Célébration de la Fête Nationale du Congo à Beijing',
        content: '<p>Le 15 août dernier, la communauté congolaise de Beijing s\'est rassemblée pour célébrer la Fête de l\'Indépendance. Retour sur une journée mémorable.</p><h3>La cérémonie officielle</h3><p>La journée a commencé par un discours du Président de l\'AECC, rappelant l\'importance de notre identité culturelle même loin de chez nous. L\'Ambassade du Congo a également participé.</p><h3>Les festivités</h3><p>Au programme : musique live (rumba congolaise, ndombolo), démonstrations de danse traditionnelle, exposition d\'art congolais et un buffet de spécialités congolaises préparées par les étudiants.</p><p>Plus de 200 étudiants de différentes villes de Chine ont participé à cet événement. Un moment de fierté et de solidarité pour notre communauté.</p>',
        excerpt: 'Retour sur la célébration de la Fête Nationale du Congo organisée par l\'AECC à Beijing.',
        categoryIndex: 3, status: 'publish'
      },
      {
        title: 'Comment trouver un stage en Chine : guide pratique',
        content: '<p>Trouver un stage en Chine peut sembler compliqué, mais avec les bonnes stratégies, c\'est tout à fait possible. Voici nos conseils.</p><h3>Où chercher ?</h3><ul><li><strong>LinkedIn</strong> — De nombreuses entreprises internationales publient des offres</li><li><strong>Boss直聘 (Zhipin)</strong> — La plateforme d\'emploi la plus populaire en Chine</li><li><strong>Forum de votre université</strong> — Les bureaux de carrière organisent des salons</li><li><strong>Réseau AECC</strong> — Nos alumni partagent régulièrement des opportunités</li></ul><h3>Préparer sa candidature</h3><p>Adaptez votre CV au format chinois (photo, date de naissance). Rédigez votre lettre de motivation en anglais ET en chinois si possible. Mettez en avant vos compétences multilingues (français, anglais, chinois).</p><h3>Le permis de travail</h3><p>Les étudiants étrangers peuvent effectuer des stages avec une autorisation de leur université. Renseignez-vous auprès du bureau des affaires internationales.</p>',
        excerpt: 'Stratégies et conseils pour décrocher un stage dans une entreprise en Chine.',
        categoryIndex: 4, status: 'publish'
      },
    ];

    for (const post of blogPosts) {
      const slug = post.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const newPost = await Post.create({
        post_author: authorId,
        post_title: post.title,
        post_content: post.content,
        post_excerpt: post.excerpt,
        post_status: post.status,
        post_type: 'post',
        post_name: slug,
        guid: `/blog/${slug}`,
        comment_status: 'open'
      });

      // Link to category
      await TermRelationship.create({
        object_id: newPost._id,
        term_taxonomy_id: taxonomies[post.categoryIndex]._id
      });

      // Update category count
      taxonomies[post.categoryIndex].count += 1;
      await taxonomies[post.categoryIndex].save();
    }
    console.log(`✅ ${blogPosts.length} blog posts seeded`);

    // =========================================
    // SUMMARY
    // =========================================
    console.log('\n========================================');
    console.log('✅ Database seeded successfully!');
    console.log(`   FAQs:       ${faqs.length}`);
    console.log(`   Events:     ${events.length}`);
    console.log(`   Resources:  ${resources.length}`);
    console.log(`   Blog Posts: ${blogPosts.length}`);
    console.log(`   Categories: ${terms.length}`);
    console.log('========================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed Error:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
