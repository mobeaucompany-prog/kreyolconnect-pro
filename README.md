# ANG Thermique — Démonstration pour Amadou

Tableau de bord personnalisé créé par Mobeau, adapté à la plomberie, au chauffage et aux pompes à chaleur en Île-de-France. Source de contexte : https://angthermique.com/

## Parcours

- Dossiers fictifs avec recherche, filtres, notes et date de visite.
- Demande client avec coordonnées, besoin et trois photos maximum.
- Devis modifiable (lignes, quantités, prix, mentions), sauvegarde locale et PDF multipage.
- Partage natif du PDF sur les appareils compatibles ; téléchargement et lien WhatsApp sinon. Brouillon email avec pièce jointe à ajouter manuellement.
- Accord client simulé, échéancier et suivi des paiements simulés.
- Aperçu du fonctionnement des relances, sans programmation ni envoi effectif.

Les données restent dans le navigateur. Aucun appel à l’ancienne base Supabase, aucune signature électronique contractuelle, aucun débit ni financement réel. L’encaissement immédiat nécessite un prestataire, la validation du dossier et la confirmation des frais. La TVA et les mentions légales définitives de l’entreprise doivent être configurées avant usage réel.

## Développement

`npm install` puis `npm run dev`. Vérification : `npm run build` et `npm test`.

## Synchronisation Lovable

https://lovable.dev/projects/bd68b2c1-3414-4c6d-bedc-4868ae833596

Les commits sur main synchronisent le code vers Lovable. Aucune génération Lovable n’est utilisée. La publication publique éventuelle est distincte. L’historique Git est conservé ; les anciens fichiers de l’interface touristique sont remplacés. Les migrations et la configuration Supabase historiques sont conservées mais ne sont pas utilisées par la démonstration.
