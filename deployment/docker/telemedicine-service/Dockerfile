FROM node:20-alpine

WORKDIR /app

COPY backend/telemedicine-service/package*.json ./
RUN npm ci --omit=dev

COPY backend/telemedicine-service/ ./
RUN mkdir -p /uploads

ENV NODE_ENV=production

EXPOSE 3004

CMD ["npm", "start"]
