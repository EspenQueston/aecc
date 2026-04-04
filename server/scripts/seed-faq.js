const mongoose = require('mongoose');
const connectDB = require('../config/db');
const FAQ = require('../models/FAQ');

const FAQ_DATA = [
  // GENERAL
  { question: "Qu'est-ce que l'AECC ?", answer: "L'AECC (Association des Étudiants Congolais en Chine) est une association apolitique et à but non lucratif créée le 1er août 2000 à Beijing. Elle regroupe tous les étudiants de la République du Congo poursuivant leurs études en Chine.", category: 'general', order: 1 },
  { question: "Quelle est la devise de l'AECC ?", answer: "La devise de l'AECC est : Unité – Travail – Réussite.", category: 'general', order: 2 },
  { question: "Où se trouve le siège de l'AECC ?", answer: "Le siège de l'AECC est fixé à Beijing, République Populaire de Chine. Il ne peut être transféré dans aucune autre ville.", category: 'general', order: 3 },
  { question: "Quels sont les objectifs de l'AECC ?", answer: "L'AECC vise à : promouvoir l'unité et la solidarité entre les étudiants congolais, défendre leurs intérêts matériels et moraux, faciliter leur intégration en Chine, promouvoir l'excellence académique et renforcer les liens entre le Congo et la Chine.", category: 'general', order: 4 },
  { question: "À quelle date les statuts actuels de l'AECC ont-ils été adoptés ?", answer: "Les statuts actuels de l'AECC ont été adoptés le 12 décembre 2017.", category: 'general', order: 5 },

  // MEMBERSHIP
  { question: "Comment devenir membre de l'AECC ?", answer: "Tout étudiant congolais (République du Congo) poursuivant ses études en Chine peut devenir membre en s'inscrivant sur la plateforme et en s'acquittant des frais d'adhésion de 50 RMB (10 RMB pour la carte de membre + 40 RMB pour l'uniforme de l'association).", category: 'membership', order: 1 },
  { question: "Quel est le montant de la cotisation mensuelle ?", answer: "La cotisation mensuelle est de 10 RMB par membre. Elle est obligatoire et contribue au fonctionnement de l'association et au fonds de solidarité.", category: 'membership', order: 2 },
  { question: "Peut-on perdre sa qualité de membre ?", answer: "Oui, la qualité de membre se perd par : démission, exclusion pour faute grave, fin des études en Chine, décès, ou non-paiement des cotisations pendant 3 mois consécutifs sans justification.", category: 'membership', order: 3 },
  { question: "Quels sont les droits des membres ?", answer: "Chaque membre a le droit de : participer aux assemblées générales, voter et être élu aux postes de responsabilité, bénéficier de l'aide sociale, participer à toutes les activités de l'association, et accéder à toutes les informations de l'association.", category: 'membership', order: 4 },
  { question: "Quels sont les devoirs des membres ?", answer: "Les membres doivent : respecter les statuts et le règlement intérieur, payer régulièrement leurs cotisations, participer aux activités, contribuer au rayonnement de l'association et maintenir une bonne conduite.", category: 'membership', order: 5 },

  // SCHOLARSHIPS
  { question: "Quelles bourses sont disponibles pour étudier en Chine ?", answer: "Les principales bourses sont : la bourse CSC (Chinese Government Scholarship) couvrant frais de scolarité, logement et allocation mensuelle ; les bourses provinciales ; les bourses universitaires d'excellence ; et la bourse du gouvernement congolais.", category: 'scholarships', order: 1 },
  { question: "Comment postuler à la bourse CSC ?", answer: "Les candidatures pour la bourse CSC se font généralement entre janvier et mars via le site officiel du CSC (csc.edu.cn) et l'ambassade de Chine au Congo. L'AECC organise des sessions d'information pour accompagner les candidats.", category: 'scholarships', order: 2 },
  { question: "L'AECC peut-elle m'aider avec ma bourse ?", answer: "Oui, l'AECC accompagne les membres dans leurs démarches de bourse : informations sur les opportunités, aide à la constitution du dossier, et mise en relation avec d'anciens boursiers.", category: 'scholarships', order: 3 },

  // EVENTS
  { question: "Comment sont organisés les événements de l'AECC ?", answer: "Les événements sont organisés par le Bureau National et les sections provinciales. L'Assemblée Générale se réunit au moins 2 fois par an (en début et fin d'année académique). Des événements culturels, sportifs et académiques sont organisés tout au long de l'année.", category: 'events', order: 1 },
  { question: "Qu'est-ce que l'Assemblée Générale ?", answer: "L'Assemblée Générale est l'organe suprême de l'AECC. Elle réunit tous les membres, adopte les décisions à la majorité simple, élit les membres du Bureau National et de la Commission de Contrôle, et approuve les rapports d'activités et financiers.", category: 'events', order: 2 },
  { question: "Les votes se font-ils à main levée ou à bulletin secret ?", answer: "L'élection des membres du Bureau se fait au scrutin secret. Les autres décisions sont prises à la majorité simple des membres présents.", category: 'events', order: 3 },

  // ACADEMIC
  { question: "L'AECC offre-t-elle un soutien académique ?", answer: "Oui, l'AECC organise des groupes d'étude, du tutorat, des ateliers de rédaction scientifique et des sessions de préparation aux examens HSK pour aider les membres dans leur parcours académique.", category: 'academic', order: 1 },
  { question: "Comment l'AECC aide-t-elle les nouveaux arrivants ?", answer: "L'AECC assure l'accueil des nouveaux étudiants à leur arrivée en Chine : accueil à l'aéroport, aide à l'installation, orientation dans l'université, et intégration dans la communauté. Le Secrétaire aux Relations Publiques coordonne ces activités.", category: 'academic', order: 2 },

  // ADMINISTRATIVE
  { question: "Comment est structurée l'AECC ?", answer: "L'AECC comprend 3 organes : l'Assemblée Générale (organe suprême), le Bureau National (organe exécutif composé du Président, Secrétaire Général, Secrétaire aux Relations Publiques et Trésorier), et la Commission de Contrôle, d'Évaluation et de Discipline (Commissaire + Rapporteur).", category: 'administrative', order: 1 },
  { question: "Quelle est la durée du mandat du Bureau ?", answer: "Le mandat des membres du Bureau National et de la Commission est d'un (1) an, renouvelable deux (2) fois, soit un maximum de 3 années consécutives au même poste.", category: 'administrative', order: 2 },
  { question: "Quel est le système d'aide sociale de l'AECC ?", answer: "L'AECC dispose d'un fonds de solidarité alimenté par les cotisations. L'aide est versée en cas de : décès d'un parent (20 RMB par membre), décès du conjoint ou d'un enfant (50 RMB), décès d'un membre (100 RMB par membre), mariage d'un membre (50 RMB).", category: 'administrative', order: 3 },
  { question: "Quelles sanctions existent en cas de faute ?", answer: "Les sanctions disciplinaires sont : l'avertissement, le blâme, la suspension temporaire, et l'exclusion définitive. Les sanctions sont prononcées par le Bureau National sur proposition de la Commission de Contrôle, après audition du membre concerné.", category: 'administrative', order: 4 },
  { question: "Comment contacter l'AECC ?", answer: "Vous pouvez nous contacter par email (contact@aecc.org ou cluivertmoukendi@gmail.com), via WeChat (AECC_Official), par téléphone, ou en remplissant le formulaire de contact sur notre site web. Nous répondons sous 24-48h.", category: 'administrative', order: 5 },
];

async function seedFAQ() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Remove existing FAQs
    await FAQ.deleteMany({});
    console.log('Cleared existing FAQs');

    // Insert new FAQs
    const result = await FAQ.insertMany(FAQ_DATA);
    console.log(`Inserted ${result.length} FAQ entries`);

    process.exit(0);
  } catch (err) {
    console.error('Error seeding FAQs:', err.message);
    process.exit(1);
  }
}

seedFAQ();
