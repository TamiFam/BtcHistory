FROM node:18-alpine

# Установка curl для диагностики
RUN apk add --no-cache curl

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
