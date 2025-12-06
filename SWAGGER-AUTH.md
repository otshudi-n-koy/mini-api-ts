# 🔐 Swagger Authentication

This API uses **Basic Authentication** to protect the Swagger documentation endpoint (`/docs`).

## Default Credentials

- **Username**: `admin`
- **Password**: `secret`

## Changing Credentials

### Option 1: Using PowerShell Script

```powershell
.\generate-swagger-credentials.ps1 -Username "myuser" -Password "mypassword"
```

This will output the Base64-encoded values to update in `k8s/swagger-secret.yaml`.

### Option 2: Manual Base64 Encoding

**Linux/Mac:**
```bash
echo -n "myuser" | base64
echo -n "mypassword" | base64
```

**Windows PowerShell:**
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes("myuser"))
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes("mypassword"))
```

### Applying New Credentials

1. Update `k8s/swagger-secret.yaml` with new Base64 values
2. Apply the secret:
   ```bash
   kubectl apply -f k8s/swagger-secret.yaml
   ```
3. Restart the API deployment:
   ```bash
   kubectl rollout restart deployment/api-deployment
   ```

## Accessing Swagger

1. Navigate to `https://mini-api.local/docs` (or your configured domain)
2. Enter username and password when prompted
3. Browser will cache credentials for the session

## Security Notes

- ⚠️ Change default credentials in production
- 🔒 Always use HTTPS in production (credentials sent in Base64, not encrypted)
- 🔑 Store production credentials in secure vault (HashiCorp Vault, AWS Secrets Manager, etc.)
- 🚫 Never commit production credentials to Git

## Troubleshooting

**"Authentication required" error:**
- Verify secret is applied: `kubectl get secret swagger-secret`
- Check environment variables: `kubectl exec deployment/api-deployment -- env | grep SWAGGER`
- Restart deployment after secret changes

**Credentials not working:**
- Clear browser cache/cookies
- Try incognito/private window
- Verify Base64 encoding is correct (no line breaks)
