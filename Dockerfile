# Gunakan node versi LTS
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json dan package-lock.json (kalau ada)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy seluruh source code ke container
COPY . .

# Expose port
EXPOSE 5000

# Jalankan server
CMD ["npm", "run", "dev"]
