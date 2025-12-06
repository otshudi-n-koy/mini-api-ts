# Monitoring avec Prometheus & Grafana

## Architecture

- **Prometheus** : Collecte les métriques de l'API sur `/metrics`
- **Grafana** : Visualisation des métriques avec dashboards

## Déploiement

```powershell
# 1. Créer le namespace monitoring
kubectl apply -f k8s/monitoring-namespace.yaml

# 2. Déployer Prometheus (avec RBAC et ConfigMap)
kubectl apply -f k8s/prometheus-rbac.yaml
kubectl apply -f k8s/prometheus-config.yaml
kubectl apply -f k8s/prometheus-deployment.yaml

# 3. Déployer Grafana (avec datasource pré-configurée)
kubectl apply -f k8s/grafana-datasources.yaml
kubectl apply -f k8s/grafana-deployment.yaml
kubectl apply -f k8s/grafana-ingress.yaml

# 4. Vérifier les pods
kubectl get pods -n monitoring
```

## Accès

### Grafana
- **URL**: https://grafana.local
- **Credentials**: `admin` / `admin`
- **Datasource**: Prometheus (pré-configuré)

### Prometheus
```powershell
# Port-forward pour accéder à Prometheus
kubectl port-forward -n monitoring svc/prometheus-service 9090:9090
# Ouvrir: http://localhost:9090
```

## Métriques exposées

L'API Express expose les métriques suivantes sur `/metrics` :

### Métriques système (default)
- `process_cpu_user_seconds_total` - CPU utilisateur
- `process_resident_memory_bytes` - Mémoire utilisée
- `nodejs_heap_size_total_bytes` - Heap Node.js

### Métriques custom
- `http_requests_total` - Nombre total de requêtes HTTP
  - Labels: `method`, `route`, `status_code`
- `http_request_duration_seconds` - Durée des requêtes HTTP (histogram)
  - Labels: `method`, `route`, `status_code`
- `db_query_duration_seconds` - Durée des queries DB (histogram)
  - Labels: `query_type`

## Configuration du scraping

Prometheus est configuré pour scraper automatiquement les pods avec le label `app=mini-api` :

```yaml
scrape_configs:
  - job_name: 'mini-api'
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
            - default
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        action: keep
        regex: mini-api
```

## Dashboards Grafana recommandés

### Dashboard Node.js
ID: **11159** (Node.js Application Dashboard)

Import depuis Grafana UI:
1. Menu → Dashboards → Import
2. Entrer l'ID: `11159`
3. Sélectionner datasource: Prometheus

### Queries utiles

```promql
# Taux de requêtes par seconde
rate(http_requests_total[5m])

# Latence p95 des requêtes
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Erreurs 5xx
sum(rate(http_requests_total{status_code=~"5.."}[5m]))

# Utilisation mémoire
process_resident_memory_bytes / 1024 / 1024
```

## Ajout du host Grafana

Ajouter à `C:\Windows\System32\drivers\etc\hosts` (admin requis):

```
192.168.49.2  grafana.local
```

Ou via PowerShell (admin):
```powershell
Add-Content -Path C:\Windows\System32\drivers\etc\hosts -Value "`n$(minikube ip)  grafana.local"
```

## Troubleshooting

### Prometheus ne scrape pas l'API
```powershell
# Vérifier les targets dans Prometheus
kubectl port-forward -n monitoring svc/prometheus-service 9090:9090
# Aller sur http://localhost:9090/targets
```

### Grafana ne se connecte pas à Prometheus
```powershell
# Vérifier que le service Prometheus est accessible
kubectl get svc -n monitoring prometheus-service
```

### Métriques vides
```powershell
# Tester l'endpoint metrics de l'API
kubectl port-forward svc/api-service 8080:3000
curl http://localhost:8080/metrics
```

## Ressources

- **Prometheus**: https://prometheus.io/docs/
- **Grafana**: https://grafana.com/docs/
- **prom-client**: https://github.com/siimon/prom-client
