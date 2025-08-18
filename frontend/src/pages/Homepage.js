import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Homepage.module.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(true);

  const handleHide = (path) => {
    setVisible(false);
    setTimeout(() => navigate(path), 500); // aspetta che l'animazione finisca
  };

  return (
    <div className={`${styles.container} ${!visible ? styles.hidden : ''}`}>
      <img src="/logo192.png" alt="HealthSphere Logo" className={styles.logo} />
      <h1 className={styles.title}>HealthSphere</h1>
      <p className={styles.description}>
        Your personal healthcare management platform — easy, secure, and efficient.
      </p>
      <div className={styles.buttons}>
        <button onClick={() => handleHide('/login')} className={`${styles.btn} ${styles.primaryBtn}`}>
          Login
        </button>
        <button onClick={() => handleHide('/register')} className={`${styles.btn} ${styles.secondaryBtn}`}>
          Register
        </button>
      </div>
    </div>
  );
};

export default HomePage;
