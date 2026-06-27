FROM node:18-alpine

# Dépendances de compilation pour better-sqlite3 (module natif)
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN mkdir -p /app/data

ENV DATA_DIR=/app/data

CMD ["node", "index.js"]
