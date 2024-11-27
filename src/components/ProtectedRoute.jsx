import { useNavigate } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import AuthContext from '../context/AuthProvider';

function ProtectedRoute({ children }) {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth?.accessToken) {
      navigate('/login'); // Redirige si no está autenticado
    }
  }, [auth, navigate]);

  return children;
}

export default ProtectedRoute;
