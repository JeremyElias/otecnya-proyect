const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const db = await mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mi_base_de_datos',
  });

  const username = 'jeremy';
  const plainPassword = '123456';
  const roles = JSON.stringify(['user']); // Roles en formato JSON

  try {
    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Insertar en la base de datos
    const [result] = await db.query(
      'INSERT INTO usuarios (username, password, roles) VALUES (?, ?, ?)',
      [username, hashedPassword, roles]
    );

    console.log(`Usuario insertado con ID: ${result.insertId}`);
  } catch (err) {
    console.error('Error al insertar el usuario:', err.message);
  } finally {
    db.end();
  }
})();
