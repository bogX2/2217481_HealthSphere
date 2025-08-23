import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Login.module.css';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Email non valida').required('Email obbligatoria'),
  password: Yup.string().min(6, 'Minimo 6 caratteri').required('Password obbligatoria'),
});

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <img src="/logo192.png" alt="HealthSphere Logo" className={styles.logo} />
        <h1 className={styles.title}>HealthSphere</h1>
      </header>

      <div className={styles.loginContainer}>
        <h2>Login</h2>

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={async (values, { setSubmitting, setStatus }) => {
          setStatus(null);
          try {
            const res = await axios.post('http://localhost:8081/api/auth/login', values);

            // salva il token nel localStorage
             // ✅ salva il token correttamente
              const token = res.data.token;
              localStorage.setItem('token', token);

              // ✅ notifica i componenti che il login è cambiato
              window.dispatchEvent(new Event('authChanged'));

              setStatus({ success: 'Login avvenuto con successo!' });

              // ✅ naviga al profilo
              navigate('/profile');
          } catch (error) {
            setStatus({ error: error.response?.data?.error || 'Errore durante il login' });
          }
          setSubmitting(false);
        }}

        >
          {({ isSubmitting, status }) => (
            <Form className={styles.loginForm}>
              <div className={styles.formGroup}>
                <label>Email</label>
                <Field type="email" name="email" className={styles.formInput} />
                <ErrorMessage name="email" component="div" className={styles.errorText} />
              </div>

              <div className={styles.formGroup}>
                <label>Password</label>
                <Field type="password" name="password" className={styles.formInput} />
                <ErrorMessage name="password" component="div" className={styles.errorText} />
              </div>

              <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
                {isSubmitting ? 'Caricamento...' : 'Accedi'}
              </button>

              {status && status.error && <div className={styles.statusError}>{status.error}</div>}
              {status && status.success && <div className={styles.statusSuccess}>{status.success}</div>}
            </Form>
          )}
        </Formik>

        <p className={styles.loginFooter}>
          Non hai un account?{' '}
          <span className={styles.linkText} onClick={() => navigate('/register')}>
            Registrati
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;