FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json if present
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all other files
COPY . .

# Expose the port used by the service
EXPOSE 8081

# Start the application
CMD ["node", "src/index.js"]
