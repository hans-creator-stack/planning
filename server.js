require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const path = require('path');
const { pool, query } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

/* ---------- Funciones Utilitarias de Hash Seguro ---------- */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

function verifyPassword(password, storedHash) {
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

/* ---------- Rutas de Autenticación (RF01, RF02) ---------- */

// RF01: Registro de nuevo usuario
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    // Validaciones de formato
    if (!cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      return res.status(400).json({ error: 'Por favor, ingresa un correo electrónico válido.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    // Verificar si el correo ya existe
    const existing = await query('SELECT id FROM usuarios WHERE email = $1', [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Ese correo ya está registrado. Inicia sesión.' });
    }

    // Crear usuario con hash seguro
    const passwordHash = hashPassword(password);
    const result = await query(
      'INSERT INTO usuarios (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
      [cleanEmail, passwordHash]
    );

    const user = result.rows[0];
    return res.status(201).json({
      success: true,
      user: { id: user.id, email: user.email },
      message: 'Usuario registrado exitosamente.'
    });
  } catch (error) {
    console.error('Error en /api/auth/register:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ese correo ya está registrado.' });
    }
    return res.status(500).json({ error: 'Error del servidor al registrar el usuario.' });
  }
});

// RF02: Inicio de sesión
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail || !password) {
      return res.status(400).json({ error: 'Debes ingresar correo y contraseña.' });
    }

    const result = await query(
      'SELECT id, email, password_hash FROM usuarios WHERE email = $1',
      [cleanEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }

    const user = result.rows[0];
    const passwordMatch = verifyPassword(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }

    return res.json({
      success: true,
      user: { id: user.id, email: user.email },
      message: 'Inicio de sesión exitoso.'
    });
  } catch (error) {
    console.error('Error en /api/auth/login:', error);
    return res.status(500).json({ error: 'Error del servidor al autenticar.' });
  }
});

/* ---------- Rutas de Gestión de Pendientes (RF03, RF05, RF08) ---------- */

