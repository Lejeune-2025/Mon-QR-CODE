# 📖 Commandes Git Essentielles pour Windows PowerShell

## Vérifier l'installation

```powershell
# Vérifier Git
git --version

# Vérifier Node.js
node --version
npm --version
```

---

## Configuration initiale (Une seule fois)

```powershell
# Configurez votre identité Global (pour tous les projets)
git config --global user.name "Moussa Gbamou"
git config --global user.email "moussagbamou6@gmail.com"

# Vérifiez la configuration
git config --global --list
```

---

## Initialiser un nouveau repository

```powershell
# Allez dans votre dossier du projet
cd e:\Projet_QR_Code

# Initialisez Git
git init

# Vérifiez le status
git status
```

---

## Workflow habituel push vers GitHub

```powershell
# 1. Voir les fichiers modifiés
git status

# 2. Ajouter tous les fichiers
git add .

# Ou ajouter un fichier spécifique
git add src/App.tsx

# 3. Faire un commit
git commit -m "Description claire et concise des changements"

# 4. Pousser vers GitHub
git push

# Après le premier push avec -u:
# Les prochains push seront simples : git push
```

---

## Ajouter le repository GitHub (première fois)

```powershell
# Remplacez YOUR_USERNAME par votre nom d'utilisateur GitHub
git remote add origin https://github.com/YOUR_USERNAME/Mon-QR-Code.git

# Vérifiez
git remote -v

# Renommez la branche (anciens repo)
git branch -M main

# Premier push
git push -u origin main
```

---

## Commandes utiles

```powershell
# 📋 Voir l'historique des commits
git log --oneline

# 🔍 Voir les différences non commitées
git diff

# 🏷️ Voir les branches
git branch -a

# 🔄 Récupérer les changements du serveur
git pull

# 🌲 Voir un graphique du repository
git log --graph --oneline --all

# ❌ Annuler un commit (avant push)
git reset HEAD~1

# 🔙 Revenir à une version antérieure
git checkout <commit-hash>
```

---

## Authentification GitHub sur Windows

### Option 1 : GitHub CLI (Recommandé)

```powershell
# Installez GitHub CLI
# Téléchargez depuis https://cli.github.com
# Ou utilisez Chocolatey :
choco install gh

# Authentifiez-vous
gh auth login

# Suivez les instructions à l'écran
```

### Option 2 : Credentials Git (Builtin)

Lors de votre premier push, Git demandera votre authentification et gardera vos credentials.

### Option 3 : SSH (Avancé)

```powershell
# Générer une clé SSH
ssh-keygen -t ed25519 -C "moussagbamou6@gmail.com"

# Utilisez le chemin par défaut (appuyez sur Entrée)
# Entrez une passphrase (optionnel)

# Copiez la clé publique
Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub | Set-Clipboard

# Allez sur https://github.com/settings/keys
# Cliquez "New SSH key"
# Collez votre clé publique
```

---

## Gestion des branches

```powershell
# Créer une nouvelle branche
git checkout -b feature/ma-feature

# Basculer vers une branche existante
git checkout main

# Fusionner une branche
git merge feature/ma-feature

# Supprimer une branche locale
git branch -d feature/ma-feature

# Supprimer une branche distante
git push origin --delete feature/ma-feature
```

---

## Résolution des problèmes courants

### ❌ "fatal: not a git repository"

```powershell
# Vous êtes dans le mauvais dossier
cd e:\Projet_QR_Code

# Sinon, initialisez Git
git init
```

### ❌ "fatal: refusing to merge unrelated histories"

```powershell
# Cela arrive lors du premier push
# Solution : utilisez le flag --allow-unrelated-histories
git pull origin main --allow-unrelated-histories
```

### ❌ "Please tell me who you are"

```powershell
# Configurez votre identité
git config --global user.name "Moussa Gbamou"
git config --global user.email "moussagbamou6@gmail.com"
```

### ❌ "Permission denied (publickey)"

```powershell
# Vous authentifier avec HTTPS au lieu de SSH
git remote set-url origin https://github.com/YOU/REPO.git

# Ou générer/ajouter une clé SSH
# Voir la section SSH ci-dessus
```

### ❌ "Erreur: authentication failed"

```powershell
# Cela peut arriver si GitHub exige 2FA
# Utilisez un Personal Access Token
# 1. Allez sur https://github.com/settings/tokens
# 2. Créez un token
# 3. Utilisez le token comme mot de passe
```

---

## Tips PowerShell

### Alias Git pratiques

```powershell
# Créez des alias dans PowerShell (optionnel)
function gs { git status }
function ga { git add @args }
function gc { git commit -m @args }
function gp { git push }

# Ajoutez ces lignes à votre profil PowerShell pour les rendre permanents
# $PROFILE
```

### Voir les fichiers non commitées d'un coup

```powershell
# Avant add/commit
git diff --stat

# Après add, avant commit
git diff --cached --stat
```

---

## Pour finir : Votre premier push

```powershell
# Dans votre projet
cd e:\Projet_QR_Code

# 1. Vérifier l'état
git status

# 2. Ajouter tous les fichiers
git add .

# 3. Faire un commit
git commit -m "Initial commit: Générateur de QR Codes"

# 4. Connecter à GitHub
git remote add origin https://github.com/Lejeune-2025/Mon-QR-Code.git

# 5. Renommer la branche
git branch -M main

# 6. Pousser !
git push -u origin main

# 🎉 Voilà ! Votre code est sur GitHub !
```

---

## 📚 Ressources

- 📖 Documentation Git officielle : https://git-scm.com/doc
- 📖 GitHub Guides : https://guides.github.com
- 📖 Cheatsheet Git : https://github.github.com/training-kit/downloads/github-git-cheat-sheet.pdf

---

**Questions ?** Consultez [DEPLOYMENT.md](./DEPLOYMENT.md) pour un guide complet ! 🚀
