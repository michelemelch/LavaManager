# Usa un’immagine ufficiale Node.js
FROM node:14

# Imposta la cartella di lavoro
WORKDIR /app

# Copia i file di package
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Copia il resto del codice
COPY . .

# Espone la porta 5000
EXPOSE 5000

# Avvia l’app usando lo script "dev"
CMD [ "npm", "run", "dev" ]
