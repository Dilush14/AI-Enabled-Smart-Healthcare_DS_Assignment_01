FROM node:20-alpine

WORKDIR /app

COPY backend/notification-service/package*.json ./
RUN npm ci --omit=dev

COPY backend/notification-service/ ./

ENV NODE_ENV=production

EXPOSE 3006

CMD ["npm", "start"]
