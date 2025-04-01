const express = require('express');
const cors = require('cors');
const app = express();

// Leggi la porta dall'environment (o usa 5000 di default)
const PORT = process.env.PORT || 5000;

// Abilita CORS (consigliato per sviluppi in locale)
app.use(cors());

// Endpoint "Hello World"
app.get('/api/hello', (req, res) => {
  res.send('Hello World dal Backend Express!');
});

// Avvia il server
app.listen(PORT, () => {
  console.log(`Server in esecuzione sulla porta ${PORT}`);
});
