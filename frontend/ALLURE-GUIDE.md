# Guide Allure Reporting

Ce guide explique comment utiliser Allure pour générer des rapports détaillés de vos tests E2E Playwright.

## 🚀 Quick Start

### 1. Lancer les tests
```bash
cd frontend
npm test
```

Les tests génèrent automatiquement les résultats dans `allure-results/`.

### 2. Générer et ouvrir le rapport

**Windows (recommandé):**
```powershell
.\allure-report.ps1
```

**Cross-platform:**
```bash
npm run allure:generate
npm run allure:open
```

**Ou manuellement:**
```bash
npx allure generate ./allure-results --clean -o ./allure-report
npx allure open ./allure-report
```

## 📊 Ce que vous obtenez

Le rapport Allure fournit :

- **Dashboard interactif** : Vue d'ensemble des résultats
- **Suites de tests** : Organisation par catégories
- **Graphiques** : Répartition succès/échecs
- **Timeline** : Chronologie d'exécution
- **Screenshots** : Captures d'écran des échecs
- **Traces** : Logs détaillés de chaque test
- **Trends** : Historique des exécutions (si relancé)

## 🛠️ Configuration

### Reporters configurés dans `playwright.config.ts`

```typescript
reporter: [
  ['list'],              // Console output
  ['html'],              // Playwright HTML report
  ['allure-playwright']  // Allure JSON results
]
```

### Structure des fichiers

```
frontend/
├── allure-results/     # Résultats JSON générés par les tests
├── allure-report/      # Rapport HTML généré par Allure
├── playwright-report/  # Rapport HTML natif de Playwright
└── test-results/       # Screenshots, traces, vidéos
```

## 🔧 Troubleshooting

### Erreur: JAVA_HOME is set to an invalid directory

**Problème :** Allure nécessite Java mais JAVA_HOME pointe vers le mauvais dossier.

**Solution Windows :**
```powershell
# Utiliser le script helper
.\allure-report.ps1

# Ou définir manuellement
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
npx allure generate allure-results --clean -o allure-report
npx allure open allure-report
```

**Solution Linux/Mac :**
```bash
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk
npx allure generate allure-results --clean -o allure-report
npx allure open allure-report
```

### Java non installé

**Installer Java :**
- **Windows :** [Download JDK](https://www.oracle.com/java/technologies/downloads/)
- **Linux :** `sudo apt install openjdk-21-jdk`
- **Mac :** `brew install openjdk@21`

### Rapport vide ou résultats manquants

**Causes possibles :**
1. Les tests n'ont pas été lancés → Lancer `npm test`
2. Le dossier `allure-results/` est vide → Vérifier la configuration Playwright
3. Reporter Allure non configuré → Vérifier `playwright.config.ts`

**Solution :**
```bash
# Relancer les tests
npm test

# Vérifier que allure-results contient des fichiers .json
ls allure-results

# Régénérer le rapport
npm run allure:generate
npm run allure:open
```

## 📝 Commandes utiles

### Tests
```bash
npm test                              # Tous les tests (génère allure-results)
npm run test:ui                       # Mode UI interactif
npm run test:headed                   # Navigateur visible
npx playwright test --reporter=list   # Sans Allure (plus rapide)
```

### Rapports
```bash
npm run test:report        # Ouvrir rapport Playwright HTML
npm run allure:generate    # Générer rapport Allure
npm run allure:open        # Ouvrir rapport Allure
.\allure-report.ps1        # Windows: tout-en-un
```

### Nettoyage
```bash
# Supprimer les anciens résultats
rm -rf allure-results allure-report test-results playwright-report

# Relancer tests proprement
npm test
npm run allure:generate
```

## 🎯 Bonnes pratiques

### 1. Relancer les tests régulièrement
Pour profiter de l'historique des tendances :
```bash
npm test
npm run allure:generate
# Répéter plusieurs fois pour voir les trends
```

### 2. Catégoriser les tests
Dans vos tests, utilisez les annotations Allure :
```typescript
import { test } from '@playwright/test';

test.describe('User Management', () => {
  test('should create user', async ({ page }) => {
    // Allure catégorise automatiquement par describe()
  });
});
```

### 3. Garder les résultats pour l'historique
```bash
# Ne pas utiliser --clean si vous voulez l'historique
npx allure generate ./allure-results -o ./allure-report
```

## 🔗 Ressources

- [Allure Documentation](https://docs.qameta.io/allure/)
- [Playwright Allure Reporter](https://www.npmjs.com/package/allure-playwright)
- [Playwright Documentation](https://playwright.dev/)

## 🆘 Support

Si vous rencontrez des problèmes :

1. Vérifier que Java est installé : `java -version`
2. Vérifier JAVA_HOME : `echo $env:JAVA_HOME` (Windows) ou `echo $JAVA_HOME` (Linux/Mac)
3. Vérifier que les tests génèrent bien des résultats : `ls allure-results`
4. Consulter les logs de génération : `npx allure generate allure-results --clean -o allure-report`
