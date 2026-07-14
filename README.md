# Sporty Store

Site vitrine React (catalogue + panier + WhatsApp + PayPal + Revolut).

## Avant de déployer

Dans `src/App.jsx`, remplace ces 3 lignes par tes vraies infos :

```js
const WHATSAPP_NUMBER = "33782216309"; // déjà bon si c'est ton numéro
const REVOLUT_USERNAME = "tonpseudo";  // ton pseudo revolut.me
const PAYPAL_CLIENT_ID = "test";       // ton client-id PayPal Business
```

## Lancer en local

```bash
npm install
npm run dev
```

Ouvre ensuite l'adresse affichée dans le terminal (en général http://localhost:5173).

## Déployer sur GitHub Pages

1. Vérifie que `vite.config.js` a bien `base: "/sporty-store/"` (doit correspondre au nom exact de ton repo GitHub).
2. Installe et build :
   ```bash
   npm install
   npm run build
   npm run deploy
   ```
   (`npm run deploy` envoie le dossier `dist` sur la branche `gh-pages` grâce au package `gh-pages`, déjà inclus.)
3. Sur GitHub → Settings → Pages → Source : choisis la branche `gh-pages`.
4. Ton site sera visible sur `https://<ton-pseudo-github>.github.io/sporty-store/`.

## Déployer sur Vercel ou Netlify (plus simple)

1. Mets `base: "/"` dans `vite.config.js` (au lieu de `/sporty-store/`).
2. Connecte ton repo GitHub sur [vercel.com](https://vercel.com) ou [netlify.com](https://netlify.com).
3. Build command : `npm run build` — dossier de sortie : `dist`.
4. C'est tout, le déploiement se fait automatiquement à chaque `git push`.
