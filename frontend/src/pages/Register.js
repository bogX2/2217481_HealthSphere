import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Register.module.css';

const RegisterSchema = Yup.object().shape({
  role: Yup.string().oneOf(['patient', 'doctor']).required('Seleziona un ruolo'),
  name: Yup.string().required('Nome obbligatorio'),
  surname: Yup.string().required('Cognome obbligatorio'),
  email: Yup.string().email('Email non valida').required('Email obbligatoria'),
  password: Yup.string().min(6, 'Minimo 6 caratteri').required('Password obbligatoria'),
  phoneNumber: Yup.string().required('Telefono obbligatorio'),
  birthDate: Yup.date().required('Data di nascita obbligatoria'),
  birthPlace: Yup.string().required('Luogo di nascita obbligatorio'),
  fiscalCode: Yup.string().required('Codice fiscale obbligatorio'),
});

const Register = () => {
  const navigate = useNavigate();

  return (
    <div className={styles['login-page']}>
      <header className={styles['login-header']}>
        <img src="/logo192.png" alt="HealthSphere Logo" className={styles['login-logo']} />
        <h1 className={styles['login-title']}>HealthSphere</h1>
      </header>

      <div className={styles['login-container']}>
        <h2>Registrazione</h2>

        <Formik
          initialValues={{
            role: '',
            name: '',
            surname: '',
            email: '',
            password: '',
            phoneNumber: '',
            birthDate: '',
            birthPlace: '',
            fiscalCode: '',
          }}
          validationSchema={RegisterSchema}
          onSubmit={async (values, { setSubmitting, setStatus }) => {
            setStatus(null);
            try {
              await axios.post('http://localhost:8081/api/auth/register', values);
              setStatus({ success: 'Registrazione avvenuta con successo!' });
              navigate('/login');
            } catch (error) {
              setStatus({ error: error.response?.data?.error || 'Errore durante la registrazione' });
            }
            setSubmitting(false);
          }}
        >
          {({ isSubmitting, status }) => (
            <Form className={styles['login-form']}>
              <div className={styles['form-group']}>
                <label>Role</label>
                <Field as="select" name="role" className={styles['form-input']}>
                  <option value="">Select a role</option>
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                </Field>
                <ErrorMessage name="role" component="div" className={styles['error-text']} />
              </div>

              <div className={styles['form-group']}>
                <label>First Name</label>
                <Field type="text" name="name" className={styles['form-input']} />
                <ErrorMessage name="name" component="div" className={styles['error-text']} />
              </div>

              <div className={styles['form-group']}>
                <label>Last Name</label>
                <Field type="text" name="surname" className={styles['form-input']} />
                <ErrorMessage name="surname" component="div" className={styles['error-text']} />
              </div>

              <div className={styles['form-group']}>
                <label>Email</label>
                <Field type="email" name="email" className={styles['form-input']} />
                <ErrorMessage name="email" component="div" className={styles['error-text']} />
              </div>

              <div className={styles['form-group']}>
                <label>Password</label>
                <Field type="password" name="password" className={styles['form-input']} />
                <ErrorMessage name="password" component="div" className={styles['error-text']} />
              </div>

              <div className={styles['form-group']}>
                <label>Phone Number</label>
                <Field type="text" name="phoneNumber" className={styles['form-input']} />
                <ErrorMessage name="phoneNumber" component="div" className={styles['error-text']} />
              </div>

              <div className={styles['form-group']}>
                <label>Date of birth</label>
                <Field type="date" name="birthDate" className={styles['form-input']} />
                <ErrorMessage name="birthDate" component="div" className={styles['error-text']} />
              </div>

              <div className={styles['form-group']}>
                <label>City of birth</label>
                <Field type="text" name="birthPlace" className={styles['form-input']} />
                <ErrorMessage name="birthPlace" component="div" className={styles['error-text']} />
              </div>

              <div className={styles['form-group']}>
                <label>Fiscal Code</label>
                <Field type="text" name="fiscalCode" className={styles['form-input']} />
                <ErrorMessage name="fiscalCode" component="div" className={styles['error-text']} />
              </div>

              <button type="submit" disabled={isSubmitting} className={styles['submit-btn']}>
                {isSubmitting ? 'Caricamento...' : 'Registrati'}
              </button>

              {status && status.error && <div className={styles['status-error']}>{status.error}</div>}
              {status && status.success && <div className={styles['status-success']}>{status.success}</div>}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Register;
