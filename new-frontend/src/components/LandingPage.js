import React from 'react';
import NavBar from './NavBar';
import '../scss/landing.scss'; // Assicurati che questo file importi i tuoi stili personalizzati

const LandingPage = ({ onNavigate }) => {
  return (
    <div>
      <NavBar onNavigate={onNavigate} />
      <section id="home" className="landing-section container mt-5">
        <h1>Benvenuti in LavaManager</h1>
        <p>
          LavaManager è la soluzione completa per la gestione delle ricette di lavaggio per macchine industriali.
        </p>
        <div className="metrics my-4 row">
          <div className="col-md-6 text-center">
            <h3>Numero ricette Stone Wash</h3>
            <p className="metric-value">0</p>
          </div>
          <div className="col-md-6 text-center">
            <h3>Numero ricette Lavacentrifughe</h3>
            <p className="metric-value">0</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => onNavigate('list')}>
          Visualizza Ricette
        </button>
      </section>

      <section id="machines" className="machines-section container mt-5">
        <h2>Macchine Lavatrici</h2>
        <ul className="list-group">
          {/* Esempio statico */}
          <li className="list-group-item d-flex justify-content-between align-items-center">
            Macchina 1
            <span className="text-success">&#10004;</span>
          </li>
          <li className="list-group-item d-flex justify-content-between align-items-center">
            Macchina 2
            <span className="text-danger">&#10008;</span>
          </li>
        </ul>
      </section>

      <footer className="text-center py-3 mt-5 bg-light">
        <p>&copy; 2025 LavaManager. Tutti i diritti riservati.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
