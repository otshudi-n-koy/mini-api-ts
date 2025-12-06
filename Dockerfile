# Étape 1 : Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de config
COPY package*.json ./
COPY tsconfig.json ./

# Installer toutes les dépendances (prod + dev)
RUN npm ci

# Copier le code source
COPY src ./src

# Compiler TypeScript
RUN npm run build

# Étape 2 : Runtime
FROM node:20-alpine AS runner

WORKDIR /app

# Copier uniquement les dépendances de prod
COPY package*.json ./
RUN npm ci --only=production

# Copier le build depuis l'étape builder
COPY --from=builder /app/dist ./dist

# Copier swagger.json (needed at runtime)
COPY src/swagger.json ./dist/swagger.json

EXPOSE 3000
CMD ["node", "dist/index.js"]