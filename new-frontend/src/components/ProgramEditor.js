import React, { useState, useEffect } from 'react';
import '../App.css';

const defaultParameters = {
  riempimento: { litri: 0, acqua: 'fredda' },
  rotazione: { giri: 0, tempoPausa: 0, velocita: 0 },
  mantenimento: { durata: 0 },
  riscaldamento: { temperatura: 0 },
  scarico: { portata: 0 },
  centrifuga: { velocita: 0, durata: 0 },
};

const stepTypes = [
  { type: 'riempimento', label: 'Riempimento' },
  { type: 'rotazione', label: 'Rotazione' },
  { type: 'mantenimento', label: 'Mantenimento' },
  { type: 'riscaldamento', label: 'Riscaldamento' },
  { type: 'scarico', label: 'Scarico' },
  { type: 'centrifuga', label: 'Centrifuga' },
];

function StepEditor({ step, onSave, onCancel }) {
  const [parameters, setParameters] = useState(step.parameters);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setParameters({ ...parameters, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...step, parameters });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Edita il passo: {step.type}</h3>
        <form onSubmit={handleSubmit}>
          {step.type === 'riempimento' && (
            <>
              <div>
                <label>Litri:</label>
                <input name="litri" type="number" value={parameters.litri} onChange={handleChange} />
              </div>
              <div>
                <label>Tipo acqua:</label>
                <select name="acqua" value={parameters.acqua} onChange={handleChange}>
                  <option value="fredda">Fredda</option>
                  <option value="calda">Calda</option>
                  <option value="mista">Mista</option>
                </select>
              </div>
            </>
          )}
          {step.type === 'rotazione' && (
            <>
              <div>
                <label>Giri:</label>
                <input name="giri" type="number" value={parameters.giri} onChange={handleChange} />
              </div>
              <div>
                <label>Tempo Pausa:</label>
                <input name="tempoPausa" type="number" value={parameters.tempoPausa} onChange={handleChange} />
              </div>
              <div>
                <label>Velocità:</label>
                <input name="velocita" type="number" value={parameters.velocita} onChange={handleChange} />
              </div>
            </>
          )}
          {step.type === 'mantenimento' && (
            <div>
              <label>Durata:</label>
              <input name="durata" type="number" value={parameters.durata} onChange={handleChange} />
            </div>
          )}
          {step.type === 'riscaldamento' && (
            <div>
              <label>Temperatura:</label>
              <input name="temperatura" type="number" value={parameters.temperatura} onChange={handleChange} />
            </div>
          )}
          {step.type === 'scarico' && (
            <div>
              <label>Portata:</label>
              <input name="portata" type="number" value={parameters.portata} onChange={handleChange} />
            </div>
          )}
          {step.type === 'centrifuga' && (
            <>
              <div>
                <label>Velocità:</label>
                <input name="velocita" type="number" value={parameters.velocita} onChange={handleChange} />
              </div>
              <div>
                <label>Durata:</label>
                <input name="durata" type="number" value={parameters.durata} onChange={handleChange} />
              </div>
            </>
          )}
          <div className="modal-actions">
            <button type="submit">Salva</button>
            <button type="button" className="cancel-btn" onClick={onCancel}>Annulla</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InsertStepModal({ onInsert, onCancel }) {
  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Scegli il tipo di passo da inserire</h3>
        <div className="insert-options">
          {stepTypes.map((s) => (
            <button key={s.type} onClick={() => onInsert(s.type)}>
              {s.label}
            </button>
          ))}
        </div>
        <button className="cancel-btn" onClick={onCancel}>Annulla</button>
      </div>
    </div>
  );
}

