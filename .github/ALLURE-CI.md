# GitHub Actions Allure Integration

Cette documentation explique comment Allure est intégré dans le workflow CI/CD GitHub Actions.

## 📋 Vue d'ensemble

Le workflow `parallel-e2e-tests.yml` exécute les tests Playwright en parallèle et génère un rapport Allure consolidé.

## 🏗️ Architecture du workflow

### 1. Job `run-all-tests` (Matrix strategy)

Exécute 6 suites de tests en parallèle :
- `user-management.spec.ts`
- `api-integration.spec.ts`
- `form-validation.spec.ts`
- `ui-ux.spec.ts`
- `performance.spec.ts`
- `accessibility.spec.ts`

**Reporters configurés :**
```yaml
run: npx playwright test ${{ matrix.test-suite.file }} --reporter=list,allure-playwright
```

**Artifacts uploadés :**
- `allure-results-<suite-name>` : Résultats JSON Allure
- `test-results-<suite-name>` : Screenshots, traces, vidéos

### 2. Job `generate-allure-report`

S'exécute après tous les tests (même en cas d'échec) :

1. **Setup Java** : Installe Java 21 (requis pour Allure)
2. **Download artifacts** : Télécharge tous les `allure-results-*`
3. **Merge results** : Fusionne les résultats de toutes les suites
4. **Generate report** : Génère le rapport HTML avec `allure-commandline`
5. **Upload report** : Upload l'artifact `allure-report` (rétention 30 jours)
6. **Deploy to GitHub Pages** : Publie le rapport en ligne (main branch uniquement)
7. **Add summary** : Ajoute des instructions au résumé GitHub Actions

## 🌐 Accès au rapport en ligne (GitHub Pages)

**URL du rapport :**
```
https://<owner>.github.io/<repository>/allure-report/
```

**Exemple :**
```
https://otshudi-n-koy.github.io/mini-api-ts/allure-report/
```

**Conditions :**
- ✅ Le push est sur la branche `main`
- ✅ GitHub Pages est activé dans les paramètres du repository
- ✅ Le workflow s'est exécuté avec succès

**Activation de GitHub Pages :**
1. Aller dans **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **gh-pages** / **/ (root)**
4. Sauvegarder

## 📥 Télécharger et consulter le rapport

### Option 1 : Rapport en ligne (recommandé)

Consulter directement sur GitHub Pages après chaque run sur `main` :
```
https://<owner>.github.io/<repository>/allure-report/
```

### Option 2 : Via l'interface GitHub

1. Aller sur l'onglet **Actions** du repository
2. Sélectionner le workflow `Parallel E2E Tests`
3. Cliquer sur le run souhaité
4. Descendre jusqu'à **Artifacts**
5. Télécharger `allure-report.zip`
6. Décompresser et ouvrir `index.html` dans un navigateur

### Option 3 : Avec Allure CLI

```bash
# Télécharger et décompresser allure-report.zip
unzip allure-report.zip -d allure-report

# Ouvrir avec Allure
npx allure open allure-report
```

### Option 4 : Via GitHub CLI

```bash
# Lister les artifacts
gh run list --workflow=parallel-e2e-tests.yml

# Télécharger le dernier artifact
gh run download <run-id> -n allure-report

# Ouvrir
npx allure open allure-report
```

## 🔧 Configuration

### Ajout d'une nouvelle suite de tests

Pour ajouter une suite dans la matrice :

```yaml
matrix:
  test-suite:
    - { name: 'user-management', file: 'user-management.spec.ts' }
    - { name: 'nouvelle-suite', file: 'nouvelle-suite.spec.ts' }  # ⬅️ Ajoutez ici
```

### Modification de la rétention

```yaml
- name: Upload Allure report
  uses: actions/upload-artifact@v4
  with:
    name: allure-report
    path: allure-report/
    retention-days: 30  # ⬅️ Modifier ici (1-90 jours)
```

### Reporter supplémentaire

Pour ajouter un autre reporter :

```yaml
run: npx playwright test --reporter=list,allure-playwright,json
```

## 📊 Contenu du rapport Allure

Le rapport consolidé inclut :

- **Overview** : Statistiques globales (passed/failed/skipped)
- **Suites** : Organisation par fichier de test
- **Graphs** : Graphiques de répartition et tendances
- **Timeline** : Chronologie d'exécution de tous les tests
- **Behaviors** : Tests groupés par fonctionnalité
- **Packages** : Organisation par structure de fichiers
- **Categories** : Catégorisation des échecs

## 🐛 Troubleshooting

### Les résultats Allure ne sont pas uploadés

**Vérifier :**
1. Le reporter est bien configuré : `--reporter=allure-playwright`
2. Le dossier `allure-results/` est créé
3. L'étape `Upload Allure results` ne skip pas

**Debug :**
```yaml
- name: Debug Allure results
  run: |
    ls -la frontend/allure-results/
    echo "Files found: $(find frontend/allure-results -type f | wc -l)"
```

### Le job generate-allure-report échoue

**Vérifier Java :**
```yaml
- name: Verify Java
  run: java -version
```

**Vérifier le merge des résultats :**
```yaml
- name: Debug merge
  run: |
    echo "Downloaded artifacts:"
    ls -la allure-results-temp/
    echo "Merged files:"
    ls -la allure-results/
```

### Le rapport est vide

**Causes possibles :**
1. Aucun test n'a été exécuté
2. Les résultats n'ont pas été mergés correctement
3. Les fichiers JSON sont corrompus

**Solution :**
Vérifier les logs du job `generate-allure-report` :
```bash
gh run view <run-id> --log
```

## 🚀 Optimisations possibles

### 1. Cache des dépendances Allure

```yaml
- name: Cache Allure CLI
  uses: actions/cache@v4
  with:
    path: ~/.npm/allure-commandline
    key: allure-${{ runner.os }}
```

### 2. Parallélisation accrue

Augmenter le nombre de workers Playwright :

```yaml
- name: Run Tests
  run: npx playwright test --workers=4
```

### 3. Upload conditionnel

Upload le rapport seulement si des tests échouent :

```yaml
- name: Upload Allure report
  if: failure()
  uses: actions/upload-artifact@v4
```

## 📚 Ressources

- [Allure Documentation](https://docs.qameta.io/allure/)
- [Allure Playwright](https://www.npmjs.com/package/allure-playwright)
- [GitHub Actions Artifacts](https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts)
- [Playwright CI](https://playwright.dev/docs/ci)

## 📞 Support

En cas de problème :

1. Consulter les logs GitHub Actions
2. Vérifier la configuration dans `playwright.config.ts`
3. Tester localement : `cd frontend && npm test && npm run allure:report`
4. Consulter `frontend/ALLURE-GUIDE.md` pour le setup local
