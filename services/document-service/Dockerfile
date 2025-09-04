FROM node:18-alpine

# Creiamo la directory di lavoro
WORKDIR /app

# Copiamo package.json e installiamo le dipendenze
COPY package*.json ./
RUN npm install

# Copiamo il resto del codice
COPY . .

# Creiamo la cartella per gli uploads
RUN mkdir -p /app/uploads

# Esponiamo la porta
EXPOSE 8085

# Comando di avvio
CMD ["npm", "start"]