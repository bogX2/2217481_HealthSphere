import React, { useState, useEffect, useRef } from 'react';
import '../styles/Dropdown.css';

const DropdownMenu = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  // Chiude il menu se clicchi fuori
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="dropdown-nav" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="dropdown-button"
        aria-haspopup="true"
        aria-expanded={open}
      >
        Menu ▾
      </button>

      {open && (
        <ul className="dropdown-list" role="menu">
          <li role="menuitem"><a href="/">Home</a></li>
          <li role="menuitem"><a href="/profile">Profilo</a></li>
          <li role="menuitem"><a href="/settings">Impostazioni</a></li>
          <li role="menuitem"><a href="/logout">Logout</a></li>
        </ul>
      )}
    </nav>
  );
};

export default DropdownMenu;