// Listar pendientes del usuario
app.get('/api/pendientes', async (req, res) => {
  try {
    const { usuario_id } = req.query;
    if (!usuario_id) {
      return res.status(400).json({ error: 'usuario_id es requerido.' });
    }
    const result = await query(
      'SELECT * FROM pendientes WHERE usuario_id = $1 ORDER BY fecha_limite ASC',
      [usuario_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error en GET /api/pendientes:', error);
    res.status(500).json({ error: 'Error al consultar pendientes.' });
  }
});

// RF03: Registrar nuevo pendiente
app.post('/api/pendientes', async (req, res) => {
  try {
    const { usuario_id, tipo, titulo, materia, fecha_limite, recordatorio_horas } = req.body;
    
    if (!usuario_id) return res.status(400).json({ error: 'usuario_id es requerido.' });
    if (!titulo || titulo.trim().length === 0) {
      return res.status(400).json({ error: 'El título es obligatorio.' });
    }
    if (titulo.trim().length > 80) {
      return res.status(400).json({ error: 'El título no puede exceder 80 caracteres.' });
    }
    if (!fecha_limite) {
      return res.status(400).json({ error: 'La fecha y hora límite son obligatorias.' });
    }
    const cleanTipo = tipo === 'examen' ? 'examen' : 'tarea';
    const cleanSubject = (materia || '').trim().slice(0, 40);
    const cleanRemind = [1, 3, 24, 48].includes(Number(recordatorio_horas)) ? Number(recordatorio_horas) : 24;

    const result = await query(
      `INSERT INTO pendientes 
       (usuario_id, tipo, titulo, materia, fecha_limite, recordatorio_horas, estado, notificado) 
       VALUES ($1, $2, $3, $4, $5, $6, 'pendiente', false) 
       RETURNING *`,
      [usuario_id, cleanTipo, titulo.trim(), cleanSubject, fecha_limite, cleanRemind]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error en POST /api/pendientes:', error);
    res.status(500).json({ error: 'Error al crear el pendiente.' });
  }
});

// RF05: Actualizar estado de avance
app.patch('/api/pendientes/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario_id, estado } = req.body;

    if (!usuario_id) return res.status(400).json({ error: 'usuario_id es requerido.' });
    
    // Obtener estado actual si no se proporciona uno explícito
    let nuevoEstado = estado;
    if (!nuevoEstado) {
      const actual = await query('SELECT estado FROM pendientes WHERE id = $1 AND usuario_id = $2', [id, usuario_id]);
      if (actual.rows.length === 0) return res.status(404).json({ error: 'Pendiente no encontrado.' });
      const seq = { 'pendiente': 'en progreso', 'en progreso': 'hecho', 'hecho': 'pendiente' };
      nuevoEstado = seq[actual.rows[0].estado] || 'pendiente';
    }

    const validos = ['pendiente', 'en progreso', 'hecho'];
    if (!validos.includes(nuevoEstado)) {
      return res.status(400).json({ error: 'Estado inválido. Debe ser pendiente, en progreso o hecho.' });
    }

    const result = await query(
      `UPDATE pendientes 
       SET estado = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 AND usuario_id = $3 
       RETURNING *`,
      [nuevoEstado, id, usuario_id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Pendiente no encontrado.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error en PATCH /api/pendientes/:id/estado:', error);
    res.status(500).json({ error: 'Error al actualizar el estado.' });
  }
});

// RF08: Editar pendiente existente con reprogramación de aviso
app.put('/api/pendientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario_id, tipo, titulo, materia, fecha_limite, recordatorio_horas } = req.body;

    if (!usuario_id) return res.status(400).json({ error: 'usuario_id es requerido.' });
    if (!titulo || titulo.trim().length === 0) {
      return res.status(400).json({ error: 'El título es obligatorio.' });
    }
    if (titulo.trim().length > 80) {
      return res.status(400).json({ error: 'El título no puede exceder 80 caracteres.' });
    }
    if (!fecha_limite) {
      return res.status(400).json({ error: 'La fecha y hora límite son obligatorias.' });
    }

    const cleanTipo = tipo === 'examen' ? 'examen' : 'tarea';
    const cleanSubject = (materia || '').trim().slice(0, 40);
    const cleanRemind = [1, 3, 24, 48].includes(Number(recordatorio_horas)) ? Number(recordatorio_horas) : 24;

    const result = await query(
      `UPDATE pendientes 
       SET tipo = $1, titulo = $2, materia = $3, fecha_limite = $4, recordatorio_horas = $5, notificado = false, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $6 AND usuario_id = $7 
       RETURNING *`,
      [cleanTipo, titulo.trim(), cleanSubject, fecha_limite, cleanRemind, id, usuario_id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Pendiente no encontrado.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error en PUT /api/pendientes/:id:', error);
    res.status(500).json({ error: 'Error al actualizar el pendiente.' });
  }
});

// RF08: Eliminar pendiente con confirmación
app.delete('/api/pendientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario_id } = req.query;

    if (!usuario_id) return res.status(400).json({ error: 'usuario_id es requerido.' });

    const result = await query(
      'DELETE FROM pendientes WHERE id = $1 AND usuario_id = $2 RETURNING id',
      [id, usuario_id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Pendiente no encontrado.' });
    res.json({ success: true, id: result.rows[0].id });
  } catch (error) {
    console.error('Error en DELETE /api/pendientes/:id:', error);
    res.status(500).json({ error: 'Error al eliminar el pendiente.' });
  }
});

// RF06: Marcar recordatorio como notificado
app.patch('/api/pendientes/:id/notificado', async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario_id } = req.body;
    if (!usuario_id) return res.status(400).json({ error: 'usuario_id es requerido.' });

    const result = await query(
      `UPDATE pendientes 
       SET notificado = true, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND usuario_id = $2 
       RETURNING id, notificado`,
      [id, usuario_id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Pendiente no encontrado.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error en PATCH /api/pendientes/:id/notificado:', error);
    res.status(500).json({ error: 'Error al actualizar bandera notificado.' });
  }
});

/* ---------- Rutas de Reporte de Fallos y Sugerencias (RF12) ---------- */

// Listar sugerencias del usuario
app.get('/api/sugerencias', async (req, res) => {
  try {
    const { usuario_id } = req.query;
    if (!usuario_id) return res.status(400).json({ error: 'usuario_id es requerido.' });

    const result = await query(
      'SELECT * FROM sugerencias WHERE usuario_id = $1 ORDER BY created_at DESC',
      [usuario_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error en GET /api/sugerencias:', error);
    res.status(500).json({ error: 'Error al consultar sugerencias.' });
  }
});

// Registrar sugerencia o reporte de error
app.post('/api/sugerencias', async (req, res) => {
  try {
    const { usuario_id, tipo, mensaje } = req.body;
    if (!usuario_id) return res.status(400).json({ error: 'usuario_id es requerido.' });

    const cleanMensaje = (mensaje || '').trim();
    if (cleanMensaje.length < 5) {
      return res.status(400).json({ error: 'Escribe al menos 5 caracteres.' });
    }
    if (cleanMensaje.length > 500) {
      return res.status(400).json({ error: 'El mensaje no puede exceder los 500 caracteres.' });
    }

    const cleanTipo = (tipo === 'error' || tipo === 'fallo') ? 'error' : 'mejora';

    const result = await query(
      'INSERT INTO sugerencias (usuario_id, tipo, mensaje) VALUES ($1, $2, $3) RETURNING *',
      [usuario_id, cleanTipo, cleanMensaje]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: '¡Gracias! Recibimos tu mensaje.'
    });
  } catch (error) {
    console.error('Error en POST /api/sugerencias:', error);
    res.status(500).json({ error: 'Error al registrar sugerencia.' });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const check = await query('SELECT NOW() as now');
    res.json({ status: 'ok', time: check.rows[0].now });
  } catch (err) {
    res.status(503).json({ status: 'error', error: err.message });
  }
});

/* ---------- Iniciar Servidor si se ejecuta directamente ---------- */
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor Recuerda+ escuchando en http://localhost:${PORT}`);
  });
}

module.exports = { app, hashPassword, verifyPassword };

