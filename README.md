# Katsuyō (活用)

Application moderne d'entraînement et d'automatisation des réflexes de conjugaison pour les verbes et adjectifs japonais. Conçue pour fluidifier la reconnaissance et la vitesse de lecture en *Dokkai* (du niveau JLPT N5 au JLPT N2).

**Application en ligne :** [https://myternal.github.io/japanese-conjugation/](https://myternal.github.io/japanese-conjugation/)

### Accès direct par mode

- **Dokkai Flash (Reconnaissance QCM 1-4) :** [https://myternal.github.io/japanese-conjugation/?mode=dokkai](https://myternal.github.io/japanese-conjugation/?mode=dokkai)
- **Sprint 60s (Chronomètre) :** [https://myternal.github.io/japanese-conjugation/?mode=sprint](https://myternal.github.io/japanese-conjugation/?mode=sprint)
- **Survie (1 erreur = fin) :** [https://myternal.github.io/japanese-conjugation/?mode=survival](https://myternal.github.io/japanese-conjugation/?mode=survival)
- **Libre (Classique) :** [https://myternal.github.io/japanese-conjugation/?mode=classic](https://myternal.github.io/japanese-conjugation/?mode=classic)

*Astuce : tu peux combiner mode et niveau JLPT, par exemple [?mode=dokkai&level=n2](https://myternal.github.io/japanese-conjugation/?mode=dokkai&level=n2) pour lancer directement Dokkai Flash sur le vocabulaire N2.*

---

## Fonctionnalités

- **Modes d'entraînement :**
  - **Libre :** Pratique standard avec saisie kana directe.
  - **Sprint 60s :** Défi chronométré pour tester son débit de réponses.
  - **Dokkai Flash :** Reconnaissance inverse sub-seconde par QCM (touches 1 à 4 au clavier). Aucune frappe requise.
  - **Survie :** Défi de précision (une seule erreur met fin à la session).
- **Indicateur de vitesse en direct :**
  - Mesure le temps de réaction sur chaque question (seuil de fluidité calqué sur la règle des 3 secondes).
- **Formes grammaticales couvertes :**
  - Présent, Passé, Forme en て, Adverbe.
  - Volitionnel (〜よう), Passif (〜られる), Causatif (〜させる), Causatif-Passif (〜させられる), Potentiel (〜る / られる), Impératif.
  - Conditionnels : 〜ば (*Kateikei*) et 〜たら.
  - Désiratif : 〜たい (affirmatif/négatif, poli/neutre).
- **Vocabulaire & Presets JLPT :**
  - Filtres par niveau : N5, N4, N3, N2 (incluant paires transitif/intransitif).
  - Tiroir d'importation pour coller ses propres listes de vocabulaire (Satori Reader, Anki).
- **Export Anki :**
  - Bilan de fin de session avec export en un clic des erreurs au format TSV prêt à l'import dans Anki.
- **Synchronisation multi-appareils (100% Cloud) :**
  - Sauvegarde et synchronisation automatique sans serveur via GitHub Gist secret.
  - Transfert rapide alternatif par lien magique et QR Code.

---

## Installation et développement

```bash
# Installation des dépendances
npm install

# Lancer le serveur local de développement
npm run dev

# Lancer la suite de tests unitaires
npm test

# Compiler pour la production (chemins relatifs pour GitHub Pages)
npm run build
```

---

## Déploiement GitHub Pages

Le déploiement est automatisé via GitHub Actions (`.github/workflows/deploy.yml`). À chaque push sur la branche principale (`master` ou `main`), le projet est compilé et publié sur GitHub Pages.

Configuration du dépôt : **Settings > Pages > Source : GitHub Actions**.

---

## Licence

Code source sous licence GPL-3.0. Basé sur le projet initial de [Bailey Snyder](https://github.com/baileysnyder/japanese-conjugation).