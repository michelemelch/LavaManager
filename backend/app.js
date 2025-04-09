const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Configura il pool di connessione a PostgreSQL.
// All'interno della rete Docker il nome host del container del db è "db"
// e la porta interna è 5432. Il mapping sul host avverrà sulla porta 5433.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://user:password@db:5432/lavamanagerdb'
});

/**
 * GET /api/program
 * Restituisce l'elenco di tutte le ricette salvate
 */
app.get('/api/program', async (req, res) => {
  try {
    // Seleziona tutte le colonne tranne recipe_name (se esiste)
    const result = await pool.query('SELECT id, colore, fase, disposizione, categoria, cliente, commessa, articolo, tessuto, da_lav_capi_kg, cotte, cotta_capi_kg, prg_supervisore, prg_macchine, created_at FROM wash_program ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel recupero dei programmi' });
  }
});

/**
 * GET /api/program/:id
 * Recupera una ricetta completa con i passi
 */
app.get('/api/program/:id', async (req, res) => {
  const programId = req.params.id;
  try {
    const programResult = await pool.query(
      'SELECT * FROM wash_program WHERE id = $1',
      [programId]
    );
    if (programResult.rowCount === 0) {
      return res.status(404).json({ error: 'Programma non trovato' });
    }
    const program = programResult.rows[0];

    // Recupera i passi associati, ordinati per step_number e mappa step_type in type
    const stepsResult = await pool.query(
      'SELECT * FROM wash_program_step WHERE program_id = $1 ORDER BY step_number ASC',
      [programId]
    );
    const mappedSteps = stepsResult.rows.map((row) => ({
      id: row.id,
      type: row.step_type,  // Mappatura da step_type a type
      parameters: row.parameters,
      step_number: row.step_number,
      created_at: row.created_at
    }));
    program.steps = mappedSteps;

    res.json(program);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante il recupero del programma' });
  }
});

/**
 * POST /api/program
 * Crea una nuova ricetta (con i relativi passi) e restituisce il record inserito
 */
app.post('/api/program', async (req, res) => {
  const { colore, fase, disposizione, steps } = req.body;
  // Imposta 'GEN' se disposizione non è fornito
  const disp = disposizione || 'GEN';

  if (!colore || !fase || !steps || !Array.isArray(steps)) {
    return res.status(400).json({ error: 'Input non valido. Necessari colore, fase e una lista di passi.' });
  }

  try {
    await pool.query('BEGIN');
    // Inserisce la ricetta; recipe_name può essere generato nel db o calcolato dall’applicazione
    const programResult = await pool.query(
      'INSERT INTO wash_program (colore, fase, disposizione) VALUES ($1, $2, $3) RETURNING *',
      [colore, fase, disp]
    );
    const program = programResult.rows[0];

    // Inserisce i passi associati alla ricetta, numerandoli in sequenza
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      await pool.query(
        `INSERT INTO wash_program_step (program_id, step_number, step_type, parameters)
         VALUES ($1, $2, $3, $4)`,
        [program.id, i + 1, step.type, JSON.stringify(step.parameters)]
      );
    }
    await pool.query('COMMIT');
    res.status(201).json(program);
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Errore durante il salvataggio del programma' });
  }
});

/**
 * DELETE /api/program/:id
 * Elimina una ricetta e i relativi passi.
 */
app.delete('/api/program/:id', async (req, res) => {
  const programId = req.params.id;
  try {
    await pool.query('BEGIN');
    await pool.query('DELETE FROM wash_program_step WHERE program_id = $1', [programId]);
    await pool.query('DELETE FROM wash_program WHERE id = $1', [programId]);
    await pool.query('COMMIT');
    res.json({ message: 'Programma eliminato correttamente' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Errore durante l\'eliminazione del programma' });
  }
});

/**
 * PUT /api/program/:id
 * Aggiorna (es. rinomina) una ricetta e restituisce il record aggiornato.
 */
