// src/components/NavBar.js
import React from 'react';

function NavBar({ onNavigate }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-custom">
      <div className="container">
        <a className="navbar-brand" href="#">LavaManager</a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              {/* Torna alla landing page */}
              <a className="nav-link" href="#" onClick={() => onNavigate('landing')}>
                Home
              </a>
            </li>
            {/* Aggiungi altri link se vuoi */}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
