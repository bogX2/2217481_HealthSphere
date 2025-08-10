FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 8083

CMD ["node", "src/index.js"]
