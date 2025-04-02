import React from 'react';
import '../scss/landing.scss'; // Importa il file SCSS specifico per la landing page

const LandingPage = () => {
  return (
    <div>
      {/* Header con menù */}
      <nav className="navbar navbar-expand-lg navbar-custom">
        <div className="container">
          <a className="navbar-brand" href="#">LavaManager</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link" href="#home">Home</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#features">Caratteristiche</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#contact">Contatti</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Sezione principale della landing page */}
      <section id="home" className="landing-section container">
        <h1>Benvenuti in LavaManager</h1>
        <p>La soluzione completa per la gestione delle ricette di lavaggio per macchine industriali.</p>
        <button className="btn btn-primary">Scopri di più</button>
      </section>

      {/* Sezione Caratteristiche */}
      <section id="features" className="features-section container mt-5">
        <h2>Caratteristiche</h2>
        <p>Descrivi qui le funzionalità principali del sistema, come la gestione in tempo reale, la conversione in formato proprietario, ecc.</p>
      </section>

      {/* Sezione Contatti */}
      <section id="contact" className="contact-section container mt-5">
        <h2>Contatti</h2>
        <p>Inserisci qui le informazioni per contattare il supporto o per richiedere maggiori informazioni.</p>
      </section>

      {/* Footer */}
      <footer className="text-center py-3 mt-5 bg-light">
        <p>&copy; 2025 LavaManager. Tutti i diritti riservati.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
