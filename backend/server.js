const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
require('dotenv').config(); // Cargar variables de entorno
const app = express();
const path = require('path');
const multer = require('multer');

// Configuración de multer para almacenar las imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Guardar las imágenes en la carpeta 'public/images'
    cb(null, path.join(__dirname, 'public', 'images'));
  },
  filename: (req, file, cb) => {
    // Guardar la imagen con un nombre único basado en el timestamp
    cb(null, Date.now() + path.extname(file.originalname)); // Extensión original
  },
});

// Filtro para asegurarse de que solo se suban imágenes
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes con formato jpg, jpeg, png o gif.'));
    }
  },
});

// Habilitar CORS con configuración correcta
app.use(cors({
  origin: 'http://localhost:3000',  // Permite acceso solo desde tu frontend
  credentials: true,  // Permite el uso de cookies si es necesario
  methods: ['GET', 'POST', 'OPTIONS'],  // Permite los métodos que necesitas
  allowedHeaders: ['Content-Type', 'Authorization'],  // Permite estas cabeceras
}));

app.use(express.json());

// Configuración de la base de datos MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err);
    process.exit(1);
  }
  console.log('Conexión exitosa a la base de datos');
});

// Ruta de autenticación
app.post('/auth', (req, res) => {
  const { user, pwd } = req.body;

  // Buscar al usuario en la base de datos
  const query = 'SELECT * FROM usuarios WHERE username = ?';
  db.execute(query, [user], (err, results) => {
    if (err) {
      console.error('Error al consultar la base de datos:', err);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    const foundUser = results[0];

    // Comparar las contraseñas
    const isPasswordValid = bcrypt.compareSync(pwd, foundUser.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    // Generar el token de acceso
    const accessToken = jwt.sign(
      { userId: foundUser.id, username: foundUser.username, roles: foundUser.roles },
      process.env.JWT_SECRET,  // Usando la variable de entorno desde .env
      { expiresIn: '1h' }
    );

    // Retornar el token de acceso al frontend
    res.json({ accessToken });
  });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'Token no proporcionado' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido' });
    req.user = user;
    next();
  });
}

// Usar el middleware para proteger rutas específicas
app.use(express.json()); // Asegúrate de que Express pueda manejar JSON

// Ruta para crear proyectos, con la carga de archivos mediante multer
app.post("/api/projects", upload.single('img'), (req, res) => {
  const { name, description, participants, totalParticipants, dateStart, dateEnd } = req.body;

  // Verificar que los campos estén presentes
  if (!name || !description || !participants || !totalParticipants || !dateStart || !dateEnd || !req.file) {
    return res.status(400).json({ message: "Faltan datos en la solicitud" });
  }

  const imgPath = `/images/${req.file.filename}`; // Ruta donde se guardará la imagen

  // Asegúrate de que 'query' esté bien definido
  const query = "INSERT INTO projects (name, description, participants, totalParticipants, dateStart, dateEnd, img) VALUES (?, ?, ?, ?, ?, ?, ?)";

  // Ejecutar la consulta SQL
  db.query(query, [name, description, participants, totalParticipants, dateStart, dateEnd, imgPath], (err, result) => {
    if (err) {
      console.error("Error en la consulta SQL:", err);
      return res.status(500).json({ message: "Error al guardar el proyecto en la base de datos", error: err.message });
    }
    console.log("Resultado de la inserción:", result);  // Verifica la respuesta del resultado
    res.status(201).json({ message: "Proyecto creado exitosamente", result });
  });
});

app.get('/api/projects', (req, res) => {
  const query = 'SELECT * FROM projects';
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error al obtener los proyectos', error: err });
    }
    // Enviar la respuesta con los proyectos en formato JSON
    res.json(result);
  });
});

// Manejo de solicitudes OPTIONS (preflight)
app.options('*', cors());  // Permite solicitudes preflight (OPTIONS)

// Ruta estática para acceder a las imágenes
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Iniciar el servidor
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});