import React, { useEffect, useState } from 'react';
import NavBar from './NavBar';
import '../App.css';

function RecipeList({ onLoadRecipe, onNavigate }) {
  const [recipes, setRecipes] = useState([]);
  const [renamingRecipe, setRenamingRecipe] = useState(null);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    fetch('http://localhost:5001/api/program')
      .then((res) => res.json())
      .then((data) => setRecipes(data))
      .catch((err) => console.error("Errore nel caricamento delle ricette", err));
  }, []);

  const createNewRecipe = () => {
    onLoadRecipe({ name: '', steps: [] });
  };

  const deleteRecipe = (id) => {
    if (window.confirm("Sei sicuro di voler eliminare questa ricetta?")) {
      fetch(`http://localhost:5001/api/program/${id}`, { method: 'DELETE' })
        .then((res) => {
          if (res.ok) {
            setRecipes(recipes.filter((r) => r.id !== id));
          }
        })
        .catch((err) => console.error("Errore nell'eliminazione", err));
    }
  };

  const duplicateRecipe = (recipe) => {
    const duplicateData = { ...recipe, name: `Copia di ${recipe.name}` };
    delete duplicateData.id;
    fetch('http://localhost:5001/api/program', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(duplicateData),
    })
      .then((res) => res.json())
      .then((newRecipe) => setRecipes([...recipes, newRecipe]))
      .catch((err) => console.error("Errore nella duplicazione", err));
  };

  const startRenaming = (recipe) => {
    setRenamingRecipe(recipe);
    setNewName(recipe.name);
  };

  const renameRecipe = () => {
    if (renamingRecipe && newName.trim() !== "") {
      fetch(`http://localhost:5001/api/program/${renamingRecipe.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      })
        .then((res) => res.json())
        .then((updatedRecipe) => {
          setRecipes(recipes.map((r) => (r.id === updatedRecipe.id ? updatedRecipe : r)));
          setRenamingRecipe(null);
          setNewName("");
        })
        .catch((err) => console.error("Errore nel rinominare", err));
    }
  };

  const loadFullRecipe = (id) => {
    fetch(`http://localhost:5001/api/program/${id}`)
      .then((res) => res.json())
      .then((fullRecipe) => onLoadRecipe(fullRecipe))
      .catch((err) => console.error("Errore nel caricamento della ricetta", err));
  };

  return (
    <div>
    <NavBar onNavigate={onNavigate} /> 
    <div className="recipe-list-container">
      <h2>Elenco delle Ricette</h2>
      <button onClick={createNewRecipe} style={{ marginBottom: '1rem' }}>
        Nuova Ricetta
      </button>
      {recipes.length === 0 ? (
        <p>Nessuna ricetta salvata.</p>
      ) : (
        <table className="recipe-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Data Creazione</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {recipes.map((recipe) => (
              <tr key={recipe.id}>
                <td>{recipe.name}</td>
                <td>{new Date(recipe.created_at).toLocaleString()}</td>
                <td>
                  <button onClick={() => loadFullRecipe(recipe.id)}>Carica/Modifica</button>
                  <button onClick={() => deleteRecipe(recipe.id)}>Elimina</button>
                  <button onClick={() => duplicateRecipe(recipe)}>Duplica</button>
                  <button onClick={() => startRenaming(recipe)}>Rinomina</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {renamingRecipe && (
        <div className="modal">
          <div className="modal-content">
            <h3>Rinomina Ricetta</h3>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={renameRecipe}>Salva</button>
              <button className="cancel-btn" onClick={() => setRenamingRecipe(null)}>
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

export default RecipeList;
