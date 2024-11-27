import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';
import { Navigate } from 'react-router-dom';

const RequireAuth = ({ children }) => {
  const { auth } = useContext(AuthContext);

  if (!auth || !auth.accessToken) {
    // Si no hay token, redirige al login
    return <Navigate to="/" />;
  }

  return children;
};

export default RequireAuth;
