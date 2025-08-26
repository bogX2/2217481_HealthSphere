import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Dropdown = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  // Chiude il menu se l'utente clicca al di fuori di esso
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Funzione per chiudere il menu quando si clicca un'opzione
  const handleItemClick = () => {
    setIsOpen(false);
  };
  
  // Gestisce il logout
  const handleLogoutClick = () => {
    handleItemClick(); // Chiude il menu
    onLogout();       // Esegue la funzione di logout passata come prop
    navigate('/');    // Reindirizza alla home
  };

  return (
    <div className="dropdown" ref={menuRef}>
      {/* - btn-outline-secondary: Stile pulito del pulsante
        - rounded-pill: Bordi arrotondati moderni
        - dropdown-toggle: Aggiunge la freccetta standard di Bootstrap
      */}
      <button
        className="btn btn-outline-secondary rounded-pill dropdown-toggle"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        Menu
      </button>

      {/* - dropdown-menu-end: Allinea il menu a destra per non uscire dallo schermo
        - shadow-lg: Aggiunge un'ombra più marcata per un effetto "fluttuante"
        - La classe 'show' viene aggiunta dinamicamente tramite lo stato di React
      */}
      <ul className={`dropdown-menu me-4 dropdown-menu-end shadow-lg ${isOpen ? 'show' : ''}`}>
        {/* - d-flex, align-items-center, gap-2: Allineano icona e testo usando Flexbox
        */}
        <li>
          <Link to="/" className="dropdown-item d-flex align-items-center gap-2" onClick={handleItemClick}>
            <i className="bi bi-house-door-fill"></i>
            <span>Home</span>
          </Link>
        </li>
        <li>
          <Link to="/profile" className="dropdown-item d-flex align-items-center gap-2" onClick={handleItemClick}>
            <i className="bi bi-person-fill"></i>
            <span>Profile</span>
          </Link>
        </li>
        <li>
          <Link to="/settings" className="dropdown-item d-flex align-items-center gap-2" onClick={handleItemClick}>
            <i className="bi bi-gear-fill"></i>
            <span>Settings</span>
          </Link>
        </li>
        <li><hr className="dropdown-divider" /></li>
        <li>
          <button className="dropdown-item d-flex align-items-center gap-2" onClick={handleLogoutClick}>
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Dropdown;