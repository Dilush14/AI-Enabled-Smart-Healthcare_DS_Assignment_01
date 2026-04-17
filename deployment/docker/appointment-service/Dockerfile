FROM node:20-alpine

WORKDIR /app

COPY backend/appointment-service/package*.json ./
RUN npm ci --omit=dev

COPY backend/appointment-service/ ./

ENV NODE_ENV=production

EXPOSE 3003

CMD ["npm", "start"]
