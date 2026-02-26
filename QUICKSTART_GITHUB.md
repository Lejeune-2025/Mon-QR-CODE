# 🚀 Déploiement Rapide sur GitHub Pages

## ⚡ En 5 minutes : Mettre votre site en ligne GRATUITEMENT

### Étape 1: Préparez votre code
```bash
cd e:\Projet_QR_Code
git init
git add .
git commit -m "Initial commit"
```

### Étape 2: Créez un repository GitHub
1. Allez sur **https://github.com/new**
2. Repository name: `Mon-QR-Code`
3. Cochez **Public**
4. Cliquez **Create repository**

### Étape 3: Poussez votre code
```bash
git remote add origin https://github.com/VOTRE_USERNAME/Mon-QR-Code.git
git branch -M main
git push -u origin main

# Vous serez demandé de vous authentifier via le navigateur
```

### Étape 4: Paramètres GitHub Pages
1. Allez dans **Settings** → **Pages**
2. **Source** : Vérifiez **GitHub Actions** est sélectionné
3. Attendez ~2-3 minutes

### ✅ C'EST FINI !

Votre site sera accessible à :
```
https://VOTRE_USERNAME.github.io/Mon-QR-Code/
```

---

## Mise à jour du site

Chaque fois que vous modifiez votre code :

```bash
git add .
git commit -m "Vos modifications"
git push
```

Le site se redéploie automatiquement en 2-3 minutes ! ✨

---

## 📚 Besoin d'aide ?

Consultez le guide complet : [DEPLOYMENT.md](./DEPLOYMENT.md)
