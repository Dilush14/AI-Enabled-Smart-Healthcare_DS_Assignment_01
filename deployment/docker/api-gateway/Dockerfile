FROM node:20-alpine

WORKDIR /app

COPY backend/api-gateway/package*.json ./
RUN npm ci --omit=dev

COPY backend/api-gateway/ ./

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]
