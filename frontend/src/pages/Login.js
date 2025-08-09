import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useAuth } from '../path/to/AuthProvider';  // metti il path corretto
import { useNavigate } from 'react-router-dom';


const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Email non valida').required('Email obbligatoria'),
  password: Yup.string().required('Password obbligatoria'),
});

const Login = () => {
  const { login } = useAuth();    // prende la funzione login dal context
  const navigate = useNavigate(); // per redirect

  return (
    <div style={{ maxWidth: 400, margin: 'auto' }}>
      <h2>Login</h2>
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={LoginSchema}
        onSubmit={async (values, { setSubmitting, setStatus }) => {
          setStatus(null);
          try {
            const response = await axios.post('/login', values);
            const { token } = response.data;

            login(token);  // aggiorna context e salva token

            setStatus({ success: 'Login effettuato con successo!' });

            navigate('/profile'); // redirect a profile dopo login
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
          <Form>
            <div>
              <label htmlFor="email">Email</label><br />
              <Field type="email" name="email" />
              <ErrorMessage name="email" component="div" style={{ color: 'red' }} />
            </div>

            <div>
              <label htmlFor="password">Password</label><br />
              <Field type="password" name="password" />
              <ErrorMessage name="password" component="div" style={{ color: 'red' }} />
            </div>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Caricamento...' : 'Login'}
            </button>

            {status && status.error && <div style={{ color: 'red' }}>{status.error}</div>}
            {status && status.success && <div style={{ color: 'green' }}>{status.success}</div>}
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Login;
