FROM node:18-alpine

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install --production

COPY backend/src ./src

EXPOSE 5000

CMD ["node", "src/index.js"]
