# 🚀 Guide de Déploiement - GitHub & GitHub Pages

Ce guide vous explique comment publier votre projet sur GitHub et l'héberger gratuitement avec GitHub Pages.

---

## 📋 Table des matières

1. [Préparation locale](#préparation-locale)
2. [Créer un compte GitHub](#créer-un-compte-github)
3. [Créer un nouveau repository](#créer-un-nouveau-repository)
4. [Configurer Git localement](#configurer-git-localement)
5. [Envoyer votre code sur GitHub](#envoyer-votre-code-sur-github)
6. [Configurer GitHub Pages](#configurer-github-pages)
7. [Déployer votre site](#déployer-votre-site)
8. [Vérifier votre site en ligne](#vérifier-votre-site-en-ligne)

---

## 1. Préparation locale

### Étape 1A : Initialiser Git

Si ce n'est pas déjà fait, initialisez un repository Git dans votre dossier du projet :

```bash
cd e:\Projet_QR_Code
git init
```

### Étape 1B : Créer un fichier `.gitignore`

Assurez-vous que votre `.gitignore` exclut les fichiers inutiles :

```
node_modules/
dist/
.env
.env.local
.env.*.local
*.pem
.DS_Store
```

### Étape 1C : Faire un premier commit

```bash
git add .
git commit -m "Initial commit: Générateur de QR Codes"
```

---

## 2. Créer un compte GitHub

### Si vous n'avez pas encore de compte :

1. Allez sur **https://github.com**
2. Cliquez sur **"Sign up"** (en haut à droite)
3. Entrez votre email, créez un mot de passe sécurisé
4. Choisissez un nom d'utilisateur (exemple: `Lejeune-2025`)
5. Complétez la vérification et confirmez votre email

### Authentification GitHub sur Windows

```bash
# Installez GitHub CLI (recommandé)
# Téléchargez depuis: https://cli.github.com

# Ou configurez manuellement avec SSH
# Suivez: https://docs.github.com/en/authentication/connecting-to-github-with-ssh
```

---

## 3. Créer un nouveau repository

### Via l'interface GitHub (Méthode recommandée)

1. Connectez-vous à **https://github.com**
2. Cliquez sur **"+"** (en haut à droite) → **"New repository"**
3. Remplissez les informations :

| Champ | Valeur |
|-------|--------|
| **Repository name** | `Mon-QR-Code` |
| **Description** | `Générateur de QR Codes professionnel avec React et Vite` |
| **Public** | ✅ Cocher (pour GitHub Pages) |
| **.gitignore** | Node |
| **License** | MIT |

4. Cliquez sur **"Create repository"**

### Via Git CLI

```bash
gh repo create Mon-QR-Code --public --description "Générateur de QR Codes professionnel"
```

---

## 4. Configurer Git localement

### Configuration initiale (première fois seulement)

```bash
# Configurez votre identité Git
git config --global user.name "Moussa Gbamou"
git config --global user.email "moussagbamou6@gmail.com"

# Vérifiez la configuration
git config --global --list
```

### Ajouter les credentials GitHub

#### Option 1 : GitHub CLI (Recommandé - Plus facile)

```bash
# Ouvrez PowerShell en administrateur et installez GitHub CLI
# https://cli.github.com ou : choco install gh (si Chocolatey installé)

# Authentifiez-vous
gh auth login

# Sélectionnez:
# - GitHub.com
# - HTTPS (ou SSH selon votre préférence)
# - Authentifiez-vous avec votre navigateur
```

#### Option 2 : Token personnel (Alternative)

1. Allez sur **https://github.com/settings/tokens**
2. Cliquez sur **"Generate new token"** → **"Generate new token (classic)"**
3. Donnez-lui un nom : `GitHub Deployment`
4. Cochez les permissions : `repo` + `workflow`
5. Générez et copiez le token (ne le partagez PAS)
6. Stockez-le dans les credentials Windows ou en variable d'environnement

---

## 5. Envoyer votre code sur GitHub

### Étape 5A : Ajouter le remote

```bash
# Allez dans votre dossier du projet
cd e:\Projet_QR_Code

# Ajouter le remote GitHub
# Remplacez YOUR_USERNAME par votre nom d'utilisateur GitHub
git remote add origin https://github.com/YOUR_USERNAME/Mon-QR-Code.git

# Verifiez
git remote -v
```

### Étape 5B : Renommer la branche principale (si nécessaire)

```bash
git branch -M main
```

### Étape 5C : Envoyer les fichiers

```bash
# Poussez votre code sur GitHub
git push -u origin main

# Après la première fois, vous pouvez simplement utiliser:
# git push
```

---

## 6. Configurer GitHub Pages

### Étape 6A : Mise à jour de `vite.config.js`

Pour que GitHub Pages fonctionne correctement, il faut configurer le chemin de base.

Modifiez votre `vite.config.js` :

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Mon-QR-Code/', // Remplacez par le nom de votre repository
})
```

### Étape 6B : Créer un workflow GitHub Actions

Créez un fichier : `.github/workflows/deploy.yml`

```bash
mkdir -p .github/workflows
```

Contenu du fichier `deploy.yml` :

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          cname: ""  # Laissez vide si pas de domaine personnalisé
```

### Étape 6C : Commitez et poussez

```bash
git add .github/
git add vite.config.js
git commit -m "Add GitHub Pages deployment configuration"
git push
```

---

## 7. Déployer votre site

### Étape 7A : Via GitHub Actions (Automatique)

1. Allez sur votre repository GitHub : `https://github.com/YOUR_USERNAME/Mon-QR-Code`
2. Cliquez sur l'onglet **"Actions"**
3. Cliquez sur le workflow **"Deploy to GitHub Pages"**
4. Attendez que le déploiement se termine (environ 2-3 minutes)
5. Vous verrez une coche verte ✅ quand c'est fini

### Étape 7B : Activation manuelle (dans les Settings)

1. Allez sur votre repository
2. Cliquez sur **"Settings"** (en haut à droite)
3. Allez dans **"Pages"** (dans le menu de gauche)
4. Sous **"Build and deployment"** :
   - **Source** : Sélectionnez **"GitHub Actions"**
5. Confirmez

---

## 8. Vérifier votre site en ligne

### Trouver l'URL publique

1. Allez au-dessus du projet GitHub
2. À droite, vous verrez **"🌐 github.io"** ou un lien direct
3. Ou accédez directement : `https://YOUR_USERNAME.github.io/Mon-QR-Code/`

Par exemple, pour vous : `https://Lejeune-2025.github.io/Mon-QR-Code/`

---

## 🔄 Mise à jour du site (après les changements)

À chaque fois que vous modifiez votre code :

```bash
# 1. Faites vos modifications localement
# 2. Testez avec : npm run dev

# 3. Commitez les changes
git add .
git commit -m "Description de vos changements"

# 4. Poussez sur GitHub
git push

# 5. GitHub Pages se redéploiera automatiquement en ~2-3 minutes
# Vérifiez l'onglet "Actions" pour suivre la progression
```

---

## ⚙️ Options avancées

### Option 1 : Utiliser un domaine personnalisé

Si vous avez un domaine (exemple: `monqrcode.com`) :

1. Achetez un domaine chez un registraire (GoDaddy, Namecheap, OVH, etc.)
2. Allez dans **Settings** → **Pages**
3. Entrez votre domaine dans **"Custom domain"**
4. Suivez les instructions DNS

### Option 2 : Protocole HTTPS et certificat SSL

GitHub Pages fournit **gratuitement un certificat HTTPS** pour les domaines GitHub Pages.

Pour un domaine personnalisé :
1. Les certificats sont aussi gratuits via Let's Encrypt
2. GitHub Pages les gère automatiquement

---

## 🐛 Troubleshooting

### Le site ne s'affiche pas

```
Erreur: 404 Not Found
```

**Solution** : Vérifiez que le `base` dans `vite.config.js` correspond au nom de votre repository.

### Le CSS/JS ne charge pas

```
Erreur: Failed to load resource
```

**Solution** : Assurez-vous que `base: '/Mon-QR-Code/'` inclut les slashs.

### Le déploiement GitHub Actions échoue

1. Allez dans **Actions** → cliquez sur le workflow échoué
2. Lisez les logs d'erreur
3. Les erreurs communes :
   - Pas assez de permissions (vérifiez les secrets)
   - npm install a échoué (vérifiez `package.json`)
   - npm run build a échoué (compilez localement d'abord)

### Solution rapide pour les erreurs

```bash
# Nettoyez et réinstallez
rm -r node_modules
npm install
npm run build

# Si ça marche localement, ça marchera sur GitHub
```

---

## 📊 Vérifier les stats du déploiement

1. Allez à **Settings** → **Pages**
2. Vous verrez :
   - ✅ Dernier déploiement réussi
   - 🌐 URL publique
   - 📊 Historique des déploiements

---

## 🎯 Résumé des commandes principales

```bash
# Configuration initiale
git config --global user.name "Moussa Gbamou"
git config --global user.email "moussagbamou6@gmail.com"

# Créer un repository local
git init
git add .
git commit -m "Initial commit"

# Connecter à GitHub
git remote add origin https://github.com/Lejeune-2025/Mon-QR-Code.git
git branch -M main
git push -u origin main

# Après chaque modification
git add .
git commit -m "Description des changements"
git push
```

---

## ✅ Checklist de déploiement

- [ ] Repository GitHub créé (public)
- [ ] Git configuré localement
- [ ] Code pousssé vers `main` branch
- [ ] `vite.config.js` mis à jour avec le bon `base`
- [ ] `.github/workflows/deploy.yml` créé
- [ ] GitHub Pages activé dans Settings
- [ ] Site accessible à `https://Lejeune-2025.github.io/Mon-QR-Code/`
- [ ] HTTPS activé (automatique sur github.io)

---

## 📞 Support

- 📖 Documentation GitHub Pages : https://docs.github.com/en/pages
- 📖 Documentation GitHub Actions : https://docs.github.com/en/actions
- 📖 Guide Vite : https://vitejs.dev/guide/

---

**Félicitations ! 🎉 Votre site est maintenant en ligne gratuitement !**
