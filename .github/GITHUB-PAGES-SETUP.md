# 🌐 Configuration GitHub Pages pour les Rapports Allure

Ce guide explique comment activer GitHub Pages pour publier automatiquement les rapports de tests Allure.

## 📋 Prérequis

- Repository public ou GitHub Pro/Enterprise (pour les repos privés)
- Workflow GitHub Actions configuré avec Allure
- Branch `gh-pages` créée automatiquement par le workflow

## ⚙️ Activation étape par étape

### 1. Aller dans les paramètres du repository

```
https://github.com/<owner>/<repository>/settings/pages
```

Ou via l'interface :
**Repository** → **Settings** → **Pages** (dans la barre latérale)

### 2. Configurer la source

**Source :**
- Sélectionner : **Deploy from a branch**

**Branch :**
- Branch : `gh-pages`
- Folder : `/ (root)`

**Cliquer sur :** **Save**

### 3. Attendre le déploiement

GitHub déploie automatiquement après chaque push sur `gh-pages`.

**Vérifier le statut :**
- Un badge vert apparaît avec l'URL une fois déployé
- Ou aller dans **Actions** → Workflow **pages-build-deployment**

### 4. Accéder au rapport

**URL du rapport Allure :**
```
https://<owner>.github.io/<repository>/allure-report/
```

**Exemple pour ce projet :**
```
https://otshudi-n-koy.github.io/mini-api-ts/allure-report/
```

## 🔄 Workflow de publication

Le workflow `parallel-e2e-tests.yml` publie automatiquement :

```yaml
- name: Deploy Allure report to GitHub Pages
  if: github.ref == 'refs/heads/main'
  uses: peaceiris/actions-gh-pages@v4
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./allure-report
    destination_dir: allure-report
```

**Conditions de publication :**
- ✅ Push sur la branche `main`
- ✅ Tests exécutés avec succès (ou échec avec `if: always()`)
- ✅ Rapport Allure généré

## 📊 Contenu publié

**Structure sur GitHub Pages :**
```
https://<owner>.github.io/<repository>/
└── allure-report/
    ├── index.html          # Page d'accueil du rapport
    ├── app.js
    ├── styles.css
    ├── data/
    ├── export/
    └── widgets/
```

**Accès direct :**
- Dashboard : `https://<owner>.github.io/<repository>/allure-report/`
- Suites : `https://<owner>.github.io/<repository>/allure-report/#suites`
- Graphs : `https://<owner>.github.io/<repository>/allure-report/#graphs`

## 🔐 Sécurité et permissions

### Repository public

✅ Le rapport est accessible publiquement

### Repository privé

Nécessite GitHub Pro, Team, ou Enterprise :
- Seuls les membres avec accès au repository peuvent voir le rapport
- Authentification GitHub requise

### Masquer des données sensibles

Si le rapport contient des données sensibles :

**Option 1 : Ne pas publier sur GitHub Pages**
```yaml
# Commenter ou supprimer cette étape dans le workflow
# - name: Deploy Allure report to GitHub Pages
```

**Option 2 : Publier sur un bucket privé (S3, Azure, GCP)**
```yaml
- name: Deploy to S3
  run: |
    aws s3 sync allure-report/ s3://my-bucket/allure-report/ --delete
```

## 🧹 Historique et nettoyage

### Conserver l'historique

Par défaut, `keep_files: false` remplace le rapport à chaque run.

**Pour conserver l'historique :**
```yaml
- name: Deploy Allure report to GitHub Pages
  uses: peaceiris/actions-gh-pages@v4
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./allure-report
    destination_dir: allure-report-${{ github.run_number }}  # Un dossier par run
    keep_files: true
```

### Nettoyer les anciens rapports

```bash
# Cloner la branche gh-pages
git clone -b gh-pages https://github.com/<owner>/<repository>.git gh-pages-repo
cd gh-pages-repo

# Supprimer les anciens rapports
rm -rf allure-report-*

# Conserver uniquement le dernier
# (garder allure-report/)

# Commit et push
git add .
git commit -m "chore: Clean old Allure reports"
git push
```

## 🐛 Troubleshooting

### Le rapport n'est pas accessible

**Vérifier :**
1. GitHub Pages est activé : **Settings** → **Pages**
2. La branche `gh-pages` existe : `git ls-remote --heads origin gh-pages`
3. Le workflow s'est exécuté sur `main` : **Actions** → **Parallel E2E Tests**
4. Le déploiement Pages a réussi : **Actions** → **pages-build-deployment**

### Erreur 404

**Causes possibles :**
- L'URL est incorrecte (vérifier l'owner et le nom du repository)
- Le dossier `allure-report` n'existe pas sur `gh-pages`
- Le déploiement n'est pas terminé (attendre 1-2 minutes)

**Solution :**
```bash
# Vérifier le contenu de gh-pages
git clone -b gh-pages https://github.com/<owner>/<repository>.git
cd <repository>
ls -la allure-report/
```

### Permission denied lors du déploiement

**Vérifier les permissions du workflow :**

**Settings** → **Actions** → **General** → **Workflow permissions**
- Cocher : **Read and write permissions**
- Cocher : **Allow GitHub Actions to create and approve pull requests**

Sauvegarder et relancer le workflow.

### Le rapport est vide ou incomplet

**Vérifier les logs du job `generate-allure-report` :**
```bash
gh run view <run-id> --log | grep -A 20 "Generate Allure report"
```

**Causes possibles :**
- Aucun test n'a été exécuté
- Les résultats Allure ne sont pas mergés correctement
- Java n'est pas installé

## 📚 Ressources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages)
- [Allure Documentation](https://docs.qameta.io/allure/)

## 🎯 Prochaines étapes

Une fois GitHub Pages activé :

1. ✅ Pousser sur `main` pour déclencher le workflow
2. ✅ Attendre la fin de l'exécution (5-10 minutes)
3. ✅ Consulter le rapport sur `https://<owner>.github.io/<repository>/allure-report/`
4. ✅ Partager le lien avec l'équipe !

---

**Note :** Le premier déploiement peut prendre jusqu'à 10 minutes. Les déploiements suivants sont quasi instantanés.
