import React, { createContext, useState, useEffect } from 'react';

// Crear el contexto de autenticación
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true); // Estado de carga

  useEffect(() => {
    const savedAuth = localStorage.getItem('auth');

    if (savedAuth) {
      setAuth(JSON.parse(savedAuth));
    }

    setLoading(false); // Cambiar a false cuando termine la carga
  }, []);

  // Asegúrate de que el token se guarde en localStorage cuando se actualice `auth`
  useEffect(() => {
    if (auth) {
      localStorage.setItem('auth', JSON.stringify(auth));
    }
  }, [auth]);

  const logout = () => {
    setAuth(null);
    localStorage.removeItem('auth');
  };

  if (loading) {
    return <div>Loading...</div>; // Muestra un mensaje de carga mientras se verifica el estado de autenticación
  }

  return (
    <AuthContext.Provider value={{ auth, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
