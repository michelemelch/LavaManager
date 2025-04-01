import React, { useState } from 'react';
import RecipeList from './components/RecipeList';
import ProgramEditor from './components/ProgramEditor';
import './App.css';

function App() {
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const handleLoadRecipe = (recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleBackToList = () => {
    setSelectedRecipe(null);
  };

  return (
    <div className="App">
      <h1>LavaManager</h1>
      {selectedRecipe ? (
        <>
          <button className="back-button" onClick={handleBackToList}>
            Torna all'elenco
          </button>
          <ProgramEditor initialRecipe={selectedRecipe} />
        </>
      ) : (
        <RecipeList onLoadRecipe={handleLoadRecipe} />
      )}
    </div>
  );
}

export default App;
