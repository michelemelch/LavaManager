import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import RecipeList from './components/RecipeList';
import ProgramEditor from './components/ProgramEditor';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  // Possiamo usare una semplice logica di navigazione basata su stato.
  const [page, setPage] = useState('landing');
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const handleLoadRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setPage('editor');
  };

  return (
    <div className="App">
      {page === 'landing' && <LandingPage onNavigate={setPage} />}
      {page === 'list' && 
          <RecipeList 
              onLoadRecipe={handleLoadRecipe}
              onNavigate={setPage}  
          />}
      {page === 'editor' && (
        <>
          <button className="back-button" onClick={() => setPage('list')}>
            Torna all'elenco
          </button>
          <ProgramEditor initialRecipe={selectedRecipe} />
        </>
      )}
    </div>
  );
}

export default App;

/*
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
*/


// Wrapper componenti per gestire stato tra ricette e editor
/*
const RecipeListWrapper = () => {
  const navigate = useNavigate();
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const handleLoadRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    navigate('/editor');
  };

  return <RecipeList onLoadRecipe={handleLoadRecipe} />;
};

const ProgramEditorWrapper = () => {
  const navigate = useNavigate();
  const [selectedRecipe, setSelectedRecipe] = useState(null); // o da context, se condividi

  return (
    <>
      <button className="back-button" onClick={() => navigate('/recipes')}>
        Torna all'elenco
      </button>
      <ProgramEditor initialRecipe={selectedRecipe} />
    </>
  );
};*/