const express = require('express');
const helmet = require('helmet');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const { buscarProductos, crearUsuario, buscarUsuarioPorCorreo, crearPedido, obtenerPedidosUsuario, db } = require('./src/database');

const app = express();
const JWT_SECRET = "libras_construccion_secret_2026"; // En producción usar variable de entorno

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "images.unsplash.com"],
    },
  },
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── PRODUCTOS ───────────────────────────────────────────
app.get('/api/productos', (req, res) => {
  const query = req.query.q || "";
  const categoria = req.query.categoria || "";
  const precioMin = parseFloat(req.query.precioMin) || 0;
  const precioMax = parseFloat(req.query.precioMax) || 999999;

  buscarProductos(query, categoria, precioMin, precioMax, (err, rows) => {
    if (err) {
      console.error("Error en DB:", err);
      res.status(500).json({ error: "Error en el servidor" });
    } else {
      res.json(rows);
    }
  });
});

app.get('/api/productos/:id', (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM productos WHERE id = ?";
  db.get(sql, [id], (err, row) => {
    if (err) res.status(500).json({ error: "Error en base de datos" });
    else if (!row) res.status(404).json({ error: "Producto no encontrado" });
    else res.json(row);
  });
});

// ─── AUTH ─────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  const { nombre, correo, contrasena, telefono, direccion } = req.body;

  if (!nombre || !correo || !contrasena) {
    return res.status(400).json({ error: "Nombre, correo y contraseña son obligatorios" });
  }

  try {
    const hash = await bcrypt.hash(contrasena, 10);

    crearUsuario(nombre, correo, hash, telefono, direccion, (err, result) => {
      if (err) {
        if (err.message.includes("UNIQUE")) {
          return res.status(409).json({ error: "El correo ya está registrado" });
        }
        return res.status(500).json({ error: "Error al registrar usuario" });
      }

      const token = jwt.sign(
        { id: result.id, nombre, correo },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.status(201).json({ token, nombre });
    });

  } catch (err) {
    res.status(500).json({ error: "Error interno" });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({ error: "Correo y contraseña son obligatorios" });
  }

  buscarUsuarioPorCorreo(correo, async (err, usuario) => {
    if (err) return res.status(500).json({ error: "Error en el servidor" });
    if (!usuario) return res.status(401).json({ error: "Correo o contraseña incorrectos" });

    const coincide = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!coincide) return res.status(401).json({ error: "Correo o contraseña incorrectos" });

    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, nombre: usuario.nombre });
  });
});

// ─── PEDIDOS ─────────────────────────────────────────────
app.post('/api/pedidos', verificarToken, (req, res) => {
    const { producto_id, cantidad, nombre, telefono, direccion } = req.body;

    if (!producto_id || !cantidad) {
        return res.status(400).json({ error: "Datos incompletos" });
    }

    // Obtener precio del producto
    db.get("SELECT precio, stock FROM productos WHERE id = ?", [producto_id], (err, prod) => {
        if (err || !prod) return res.status(404).json({ error: "Producto no encontrado" });
        if (prod.stock < cantidad) return res.status(400).json({ error: "Stock insuficiente" });

        const total = prod.precio * cantidad;

        crearPedido(req.usuario.id, producto_id, cantidad, total, nombre, telefono, direccion, (err, result) => {
            if (err) return res.status(500).json({ error: "Error al crear pedido" });

            // Descontar stock
            db.run("UPDATE productos SET stock = stock - ? WHERE id = ?", [cantidad, producto_id]);

            res.status(201).json({ id: result.id, total });
        });
    });
});

app.get('/api/pedidos', verificarToken, (req, res) => {
    obtenerPedidosUsuario(req.usuario.id, (err, rows) => {
        if (err) return res.status(500).json({ error: "Error en servidor" });
        res.json(rows);
    });
});


app.listen(3000, () => {
  console.log("Servidor listo en http://localhost:3000");
});

// Middleware para verificar JWT
function verificarToken(req, res, next) {
    const auth = req.headers["authorization"];
    if (!auth) return res.status(401).json({ error: "No autorizado" });

    const token = auth.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.usuario = decoded;
        next();
    } catch {
        res.status(401).json({ error: "Token inválido" });
    }
}

// Perfil del usuario
app.get("/api/auth/perfil", verificarToken, (req, res) => {
    const sql = "SELECT id, nombre, correo, telefono, direccion, creado_en FROM usuarios WHERE id = ?";
    db.get(sql, [req.usuario.id], (err, row) => {
        if (err) return res.status(500).json({ error: "Error en servidor" });
        if (!row) return res.status(404).json({ error: "Usuario no encontrado" });
        res.json(row);
    });
});