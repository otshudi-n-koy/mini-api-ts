# 📊 Rapports de Tests

## Allure Report (Live)

[![Allure Report](https://img.shields.io/badge/Allure-Report-blue?logo=allure&logoColor=white)](https://otshudi-n-koy.github.io/mini-api-ts/allure-report/)

**Accès direct :** [https://otshudi-n-koy.github.io/mini-api-ts/allure-report/](https://otshudi-n-koy.github.io/mini-api-ts/allure-report/)

Le rapport est automatiquement mis à jour après chaque push sur `main`.

## Voir les rapports

### Option 1 : Rapport en ligne (recommandé)
Accéder au rapport Allure publié sur GitHub Pages :
```
https://otshudi-n-koy.github.io/mini-api-ts/allure-report/
```

### Option 2 : Télécharger depuis GitHub Actions
1. Aller dans **Actions** → **Parallel E2E Tests**
2. Sélectionner le dernier run
3. Télécharger l'artifact `allure-report`
4. Ouvrir `index.html` dans un navigateur

### Option 3 : Générer localement
```bash
cd frontend
npm test
npm run allure:report
```

## Configuration GitHub Pages

Pour activer la publication automatique, suivre le guide :
[.github/GITHUB-PAGES-SETUP.md](.github/GITHUB-PAGES-SETUP.md)

## Documentation

- **Configuration CI/CD** : [.github/ALLURE-CI.md](.github/ALLURE-CI.md)
- **Usage local** : [frontend/ALLURE-GUIDE.md](frontend/ALLURE-GUIDE.md)
- **Setup GitHub Pages** : [.github/GITHUB-PAGES-SETUP.md](.github/GITHUB-PAGES-SETUP.md)
