import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useAuth } from '../auth/AuthProvider.js';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Email non valida').required('Email obbligatoria'),
  password: Yup.string().required('Password obbligatoria'),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="login-page">
      {/* Header esterno al box */}
      <header className="login-header">
        <img src="/logo192.png" alt="HealthSphere Logo" className="login-logo" />
        <h1 className="login-title">HealthSphere</h1>
      </header>

      <div className="login-container">
        <h2>Login</h2>
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={async (values, { setSubmitting, setStatus }) => {
            setStatus(null);
            try {
              const response = await axios.post('http://localhost:8081/api/auth/login', values);
              const { token } = response.data;
              login(token);
              setStatus({ success: 'Login effettuato con successo!' });
              // navigate('/profile');
            } catch (error) {
              if (error.response && error.response.status === 401) {
                setStatus({ error: 'Credenziali non valide' });
              } else {
                setStatus({ error: 'Errore di connessione al server' });
              }
            }
            setSubmitting(false);
          }}
        >
          {({ isSubmitting, status }) => (
            <Form className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <Field type="email" name="email" className="form-input" />
                <ErrorMessage name="email" component="div" className="error-text" />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <Field type="password" name="password" className="form-input" />
                <ErrorMessage name="password" component="div" className="error-text" />
              </div>

              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Caricamento...' : 'Login'}
              </button>

              {status && status.error && <div className="status-error">{status.error}</div>}
              {status && status.success && <div className="status-success">{status.success}</div>}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Login;
