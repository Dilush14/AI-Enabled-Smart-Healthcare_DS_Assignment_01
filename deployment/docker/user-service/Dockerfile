FROM node:20-alpine

WORKDIR /app

COPY backend/user-service/package*.json ./
RUN npm ci --omit=dev

COPY backend/user-service/ ./

ENV NODE_ENV=production

EXPOSE 3001

CMD ["npm", "start"]
