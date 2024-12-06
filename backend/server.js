const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const app = express();
const path = require('path');
const multer = require('multer');
const XLSX = require('xlsx');
require('dotenv').config(); // Cargar variables de entorno


const uploadExcel = multer({ dest: 'uploads/' });


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
// Ruta estática para acceder a las imágenes
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.post("/api/projects", upload.single('img'), (req, res) => {
  const { name, description, totalParticipants , total_questions, dateStart, dateEnd } = req.body;

  // Verificar campos
  if (!name || !description || !totalParticipants || !total_questions || !dateStart || !dateEnd || !req.file) {
    console.error("Datos faltantes:", req.body, req.file);
    return res.status(400).json({ message: "Faltan datos en la solicitud" });
  }

  const imgPath = `/images/${req.file.filename}`;

  const query = "INSERT INTO projects (name, description, totalParticipants, total_questions, dateStart, dateEnd, img) VALUES (?, ?, ?, ?, ?, ?, ?)";

  db.query(query, [name, description, totalParticipants, total_questions, dateStart, dateEnd, imgPath], (err, result) => {
    if (err) {
      console.error("Error en la consulta SQL:", err);
      return res.status(500).json({ message: "Error al guardar el proyecto en la base de datos", error: err.message });
    }
    console.log("Resultado de la inserción:", result);
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

app.get('/api/projects/:id', (req, res) => {
  const { id } = req.params;

  // Consulta SQL para obtener el proyecto por ID
  const query = 'SELECT * FROM Projects WHERE id = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error al obtener el proyecto:', err);
      return res.status(500).json({ message: 'Error al obtener el proyecto' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    res.json(result[0]); // Devuelve el primer proyecto encontrado
  });
});


app.post('/api/upload-excel', (req, res) => {
  const { data, projectId, totalQuestions } = req.body;

  console.log('Datos recibidos:', req.body);

  if (!data || !projectId || !totalQuestions) {
    return res.status(400).json({ error: 'Faltan datos o projectId' });
  }

  // Aquí puedes realizar las inserciones en la base de datos. Por ejemplo:
  const query = 'INSERT INTO projectsPeopleData (rut, nombre, respuestas_acertadas, en_proceso, respuestas_erroneas, projectId) VALUES ?';

  // Formateamos los datos en un arreglo para la consulta SQL
  const values = data.map(item => [
    item.rut,
    item.nombre,
    item.respuestas_acertadas || 0, // Si no hay respuesta acertada, asumimos 0
    totalQuestions,  // Asignamos el valor totalQuestions a en_proceso
    item.respuestas_erroneas || 0, // Si no hay respuestas erróneas, asumimos 0
    projectId
  ]);

  // Ejecutar la consulta para insertar los datos en la tabla projectsPeopleData
  db.query(query, [values], (err, result) => {
    if (err) {
      console.error('Error al insertar los datos:', err.message);
      return res.status(500).json({ error: 'Error al insertar los datos' });
    }

    res.status(200).json({ message: 'Datos subidos con éxito', result });
  });
});



app.get('/api/projectsPeopleData/:projectId', (req, res) => {
  const { projectId } = req.params;
  const query = 'SELECT * FROM ProjectsPeopleData WHERE projectId = ?';

  db.query(query, [projectId], (err, rows) => {
    if (err) {
      console.error('Error al realizar la consulta:', err.message);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No se encontraron datos para este proyecto.' });
    }
  
    res.status(200).json(rows);
  });
});

//Traemos el valor de total_questions por id
app.get('/api/projects/totalQuestions/:projectId', (req, res) => {
  const { projectId } = req.params;
  const query = 'SELECT total_questions FROM projects WHERE id = ?';

  db.query(query, [projectId], (err, rows) => {
    if (err) {
      console.error('Error al realizar la consulta:', err.message);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No se encontraron datos para este proyecto.' });
    }
  
    // Responder solo con el valor de total_questions
    res.status(200).json({ totalQuestions: rows[0].total_questions });
  });
});



app.get('/api/countPeople/:projectId', (req, res) => {
  const { projectId } = req.params;
  const query = 'Select count(rut) from ProjectsPeopleData where projectId = ?';

  db.query(query, [projectId], (err, rows) => {
    if (err) {
      console.error('Error al realizar la consulta:', err.message);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No se encontraron datos para este proyecto.' });
    }
  
    res.status(200).json(rows);
  });
});


//Consulta para ver el estado de los participantes por proyecto
app.get('/api/estado-participantes/:projectId', (req, res) => {
  const projectId = req.params.projectId; // Obtenemos el projectId de los parámetros de la URL

  // Consulta SQL para obtener el conteo de participantes por estado
  const query = `
      SELECT 
          estado,
          COUNT(*) AS cantidad_participantes
      FROM (
          SELECT 
              CASE
                  WHEN pd.respuestas_acertadas = p.total_questions THEN 'Completado'
                  WHEN CURDATE() > p.dateEnd AND pd.respuestas_acertadas < p.total_questions THEN 'Retrasado'
                  ELSE 'En Proceso'
              END AS estado
          FROM 
              projectsPeopleData pd
          INNER JOIN 
              projects p ON pd.projectId = p.id
          WHERE 
              pd.projectId = ?
      ) AS estados
      GROUP BY 
          estado;
  `;

  // Ejecutar la consulta
  db.execute(query, [projectId], (err, results) => {
      if (err) {
          console.error('Error al ejecutar la consulta:', err);
          return res.status(500).json({ error: 'Error al obtener los datos' });
      }

      // Responder con los resultados
      return res.status(200).json(results);
  });
});




// Inyecciones SQL PARA APP UNITY
app.put('/api/update-participants', (req, res) => {
  const participants = req.body; // Esto puede ser un solo objeto o un arreglo

  // Verificar si es un arreglo o un solo objeto
  if (Array.isArray(participants)) {
      // Si es un arreglo de participantes, actualizamos cada uno
      participants.forEach(participant => {
          const { projectId, participantId, respuestasAcertadas, respuestasErroneas } = participant;

          // Validación de datos
          if (!projectId || !participantId || respuestasAcertadas === undefined || respuestasErroneas === undefined) {
              return res.status(400).json({ error: 'Faltan datos requeridos en uno de los participantes' });
          }

          // Consulta SQL para actualizar los datos de cada participante
          const query = `
              UPDATE projectsPeopleData pd
              INNER JOIN projects p ON pd.projectId = p.id
              SET 
                  pd.respuestas_acertadas = ?, 
                  pd.respuestas_erroneas = ?, 
                  pd.en_proceso = p.total_questions - (? + ?)
              WHERE 
                  pd.projectId = ? AND 
                  pd.id = ?;
          `;

          // Ejecutar la consulta
          db.query(query, 
              [respuestasAcertadas, respuestasErroneas, respuestasAcertadas, respuestasErroneas, projectId, participantId],
              (err, result) => {
                  if (err) {
                      console.error('Error al actualizar los datos:', err);
                      return res.status(500).json({ error: 'Error al actualizar los datos' });
                  }
              }
          );
      });

      // Después de actualizar todos los participantes, actualizamos el estado de todos
      const updateStatusQuery = `
          UPDATE projectsPeopleData pd
          INNER JOIN projects p ON pd.projectId = p.id
          SET pd.estado = CASE
              WHEN pd.respuestas_acertadas = p.total_questions THEN 'Completado'
              WHEN CURDATE() > p.dateEnd AND pd.respuestas_acertadas < p.total_questions THEN 'Retrasado'
              ELSE 'En Proceso'
          END
          WHERE pd.projectId = ?;
      `;

      // Ejecutar la consulta para actualizar el estado de todos los participantes del proyecto
      db.query(updateStatusQuery, [participants[0].projectId], (err, result) => {
          if (err) {
              console.error('Error al actualizar el estado de los participantes:', err);
              return res.status(500).json({ error: 'Error al actualizar el estado de los participantes' });
          }

          // Responder con éxito
          res.status(200).json({ message: 'Datos y estados actualizados con éxito' });
      });
  } else if (typeof participants === 'object') {
      // Si es un solo objeto, lo actualizamos directamente
      const { projectId, participantId, respuestasAcertadas, respuestasErroneas } = participants;

      // Validación de datos
      if (!projectId || !participantId || respuestasAcertadas === undefined || respuestasErroneas === undefined) {
          return res.status(400).json({ error: 'Faltan datos requeridos' });
      }

      // Consulta SQL para actualizar los datos del participante
      const query = `
          UPDATE projectsPeopleData pd
          INNER JOIN projects p ON pd.projectId = p.id
          SET 
              pd.respuestas_acertadas = ?, 
              pd.respuestas_erroneas = ?, 
              pd.en_proceso = p.total_questions - (? + ?)
          WHERE 
              pd.projectId = ? AND 
              pd.id = ?;
      `;

      // Ejecutar la consulta
      db.query(query, 
          [respuestasAcertadas, respuestasErroneas, respuestasAcertadas, respuestasErroneas, projectId, participantId],
          (err, result) => {
              if (err) {
                  console.error('Error al actualizar los datos:', err);
                  return res.status(500).json({ error: 'Error al actualizar los datos' });
              }
          }
      );

      // Después de actualizar los datos del participante, actualizamos el estado de todos
      const updateStatusQuery = `
          UPDATE projectsPeopleData pd
          INNER JOIN projects p ON pd.projectId = p.id
          SET pd.estado = CASE
              WHEN pd.respuestas_acertadas = p.total_questions THEN 'Completado'
              WHEN CURDATE() > p.dateEnd AND pd.respuestas_acertadas < p.total_questions THEN 'Retrasado'
              ELSE 'En Proceso'
          END
          WHERE pd.projectId = ?;
      `;

      // Ejecutar la consulta para actualizar el estado de todos los participantes del proyecto
      db.query(updateStatusQuery, [projectId], (err, result) => {
          if (err) {
              console.error('Error al actualizar el estado de los participantes:', err);
              return res.status(500).json({ error: 'Error al actualizar el estado de los participantes' });
          }

          // Responder con éxito
          res.status(200).json({ message: 'Datos y estados actualizados con éxito' });
      });
  } else {
      // Si los datos no son válidos
      return res.status(400).json({ error: 'Datos inválidos' });
  }
});



















// Manejo de solicitudes OPTIONS (preflight)
app.options('*', cors());  // Permite solicitudes preflight (OPTIONS)


// Iniciar el servidor
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
