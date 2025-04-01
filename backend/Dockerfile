# Usa un'immagine ufficiale di Node.js
FROM node:19

# Imposta la cartella di lavoro
WORKDIR /app

# Copia i file di package e installa le dipendenze
COPY package*.json ./
RUN npm install

# Copia il resto del codice
COPY . .

# Espone la porta 5001
EXPOSE 5001

# Avvia l’applicazione con nodemon (o node, se in produzione)
CMD [ "npm", "run", "dev" ]

