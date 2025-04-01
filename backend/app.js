const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

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
    const result = await pool.query('SELECT * FROM wash_program ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nel recupero dei programmi" });
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
  const { name, steps } = req.body;
  if (!name || !steps || !Array.isArray(steps)) {
    return res.status(400).json({ error: 'Input non valido' });
  }

  try {
    await pool.query('BEGIN');
    const programResult = await pool.query(
      'INSERT INTO wash_program (name) VALUES ($1) RETURNING *',
      [name]
    );
    const program = programResult.rows[0];

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
  const { name, steps } = req.body;
  if (!name || !Array.isArray(steps)) {
    return res.status(400).json({ error: 'Input non valido: assicurati di avere un nome e una lista di passi.' });
  }
  
  try {
    await pool.query('BEGIN');
    // Aggiorna il nome della ricetta
    const result = await pool.query(
      'UPDATE wash_program SET name = $1 WHERE id = $2 RETURNING *',
      [name, programId]
    );
    
    // Elimina tutti i passi esistenti associati a questa ricetta
    await pool.query('DELETE FROM wash_program_step WHERE program_id = $1', [programId]);
    
    // Inserisci i nuovi passi (numerati in sequenza)
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      await pool.query(
        `INSERT INTO wash_program_step (program_id, step_number, step_type, parameters)
         VALUES ($1, $2, $3, $4)`,
        [programId, i + 1, step.type, JSON.stringify(step.parameters)]
      );
    }
    await pool.query('COMMIT');
    
    // Recupera la ricetta aggiornata, inclusi i nuovi passi
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
    res.status(500).json({ error: 'Errore durante l\'aggiornamento del programma' });
  }
});


// Avvia il server sulla porta 5001
app.listen(PORT, () => {
  console.log(`Server in esecuzione sulla porta ${PORT}`);
});
