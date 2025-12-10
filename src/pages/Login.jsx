// src/pages/Login.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, LogIn, AlertCircle, Loader2 } from "lucide-react";
import "../styles/Login.css";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../config/firebase"; // Asegura los imports

const Login = () => {
  // Hooks
  const navigate = useNavigate();
  const { login } = useAuth(); // Extraemos la función login del contexto

  // Estados locales
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(""); // Para mostrar errores en pantalla
  const [loading, setLoading] = useState(false); // Para el estado del botón

  // Manejo de inputs
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Limpiamos el error cuando el usuario empieza a escribir de nuevo
    if (error) setError("");
  };

  // Función auxiliar para traducir errores de Firebase
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/invalid-email":
        return "El formato del correo no es válido.";
      case "auth/user-disabled":
        return "Este usuario ha sido deshabilitado.";
      case "auth/user-not-found":
        return "No existe una cuenta con este correo.";
      case "auth/wrong-password":
        return "La contraseña es incorrecta.";
      case "auth/invalid-credential":
        return "Credenciales incorrectas. Verifica correo y contraseña.";
      case "auth/too-many-requests":
        return "Demasiados intentos fallidos. Intenta más tarde.";
      default:
        return "Ocurrió un error al iniciar sesión. Intenta nuevamente.";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Intentando iniciar sesión con:", form.email);

      // Llamada a Firebase a través del Contexto
      await login(form.email, form.password);

      console.log("Login exitoso. Redirigiendo...");
      navigate("/AdminDashboard"); // Redirige al Dashboard
    } catch (err) {
      // "Print" del error en consola para debugging
      console.error("Error en Login:", err.code, err.message);

      // Mostrar mensaje amigable al usuario
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <form className="login-card glass-card" onSubmit={handleSubmit}>
        <h2 className="login-title">Acceso</h2>
        <p className="login-subtitle">Ingresa tus credenciales</p>
        {/* Alerta de Error */}
        {error && (
          <div
            className="error-alert"
            style={{
              backgroundColor: "#fee2e2",
              color: "#dc2626",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.9rem",
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        {/* Email */}
        <div className="input-box">
          <Mail className="input-icon" />
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={handleChange}
            required
            disabled={loading} // Deshabilitar mientras carga
          />
        </div>
        {/* Password */}
        <div className="input-box">
          <Lock className="input-icon" />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            required
            disabled={loading} // Deshabilitar mientras carga
          />
        </div>
        {/* Submit Button */}
        <button
          type="submit"
          className="btn-login"
          disabled={loading}
          style={{
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              <LogIn size={18} />
              Entrar
            </>
          )}
        </button>

      </form>
    </div>
  );
};

export default Login;
