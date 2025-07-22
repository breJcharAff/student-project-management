# -------- 1. Dépendances ----------
FROM node:18-alpine AS deps
WORKDIR /app

# Copie minimale pour profiter du cache Docker
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm ci --ignore-scripts

# -------- 2. Build ----------
FROM node:18-alpine AS builder
WORKDIR /app
# Récupère les modules installés à l’étape précédente
COPY --from=deps /app/node_modules ./node_modules
# Copie le reste du code source
COPY . .
# Compile la version production de Next.js
RUN npm run build

# -------- 3. Image d’exécution ----------
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Render passera le port via la variable d’env. PORT
ENV PORT=3000

# Ne conserver que ce qui est nécessaire pour exécuter l’app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

EXPOSE 3000
# Le script "start" doit exister :  "next start -p $PORT"
CMD ["npm", "run", "start"]