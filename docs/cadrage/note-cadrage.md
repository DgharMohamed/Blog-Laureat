# Note de Cadrage : Blog des Lauréats

> **Projet :** Blog des Lauréats (EFP - Solicode)  
> **Phase :** Sprint 0 — Cadrage & Périmètre Produit  
> **Livrable :** Note de cadrage synthétique

---

## 1. Présentation du Projet & Contexte Institutionnel

- **Contexte de l'EFP :** Au sein de l'Établissement de Formation Professionnelle (EFP), les apprenants ont besoin de repères concrets pour réussir leur intégration professionnelle. Actuellement, les échanges et les retours d'expérience avec les anciens stagiaires demeurent informels et dispersés.
- **Mission de valorisation des lauréats :** Le projet vise à mettre en place un média numérique institutionnel dédié pour capitaliser, structurer et promouvoir les réussites professionnelles, les compétences et les parcours d'excellence des lauréats, renforçant ainsi la cohésion de la communauté et le rayonnement de l'établissement.

---

## 2. Objectifs Stratégiques & SMART

Les indicateurs de réussite quantifiables et mesurables du projet sont définis selon les critères SMART :

- **Spécifique (S) :** Concevoir et déployer une plateforme web permettant la rédaction, l'administration, la modération et la consultation d'articles rédigés par les lauréats.
- **Mesurable (M) :**
  - **Volume initial :** Publier au minimum 15 à 20 articles de référence dès le premier trimestre.
  - **Performance :** Temps de chargement des pages inférieur à 500 ms en conditions standards.
  - **Accessibilité & Ergonomie :** Interface 100% responsive (mobile, tablette, desktop) avec un contraste conforme aux normes de lisibilité.
- **Atteignable (A) :** Développement incrémental en sprints Scrum courts (itérations de 80 heures) avec livraison de fonctionnalités prioritaires testées de bout en bout.
- **Réaliste (R) :** Choix d'une stack technologique standardisée et maîtrisée : **Laravel, MySQL, Blade, Tailwind CSS / Preline UI, Alpine.js**.
- **Temporellement défini (T) :**
  - **Sprint 0 :** Cadrage, wireframes/prototypes et initialisation du socle technique.
  - **Sprint 1 :** Authentification, gestion des articles et espace d'administration/modération.

---

## 3. Matrice de Périmètre (Perimeter Matrix)

### In-Scope (Inclus dans le périmètre du MVP)

- **Consultation des articles par catégorie :** Navigation fluide et filtrage thématique des articles publiés.
- **Recherche d'articles :** Moteur de recherche textuel simple pour trouver rapidement des retours d'expérience ou des sujets précis.
- **Espace d'administration :** Tableau de bord pour la supervision, la modération des articles (validation / rejet) et la gestion des catégories.
- **Authentification sécurisée :** Inscription, connexion, protection contre les failles courantes et gestion sécurisée des sessions.
- **Gestion des statuts de publication :** Suivi rigoureux du cycle de vie des articles (*Brouillon*, *En attente de validation*, *Publié*, *Rejeté*).
- **Profils des lauréats :** Pages profils présentant la biographie, la promotion, le parcours et les liens professionnels (LinkedIn, GitHub).

### Out-of-Scope (Formellement exclu du MVP / Évolutions futures)

- **Messagerie instantanée en direct (Live chat) :** Les échanges s'effectuent via les canaux externes renseignés sur les profils.
- **Paiement en ligne :** Aucun module de monétisation, d'abonnement payant ou de collecte de dons.
- **Application mobile native :** L'expérience web responsive couvre l'ensemble des usages mobiles sans nécessiter d'application iOS/Android dédiée.
- **Réseau social complexe :** Absence de fonctionnalités avancées de type fil d'actualité algorithmique, gestion d'abonnements/followers ou interactions sociales lourdes.

---

## 4. Parties Prenantes (Stakeholders)

- **Product Owner (Groupe 1) :** Définit la vision fonctionnelle, priorise le backlog produit et valide les livrables à chaque fin d'itération.
- **Développeurs (Équipe technique) :** Conçoivent l'architecture, développent les fonctionnalités, rédigent les tests et assurent l'intégration continue.
- **Formateurs Référents (Lead Trainers) :** Encadrent la cohérence pédagogique et technique, effectuent les revues de code et valident le respect des bonnes pratiques.
- **Visiteurs Publics & Apprenants :** Utilisateurs finaux qui consultent les articles, effectuent des recherches et exploitent les retours d'expérience partagés.

---

## 5. Risques Identifiés & Stratégies d'Atténuation

| Risque Identifié | Impact / Probabilité | Stratégie d'Atténuation |
| :--- | :--- | :--- |
| **Disponibilité du contenu** (Manque d'articles ou retard de rédaction de la part des lauréats) | Élevé / Moyen | - Mettre à disposition des modèles de rédaction prédéfinis (templates d'articles).<br>- Mobiliser un groupe pilote de lauréats dès le Sprint 0 pour préparer des articles témoins (seeders). |
| **Respect des délais de sprint** (Risque de dépassement du planning Scrum) | Élevé / Moyen | - Découpage strict des fonctionnalités en User Stories courtes et indépendantes.<br>- Application rigoureuse de la méthode MoSCoW pour prioriser les fonctionnalités indispensables (*Must Have*).<br>- Synchronisations régulières (Daily Stand-up) pour lever immédiatement les blocages techniques. |
