import React, { useEffect, useState } from 'react';
import NavBar from "./NavBar";
import "../scss/landing.scss"; // Assicurati che questo file importi i tuoi stili personalizzati

const LandingPage = ({ onNavigate }) => {
  const [metrics, setMetrics] = useState({
    stoneWashCount: 0,
    lavaCentrifugheCount: 0,
  });
  const [machines, setMachines] = useState([]);

  useEffect(() => {
    // Recupera le metriche dal backend
    fetch("http://localhost:5001/api/metrics")
      .then((res) => res.json())
      .then((data) => {
        setMetrics({
          stoneWashCount: data.stoneWashCount,
          lavaCentrifugheCount: data.lavaCentrifugheCount,
        });
      })
      .catch((err) =>
        console.error("Errore nel recupero delle metriche:", err)
      );

    // Recupera l'elenco delle macchine dal backend
    fetch("http://localhost:5001/api/machines")
      .then((res) => res.json())
      .then((data) => setMachines(data))
      .catch((err) =>
        console.error("Errore nel recupero delle macchine:", err)
      );
  }, []);

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-custom">
        <div className="container">
          <a className="navbar-brand" href="#">LavaManager</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link" href="#" onClick={() => onNavigate('landing')}>
                  Home
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <section id="home" className="landing-section container mt-5">
        <h1>Benvenuti in LavaManager</h1>
        <p>LavaManager è la soluzione completa per la gestione delle ricette industriali.</p>
        <div className="metrics my-4 row">
          <div className="col-md-6 text-center">
            <h3>Numero ricette Stone Wash</h3>
            <p className="metric-value">{metrics.stoneWashCount}</p>
          </div>
          <div className="col-md-6 text-center">
            <h3>Numero ricette Lavacentrifughe</h3>
            <p className="metric-value">{metrics.lavaCentrifugheCount}</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => onNavigate('list')}>
          Visualizza Ricette
        </button>
      </section>

      <section id="machines" className="machines-section container mt-5">
        <h2>Macchine Lavatrici</h2>
        <ul className="list-group">
          {machines.map(machine => (
            <li key={machine.id} className="list-group-item d-flex justify-content-between align-items-center">
              {machine.name}
              <span>
                {machine.isConnected ? (
                  <span className="text-success">&#10004;</span>
                ) : (
                  <span className="text-danger">&#10008;</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <footer className="text-center py-3 mt-5 bg-light">
        <p>&copy; 2025 LavaManager. Tutti i diritti riservati.</p>
      </footer>
    </div>
    /*
    <div>
      <NavBar onNavigate={onNavigate} />
      <section id="home" className="landing-section container mt-5">
        <h1>Benvenuti in LavaManager</h1>
        <p>
          LavaManager è la soluzione completa per la gestione delle ricette di
          lavaggio per macchine industriali.
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
        <button className="btn btn-primary" onClick={() => onNavigate("list")}>
          Visualizza Ricette
        </button>
      </section>

      <section id="machines" className="machines-section container mt-5">
        <h2>Macchine Lavatrici</h2>
        <ul className="list-group">
          {* Esempio statico *}
          <li className="list-group-item d-flex justify-content-between align-items-center">
            Macchina 1<span className="text-success">&#10004;</span>
          </li>
          <li className="list-group-item d-flex justify-content-between align-items-center">
            Macchina 2<span className="text-danger">&#10008;</span>
          </li>
        </ul>
      </section>

      <footer className="text-center py-3 mt-5 bg-light">
        <p>&copy; 2025 LavaManager. Tutti i diritti riservati.</p>
      </footer>
    </div>
    */
  );
};

export default LandingPage;
