import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Email non valida").required("Email obbligatoria"),
  password: Yup.string().min(6, "Minimo 6 caratteri").required("Password obbligatoria"),
});

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100" style={{ backgroundColor: '#e8f7f5' }}>
      <div className={`card shadow-lg p-5 rounded-4 text-center`} style={{ maxWidth: '600px', borderColor: 'transparent', backgroundColor: '#ffffff' }}>
        {/* Header with logo and title */}
        <div className="d-flex align-items-center mb-5">
  <img
    src="/logo192.png"
    alt="HealthSphere Logo"
    className="rounded-circle me-3"
    style={{ width: '60px', height: '60px', border: '3px solid #2a9d8f' }}
  />
  <h1 className="h4 fw-bold text-dark mb-0">HealthSphere</h1>
</div>

        <h4 className="text-center mb-4 h3 fw-bold">Login</h4>

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={LoginSchema}
          onSubmit={async (values, { setSubmitting, setStatus }) => {
            setStatus(null);
            try {
              const res = await axios.post("http://localhost:8081/api/auth/login", values);
              const token = res.data.token;
              localStorage.setItem("token", token);
              window.dispatchEvent(new Event("authChanged"));
              setStatus({ success: "Login avvenuto con successo!" });
              navigate("/profile");
            } catch (error) {
              setStatus({ error: error.response?.data?.error || "Errore durante il login" });
            }
            setSubmitting(false);
          }}
        >
          {({ isSubmitting, status }) => (
            <Form className="text-start">
              <div className="mb-3">
                <label className="form-label fw-bold">Email</label>
                <Field type="email" name="email" className="form-control rounded-pill" />
                <ErrorMessage name="email" component="div" className="text-danger small mt-1" />
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold">Password</label>
                <Field type="password" name="password" className="form-control rounded-pill" />
                <ErrorMessage name="password" component="div" className="text-danger small mt-1" />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-outline-success btn-lg w-100 rounded-pill"
              >
                {isSubmitting ? "Loading ..." : "Login"}
              </button>

              {status && status.error && (
                <div className="text-danger text-center mt-3 small">{status.error}</div>
              )}
              {status && status.success && (
                <div className="text-success text-center mt-3 small">{status.success}</div>
              )}
            </Form>
          )}
        </Formik>

        <p className="text-center mt-4 mb-0 text-muted">
          Don't have an account?{" "}
          <span
            className="text-primary fw-semibold"
            role="button"
            onClick={() => navigate("/register")}
            style={{ color: '#2a9d8f', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Sing up 
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;