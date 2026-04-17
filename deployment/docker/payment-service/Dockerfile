FROM node:20-alpine

WORKDIR /app

COPY backend/payment-service/package*.json ./
RUN npm ci --omit=dev

COPY backend/payment-service/ ./

ENV NODE_ENV=production

EXPOSE 3005

CMD ["npm", "start"]
