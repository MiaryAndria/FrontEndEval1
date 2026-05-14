# 📘 Commandes Git essentielles (Guide rapide)

Ce document regroupe les commandes Git de base pour un projet React ou tout projet web.

---

# 🚀 1. Initialiser un projet Git
```bash
git init
```

---

# 📁 2. Ajouter les fichiers au suivi
```bash
git add .
```

---

# 💾 3. Faire un commit
```bash
git commit -m "Initial commit"
```

---

# 🌿 4. Vérifier la branche actuelle
```bash
git branch
```

---

# 🔀 5. Renommer la branche en main
```bash
git branch -M main
```

---

# 🌐 6. Ajouter le dépôt GitHub (remote)
```bash
git remote add origin https://github.com/USER/REPO.git
```

---

# 🔍 7. Vérifier le remote
```bash
git remote -v
```

---

# 🚀 8. Envoyer le projet sur GitHub (push)
```bash
git push -u origin main
```

---

# ⬇️ 9. Récupérer un repo GitHub existant
```bash
git clone https://github.com/USER/REPO.git
```

---

# 🔄 10. Récupérer les changements distants
```bash
git pull origin main
```

---

# ⚠️ 11. Cas conflit (merge différent historique)
```bash
git pull origin main --allow-unrelated-histories
```

---

# 💣 12. Forcer un push (attention)
```bash
git push -f origin main
```

---

# 📌 Ordre classique complet
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USER/REPO.git
git push -u origin main
```

---

# 🎯 Résumé simple
- `add` = sélectionner fichiers
- `commit` = sauvegarder local
- `push` = envoyer sur GitHub
- `pull` = récupérer GitHub

---

✔️ Fin du guide Git

