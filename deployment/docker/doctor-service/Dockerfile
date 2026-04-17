FROM node:20-alpine

WORKDIR /app

COPY backend/doctor-service/package*.json ./
RUN npm ci --omit=dev

COPY backend/doctor-service/ ./

ENV NODE_ENV=production

EXPOSE 3002

CMD ["npm", "start"]
