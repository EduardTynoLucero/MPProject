FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci


COPY src ./src
COPY .env .env

EXPOSE 3007

ENV CHOKIDAR_USEPOLLING=1
ENV NODE_ENV=development


CMD ["npm", "run", "dev"]
