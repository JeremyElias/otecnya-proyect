import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthProvider'; // Importar AuthContext
import Login from './components/Login';
import Home from './components/Home';
import RequireAuth from './components/RequireAuth';

function App() {
  const { setAuth } = useContext(AuthContext); // Obtener setAuth desde el contexto
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setAuth({ accessToken: token });
      navigate('/home');  // Solo se ejecuta si el token existe
    }
  }, [setAuth, navigate]); // Dependencias de useEffect

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
    </Routes>
  );
}

export default function AppWithRouter() {
  return (
    <Router>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  );
}
