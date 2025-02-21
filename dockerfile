FROM node:22.13-alpine

COPY tsconfig.json /app/
COPY public /app/public/
COPY prisma /app/prisma/
COPY package*.json /app/
COPY src /app/src/

WORKDIR /app

RUN npm install
RUN npx prisma generate
RUN npm run build


EXPOSE 3000
