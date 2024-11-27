import React, { useRef, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider'; // Importa AuthContext como exportación nombrada
import axios from '../api/axios';

const LOGIN_URL = '/auth';

function Login() {
  const { setAuth } = useContext(AuthContext); // Usamos setAuth del contexto
  const userRef = useRef();
  const errRef = useRef();

  const [user, setUser] = useState('');
  const [pwd, setPwd] = useState('');
  const [errMsg, setErrMsg] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si ya existe un token en el localStorage y restaurar el estado de autenticación
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      const { accessToken, user, roles } = JSON.parse(storedAuth);
      setAuth({ user, roles, accessToken });
      navigate('/home');  // Redirigir al home si ya hay sesión
    }

    if (userRef.current) {
      userRef.current.focus();
    }
  }, [setAuth, navigate]);

  useEffect(() => {
    setErrMsg('');
  }, [user, pwd]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        LOGIN_URL,
        JSON.stringify({ user, pwd }),
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true, // Asegura que las cookies se envíen
        }
      );
      const accessToken = response?.data?.accessToken;
      const roles = response?.data?.roles;

      // Guardar los datos en el contexto y en localStorage
      setAuth({ user, roles, accessToken });
      localStorage.setItem('auth', JSON.stringify({ user, roles, accessToken })); // Guardar en localStorage

      setUser('');
      setPwd('');
      navigate('/home');
    } catch (err) {
      if (!err?.response) {
        setErrMsg('El servidor no responde');
      } else if (err.response?.status === 400) {
        setErrMsg('Usuario o contraseña incorrectos');
      } else if (err.response?.status === 401) {
        setErrMsg('No autorizado');
      } else {
        setErrMsg('Error de Inicio de Sesión');
      }
      if (errRef.current) {
        errRef.current.focus();
      }
    }
  };

  return (
    <section className="flex items-center justify-center h-screen bg-gray-200">
      <div className="flex w-full max-w-7xl">
        <div className="w-1/2 h-full relative">
          <video src="/fondo1.mp4" className="w-full h-full object-cover rounded-l-lg" autoPlay loop muted />
        </div>
        <div className="w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md p-8 rounded-lg">
            <h1 className="text-2xl font-bold text-center mb-4">Login</h1>
            {errMsg && (
              <p ref={errRef} className="text-red-500 text-sm mb-4" aria-live="assertive">
                {errMsg}
              </p>
            )}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2" htmlFor="username">
                  Usuario
                </label>
                <input
                  ref={userRef}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  type="text"
                  id="username"
                  autoComplete="off"
                  onChange={(e) => setUser(e.target.value)}
                  value={user}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2" htmlFor="password">
                  Contraseña
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  type="password"
                  id="password"
                  onChange={(e) => setPwd(e.target.value)}
                  value={pwd}
                  required
                />
              </div>
              <button
                className="w-full px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600"
                type="submit"
              >
                Ingresar
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;
