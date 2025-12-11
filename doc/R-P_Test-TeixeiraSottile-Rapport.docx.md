title: "Rapport de Test – cicd-todo-app"

author: "Evan Sottile & Diego Teixeira – GRP3D"

date: "2025"

---

# 1. Introduction

## 1.1 Titre

P_Test – cicd-todo-app

## 1.2 Description

Dans le cadre du module ICT-450 (Test), nous avons travaillé sur une application Todo App qui nous a été fournie, avec un frontend en Vue.js, un backend en Node.js/Express et une base MySQL. Le but du projet n’était pas de développer l’application, mais plutôt d’apprendre à la tester correctement et à adopter une vraie démarche qualité.

# 2. Tests manuels et classification des bugs

## 2.1 Compte / Profil / Authentification

Le lien vers l’oubli de mot de passe ne fonctionne pas.

"Profile" doit être écrit "Profil".

L’erreur affichée lors de la création d’un profil avec une adresse mail déjà existante n’est pas claire.

Une erreur apparaît alors qu’aucune adresse email n’a encore été saisie.

Changement de nom : si on met un nom trop long, l’application crash.

---

## 2.2 NPA / Validation des données

Si on met des lettres dans le NPA, l’application crash au lieu d’afficher une erreur.

Le NPA devrait :
v

- accepter uniquement des chiffres
- afficher un message d’erreur clair
- ne pas faire crasher l’application

---

## 2.3 Tâches (TODO)

On peut créer des tâches (todo) dans le passé, ce qui ne devrait pas être autorisé.

La description ne se réinitialise pas après la création d'une tâche.

---

## 2.4 Description des tâches

La description trop longue déborde visuellement.

Une description extrêmement longue provoque un crash (limite dépassée).

Une description contenant un mélange de gras, italique, souligné, barré ne peut pas être recherchée.

---

## 2.5 Barre de recherche

Une tâche composée de seulement deux lettres ne peut pas être recherchée.

Une tâche dont le texte est trop long ne s’affiche pas dans les résultats.

Lorsqu’on crée une tâche pendant qu’une recherche est active, elle apparaît quand même dans la liste filtrée.

---

## 2.6 Interface / Texte général

Footer mal écrit :

- "tout" devrait être "tous"
- "réserver" devrait être "réservés"

## 2.7 Classification des bugs

| Catégorie       | Bug                                      | Sévérité     | Gravité       | Priorité  | Justification                                    |
| --------------- | ---------------------------------------- | ------------ | ------------- | --------- | ------------------------------------------------ |
| Compte / Profil | Crash si nom trop long                   | **Critique** | **Bloquante** | **Haute** | Crash -> fonctionnalité brisée et bloque l’usage |
| Compte / Profil | Lien “oubli mot de passe” KO             | Majeure      | Bloquante     | Haute     | Empêche récupérer l’accès au compte              |
| Compte / Profil | Erreur email déjà existant pas claire    | Mineure      | Mineure       | Moyenne   | Perturbant mais contournable                     |
| Compte / Profil | Erreur affichée sans avoir mis d’email   | Majeure      | Sérieuse      | Haute     | Message erroné qui empêche la création correcte  |
| Compte / Profil | "Profile" → "Profil"                     | Triviale     | Cosmétique    | Basse     | Purement esthétique                              |
| NPA             | Crash si lettres dans NPA                | **Critique** | **Bloquante** | **Haute** | Crash immédiat                                   |
| NPA             | Mauvaise validation du NPA               | Majeure      | Sérieuse      | Moyenne   | Données invalides acceptées                      |
| Tâches          | Créer une tâche dans le passé possible   | Mineure      | Mineure       | Basse     | Gênant mais pas bloquant                         |
| Tâches          | Description non réinitialisée            | Mineure      | Mineure       | Basse     | Mauvaise UX sans impact critique                 |
| Description     | Débordement visuel description longue    | Mineure      | Mineure       | Moyenne   | UI dégradée                                      |
| Description     | Crash avec description très longue       | **Critique** | **Bloquante** | **Haute** | Crash direct                                     |
| Description     | Texte riche non recherchable             | Majeure      | Sérieuse      | Moyenne   | Fonction recherche partiellement brisée          |
| Recherche       | Tâche 2 lettres non trouvable            | Mineure      | Mineure       | Basse     | Limite mais non bloquante                        |
| Recherche       | Tâche très longue non affichée           | Majeure      | Sérieuse      | Haute     | Perte de données visibles                        |
| Recherche       | Tâche créée apparaît malgré filtre actif | Majeure      | Mineure       | Moyenne   | Comportement incohérent mais non bloquant        |
| Interface       | Fautes dans le footer                    | Triviale     | Cosmétique    | Basse     | Aucun impact fonctionnel                         |

# 3. Stratégie et plans de tests

## Objectifs de test

- Vérifier la conformité fonctionnelle de l’application par rapport aux spécifications.
- Identifier les comportements inattendus via des tests manuels.
- Renforcer la qualité du backend grâce à des tests unitaires Jest.
- Établir une base de tests automatisés pour une intégration CI/CD future.

### 3.1 Tests manuels

Réalisés sur l’ensemble de l’application :

- Authentification (login/signup)
- Profil utilisateur
- Création/édition/suppression de tâches
- Recherche
- Interface & ergonomie
- Gestion du thème sombre/clair

Ces tests permettent d'observer le comportement réel depuis la perspective de l’utilisateur.

### 3.2 Tests unitaires backend (Jest)

Les tests unitaires couvrent :

- les contrôleurs (`auth`, `todo`, `user`)
- le middleware d’authentification
- les fonctions de validation


- d’identifier des faiblesses majeures
- d'améliorer significativement la validation des données
- d’éviter plusieurs crashs critiques
- d’obtenir un backend stable et maintenable

---
