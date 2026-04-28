/**
 * Single source of truth for AECC team member data.
 * Used by: TeamTabs, Home, About, Equipe pages.
 */

export const BUREAU_MEMBERS = [
  { slug: 'rinel', name: 'Rinel', role: 'Président', desc: "Chargé de la coordination et de l'orientation de l'association. Représente l'AECC auprès des autorités et partenaires.", icon: 'fas fa-crown', color: '#B7222D', initials: 'RI', city: 'Beijing' },
  { slug: 'cleve', name: 'Cleve', role: 'Secrétaire Général', desc: "Chargé de l'administration, de la rédaction des procès-verbaux et de la tenue des archives de l'association.", icon: 'fas fa-file-alt', color: '#2563eb', initials: 'CL', city: 'Beijing' },
  { slug: 'mabiala', name: 'Mabiala', role: 'Secrétaire Socio-culturel', desc: "Assure la mobilisation, la communication, l'accueil et le suivi des étudiants congolais.", icon: 'fas fa-bullhorn', color: '#7c3aed', initials: 'MA', city: 'Beijing' },
  { slug: 'exauce', name: 'Exauce', role: 'Trésorier Général', desc: 'Gestionnaire des ressources financières et du patrimoine. Cosignataire des sorties de fonds avec le Président.', icon: 'fas fa-wallet', color: '#d97706', initials: 'EX', city: 'Beijing' },
  { slug: 'cluivert', name: 'Cluivert', role: 'Responsable Technique', desc: "Gère le site web, les réseaux sociaux, les outils numériques et l'infrastructure technique de l'AECC.", icon: 'fas fa-cogs', color: '#059669', initials: 'CV', city: 'Beijing' },
];

export const COMMISSION_MEMBERS = [
  { slug: 'gloire', name: 'Gloire', role: 'Commissaire', desc: "Veille à la bonne gestion des finances, au bon fonctionnement des instances et à l'exécution des activités de l'association.", icon: 'fas fa-gavel', color: '#dc2626', initials: 'GL', city: 'Beijing' },
  { slug: 'diba-grace', name: 'Diba Grace', role: 'Rapporteur', desc: "Rédige les rapports de la commission, assiste le Commissaire et présente les conclusions à l'Assemblée Générale.", icon: 'fas fa-pen-fancy', color: '#0891b2', initials: 'DG', city: 'Beijing' },
];
