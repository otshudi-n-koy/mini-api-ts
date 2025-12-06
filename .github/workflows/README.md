# GitHub Actions Workflows

## 📋 Workflows Disponibles

### 1. **Parallel E2E Tests** (`parallel-e2e-tests.yml`)

Exécute tous les tests E2E en parallèle avec une matrice de 6 jobs.

**Déclenchement:**
- Manuel via GitHub UI (`workflow_dispatch`)
- Push sur `main` (chemins: `frontend/e2e/**`, `frontend/src/**`, `src/**`)
- Planifié quotidiennement à 2h UTC

**Architecture:**
- Chaque job crée son propre cluster Kind isolé
- Build et charge les images Docker dans Kind
- Déploie l'infrastructure complète (PostgreSQL, API, Frontend, Ingress)
- Exécute une suite de tests spécifique
- Upload les résultats comme artifacts

**Suites de tests:**
1. User Management (8 tests)
2. API Integration (6 tests)
3. Form Validation (9 tests)
4. UI/UX (11 tests)
5. Performance (10 tests)
6. Accessibility (13 tests)

**Total: 57 tests en parallèle**

**Durée estimée:** ~8-10 minutes par job (en parallèle)

### 2. **Test Results Summary** (`test-summary.yml`)

Génère automatiquement un rapport de synthèse après l'exécution des tests.

**Déclenchement:**
- Automatique après la fin de `Parallel E2E Tests`

**Fonctionnalités:**
- Télécharge tous les artifacts de tests
- Parse les résultats JSON Playwright
- Génère un rapport Markdown complet
- Affiche dans GitHub Actions Summary
- Poste sur les Pull Requests (si applicable)
- Sauvegarde le rapport pendant 30 jours

**Rapport inclut:**
- 📈 Statistiques globales (total, passés, échoués, taux de succès)
- 📋 Table des suites avec status et liens
- 🔍 Détails par test avec statut individuel
- 🔗 Liens vers les logs complets

### 3. **CI/CD with Kind** (`ci-k8s.yml`)

Workflow principal de CI/CD avec déploiement Kubernetes.

**Déclenchement:**
- Push sur `main`
- Pull Request vers `main`

**Étapes:**
1. Setup Kind cluster
2. Deploy PostgreSQL
3. Build & deploy API
4. Build & deploy Frontend
5. Setup Ingress & TLS
6. Run health checks
7. Run basic E2E tests
8. Rollback automatique si échec

### 4. **E2E Tests** (`e2e-tests.yml`)

Workflow dédié aux tests E2E (version séquentielle).

**Déclenchement:**
- Manuel (`workflow_dispatch`)
- Après succès de CI/CD
- Planifié quotidiennement à 6h UTC

## 🚀 Utilisation

### Lancer les tests manuellement

Via GitHub UI:
```
Actions → Parallel E2E Tests → Run workflow
```

Via GitHub CLI:
```bash
gh workflow run parallel-e2e-tests.yml
```

### Voir les résultats

1. Allez dans l'onglet **Actions**
2. Cliquez sur la run de workflow
3. Le rapport de synthèse est visible dans le **Summary**
4. Les artifacts individuels sont téléchargeables

### Debug en cas d'échec

Le workflow inclut des logs détaillés:
- État des pods
- Describe des pods en échec
- Logs des conteneurs (dernières 50 lignes)
- Images Docker chargées
- Vérification des images dans Kind

## 🔧 Configuration Locale

Pour reproduire l'environnement CI:

```bash
# Installer Kind
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind

# Créer un cluster
kind create cluster --name kind

# Build et charger les images
docker build -t mini-api:latest .
kind load docker-image mini-api:latest --name kind

cd frontend
docker build -t mini-api-frontend:latest .
kind load docker-image mini-api-frontend:latest --name kind
cd ..

# Déployer
kubectl apply -f k8s/

# Vérifier
kubectl get pods
```

## 🐛 Résolution de Problèmes

### `ErrImageNeverPull`

**Cause:** L'image n'est pas présente dans Kind

**Solution:**
1. Vérifier que l'image est buildée: `docker images | grep mini-api`
2. Vérifier le nom du cluster: `kind get clusters`
3. Charger l'image: `kind load docker-image mini-api:latest --name <cluster-name>`

### Timeout des pods

**Cause:** Readiness probe échoue

**Solution:**
1. Vérifier les logs: `kubectl logs -l app=mini-api`
2. Tester le probe: `kubectl exec <pod> -- wget -O- http://localhost:3000/api/v1/ready`
3. Vérifier la connexion DB

### Tests échouent localement mais passent en CI

**Cause:** Différences d'environnement

**Solution:**
1. Utiliser exactement les mêmes versions (Kind, Node, etc.)
2. Nettoyer le cluster: `kind delete cluster --name kind`
3. Recréer depuis zéro

## 📊 Métriques

- **Parallélisation:** 6 jobs simultanés
- **Couverture:** 57 tests E2E
- **Performance:** ~10 minutes (vs ~60 minutes séquentiel)
- **Taux de succès attendu:** >95%

## 🔐 Secrets Requis

Aucun secret externe requis. Les credentials PostgreSQL sont dans les manifests Kubernetes (dev uniquement).

## 📝 Notes

- Les clusters Kind sont éphémères et recréés pour chaque job
- Les artifacts sont conservés 7 jours (tests) et 30 jours (rapports)
- Le workflow de synthèse nécessite les permissions `actions: read`
