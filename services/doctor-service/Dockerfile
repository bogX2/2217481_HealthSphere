FROM node:18
WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Create uploads folder
RUN mkdir -p /doctor-service/uploads

EXPOSE 8082
CMD ["npm", "start"]