function ProgramEditor({ initialRecipe }) {
    // Nuovi state per i campi del data model
    const [colore, setColore] = useState(initialRecipe ? initialRecipe.colore : '');
    const [fase, setFase] = useState(initialRecipe ? initialRecipe.fase : '');
    const [disposizione, setDisposizione] = useState(initialRecipe ? initialRecipe.disposizione : 'GEN');
    
    // State per i passi della ricetta
    const [steps, setSteps] = useState(initialRecipe ? initialRecipe.steps : []);
  
    // Per altri campi non presenti nel data model originario
    // (Il campo recipe_name verrà generato dal db se usi una generated column)
    
    const [editingStep, setEditingStep] = useState(null);
    const [insertIndex, setInsertIndex] = useState(null);
  
    useEffect(() => {
      if (initialRecipe) {
        setColore(initialRecipe.colore || '');
        setFase(initialRecipe.fase || '');
        setDisposizione(initialRecipe.disposizione || 'GEN');
        setSteps(initialRecipe.steps || []);
      }
    }, [initialRecipe]);
  
    const addStep = (stepType, index = steps.length) => {
      const newStep = {
        id: Date.now(),
        type: stepType,
        parameters: { ...defaultParameters[stepType] },
      };
      const newSteps = [...steps];
      newSteps.splice(index, 0, newStep);
      setSteps(newSteps);
    };
  
    const deleteStep = (index) => {
      setSteps(steps.filter((_, i) => i !== index));
    };
  
    const updateStep = (index, updatedStep) => {
      setSteps(steps.map((step, i) => (i === index ? updatedStep : step)));
    };
  
    // Aggiorna o crea la ricetta, includendo i nuovi campi (colore, fase, disposizione)
    const saveProgram = () => {
      const programData = {
        colore,
        fase,
        disposizione,
        steps,
      };
  
      if (initialRecipe && initialRecipe.id) {
        // Aggiorna il programma esistente
        fetch(`http://localhost:5001/api/program/${initialRecipe.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(programData),
        })
          .then((res) => res.json())
          .then((data) => {
            console.log('Programma aggiornato con ID:', data.id);
            alert('Programma aggiornato con successo!');
          })
          .catch((err) => console.error("Errore nell'aggiornamento:", err));
      } else {
        // Crea un nuovo programma
        fetch('http://localhost:5001/api/program', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(programData),
        })
          .then((res) => res.json())
          .then((data) => {
            console.log('Programma creato con ID:', data.id);
            alert('Programma salvato con successo!');
          })
          .catch((err) => console.error("Errore nel salvataggio:", err));
      }
    };
  

    // Funzione per esportare la ricetta in formato JSON
    const exportRecipe = () => {
        if (initialRecipe && initialRecipe.id) {
          // Imposta il browser per scaricare il file JSON
          window.location.href = `http://localhost:5001/api/program/${initialRecipe.id}/export`;
        } else {
          alert("Salva la ricetta prima di esportarla.");
        }
      };

  return (
    <div className="program-editor-container">
      <h2>Editor del Programma di Lavaggio</h2>

      {/* Form per inserire i nuovi campi */}
      <div className="program-header">
        <div>
          <label>Colore:</label>
          <input
            type="text"
            value={colore}
            onChange={(e) => setColore(e.target.value)}
            placeholder="Inserisci il colore"
          />
        </div>
        <div>
          <label>Fase:</label>
          <input
            type="text"
            value={fase}
            onChange={(e) => setFase(e.target.value)}
            placeholder="Inserisci la fase"
          />
        </div>
        <div>
          <label>Disposizione:</label>
          <input
            type="text"
            value={disposizione}
            onChange={(e) => setDisposizione(e.target.value)}
            placeholder="Inserisci la disposizione (default GEN)"
          />
        </div>
      </div>


      <div className="toolbar">
        {stepTypes.map((s) => (
          <button key={s.type} onClick={() => addStep(s.type)}>
            {s.label}
          </button>
        ))}
      </div>
      <div className="editor-area">
        {steps.length === 0 && <p>Nessun passo aggiunto.</p>}
        {steps.map((step, index) => (
          <div key={step.id} className="step-item">
            <div className="step-header">
              <div>
                {index + 1}. <strong>{step.type}</strong>
              </div>
              <div>
                <button onClick={() => setEditingStep({ ...step, index })}>Modifica</button>
                <button onClick={() => deleteStep(index)}>Elimina</button>
                <button onClick={() => setInsertIndex(index)}>Inserisci prima</button>
              </div>
            </div>
            <div className="step-parameters">
              {Object.entries(step.parameters).map(([key, value]) => (
                <span key={key}>
                  {key}: {value};{' '}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="program-actions">
        <button onClick={saveProgram}>Salva Programma</button>
        <button onClick={exportRecipe}>Esporta in JSON</button>
      </div>
      {editingStep && (
        <StepEditor
          step={editingStep}
          onSave={(updatedStep) => {
            updateStep(editingStep.index, updatedStep);
            setEditingStep(null);
          }}
          onCancel={() => setEditingStep(null)}
        />
      )}
      {insertIndex !== null && (
        <InsertStepModal
          onInsert={(selectedType) => {
            addStep(selectedType, insertIndex);
            setInsertIndex(null);
          }}
          onCancel={() => setInsertIndex(null)}
        />
      )}
    </div>
  );
}

export default ProgramEditor;
