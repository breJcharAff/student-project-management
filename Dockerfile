# Étape 1 : build de l'application Next.js
FROM node:20-alpine AS builder

WORKDIR /app

# Copie des fichiers nécessaires pour installer les dépendances
COPY package.json ./

# Installation des dépendances (inclut devDependencies)
RUN npm install

Copie du reste de l'app
COPY . .

# Build Next.js (génère le dossier .next)
RUN npm run build

# Étape 2 : image de production
FROM node:20-alpine AS runner

WORKDIR /app

# Réduction du poids de l'image : on ne garde que les fichiers nécessaires à l'exécution
COPY --from=builder package.json ./
COPY --from=builder public ./public
COPY --from=builder .next ./.next
COPY --from=builder node_modules ./node_modules
COPY --from=builder next.config.js ./ # si tu utilises un fichier de config
COPY --from=builder tsconfig.json ./   # facultatif si utilisé dans certaines lib runtime

# Démarrage de Next.js en mode production
CMD ["npm", "run", "start"]