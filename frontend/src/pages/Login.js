import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.css'; 

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Email non valida').required('Email obbligatoria'),
  password: Yup.string().min(6, 'Minimo 6 caratteri').required('Password obbligatoria'),
});

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="login-page">
      <header className="login-header">
        <img src="/logo192.png" alt="HealthSphere Logo" className="login-logo" />
        <h1 className="login-title">HealthSphere</h1>
      </header>

      <div className="login-container">
        <h2>Login</h2>

        <Formik
          initialValues={{
            email: '',
            password: '',
          }}
          validationSchema={LoginSchema}
          onSubmit={async (values, { setSubmitting, setStatus }) => {
            setStatus(null);
            try {
              await axios.post('http://localhost:8081/api/auth/login', values);
              setStatus({ success: 'Login avvenuto con successo!' });
              navigate('/profile');
            } catch (error) {
              setStatus({ error: error.response?.data?.error || 'Errore durante il login' });
            }
            setSubmitting(false);
          }}
        >
          {({ isSubmitting, status }) => (
            <Form className="login-form">
              <div className="form-group">
                <label>Email</label>
                <Field type="email" name="email" className="form-input" />
                <ErrorMessage name="email" component="div" className="error-text" />
              </div>

              <div className="form-group">
                <label>Password</label>
                <Field type="password" name="password" className="form-input" />
                <ErrorMessage name="password" component="div" className="error-text" />
              </div>

              <button type="submit" disabled={isSubmitting} className="submit-btn">
                {isSubmitting ? 'Caricamento...' : 'Accedi'}
              </button>

              {status && status.error && <div className="status-error">{status.error}</div>}
              {status && status.success && <div className="status-success">{status.success}</div>}
            </Form>
          )}
        </Formik>

        <p className="login-footer">
          Non hai un account?{' '}
          <span className="link-text" onClick={() => navigate('/register')}>
            Registrati
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