app.put('/api/program/:id', async (req, res) => {
  const programId = req.params.id;
  const { colore, fase, disposizione, steps } = req.body;
  const disp = disposizione || 'GEN';

  if (!colore || !fase || !Array.isArray(steps)) {
    return res.status(400).json({ error: 'Input non valido: assicurati di avere colore, fase e una lista di passi.' });
  }
  try {
    await pool.query('BEGIN');
    const result = await pool.query(
      'UPDATE wash_program SET colore = $1, fase = $2, disposizione = $3 WHERE id = $4 RETURNING *',
      [colore, fase, disp, programId]
    );
    // Cancella i passi esistenti
    await pool.query('DELETE FROM wash_program_step WHERE program_id = $1', [programId]);
    
    // Reinserisce i nuovi passi
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      await pool.query(
        `INSERT INTO wash_program_step (program_id, step_number, step_type, parameters)
         VALUES ($1, $2, $3, $4)`,
        [programId, i + 1, step.type, JSON.stringify(step.parameters)]
      );
    }
    await pool.query('COMMIT');

    const stepsResult = await pool.query(
      'SELECT * FROM wash_program_step WHERE program_id = $1 ORDER BY step_number ASC',
      [programId]
    );
    const updatedProgram = result.rows[0];
    updatedProgram.steps = stepsResult.rows;

    res.json(updatedProgram);
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: "Errore durante l'aggiornamento del programma" });
  }
});

// GET /api/program/:id/export - Esporta la ricetta in formato JSON (download file)
app.get('/api/program/:id/export', async (req, res) => {
  const programId = req.params.id;
  try {
    // Recupera la ricetta dalla tabella wash_program
    const programResult = await pool.query('SELECT * FROM wash_program WHERE id = $1', [programId]);
    if (programResult.rowCount === 0) {
      return res.status(404).json({ error: 'Programma non trovato' });
    }
    const program = programResult.rows[0];
    
    // Recupera i passi associati, ordinati per step_number
    const stepsResult = await pool.query(
      'SELECT * FROM wash_program_step WHERE program_id = $1 ORDER BY step_number ASC', [programId]
    );
    program.steps = stepsResult.rows;
    
    // Converte l'oggetto ricetta in una stringa JSON formattata
    const jsonData = JSON.stringify(program, null, 2);
    
    // Crea una directory "exports" se non esiste
    const exportDir = path.join(__dirname, 'exports');
    fs.mkdirSync(exportDir, { recursive: true });
    // Definisce il percorso del file JSON da esportare
    const filePath = path.join(exportDir, `program_${programId}.json`);
    
    // Scrive la stringa JSON sul file
    fs.writeFileSync(filePath, jsonData, 'utf8');
    
    // Invia il file come download al client
    res.download(filePath, `program_${programId}.json`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante l\'esportazione del programma' });
  }
});

// GET /api/metrics - Endpoint di esempio per le metriche
app.get('/api/metrics', async (req, res) => {
  try {
    const stoneWashResult = await pool.query("SELECT COUNT(*) FROM wash_program WHERE recipe_name ILIKE '%Stone Wash%'");
    const lavaCentrifugheResult = await pool.query("SELECT COUNT(*) FROM wash_program WHERE recipe_name ILIKE '%Lavacentrifughe%'");
    res.json({
      stoneWashCount: parseInt(stoneWashResult.rows[0].count),
      lavaCentrifugheCount: parseInt(lavaCentrifugheResult.rows[0].count)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel recupero delle metriche' });
  }
});

// GET /api/machines - Endpoint di esempio per l'elenco delle macchine
app.get('/api/machines', async (req, res) => {
  try {
    const machines = [
      { id: 1, name: 'Macchina 1', isConnected: true },
      { id: 2, name: 'Macchina 2', isConnected: false },
      { id: 3, name: 'Macchina 3', isConnected: true }
    ];
    res.json(machines);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel recupero delle macchine' });
  }
});



// Avvia il server sulla porta 5001
app.listen(PORT, () => {
  console.log(`Server in esecuzione sulla porta ${PORT}`);
});
