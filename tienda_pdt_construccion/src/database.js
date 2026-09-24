const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Ruta de la base de datos
const dbPath = path.resolve(__dirname, "construccion.db");

// Conexión a SQLite
const db = new sqlite3.Database(dbPath);

// Inicialización
db.serialize(() => {
  // Crear tabla productos
  db.run(`
    CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      especificaciones TEXT,
      precio REAL,
      categoria TEXT,
      imagen_url TEXT
    )
  `);
  // Tabla usuarios
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      correo TEXT NOT NULL UNIQUE,
      contrasena TEXT NOT NULL,
      telefono TEXT,
      direccion TEXT,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Agregar columna stock si no existe
db.run(`ALTER TABLE productos ADD COLUMN stock INTEGER DEFAULT 10`, () => {});

// Tabla pedidos
db.run(`
    CREATE TABLE IF NOT EXISTS pedidos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        producto_id INTEGER NOT NULL,
        cantidad INTEGER NOT NULL,
        total REAL NOT NULL,
        nombre_cliente TEXT,
        telefono TEXT,
        direccion TEXT,
        estado TEXT DEFAULT 'pendiente',
        creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
        FOREIGN KEY (producto_id) REFERENCES productos(id)
    )
`);

  // Insertar datos solo si la tabla está vacía
  db.get("SELECT COUNT(*) as count FROM productos", (err, row) => {
    if (err) {
      console.error(err);
      return;
    }

    if (row.count === 0) {
      const stmt = db.prepare(`
        INSERT INTO productos
        (nombre, descripcion, especificaciones, precio, categoria, imagen_url)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        "Ladrillo King Kong",
        "Ladrillo de arcilla cocida de alta resistencia, ideal para muros portantes y estructuras antisísmicas.",
        "Dimensiones: 9x13x24 cm | Peso: 2.8 kg | Resistencia: 130 kg/cm2",
        1.5,
        "Estructuras",
        "img/ladrillo-kingkong.jpg",
      );

      stmt.run(
        "Bolsa de Cemento",
        "Cemento Portland Tipo I - 42.5kg",
        "Peso: 42.5kg | Uso: concreto estructural",
        28.0,
        "Mezclas",
        "img/cemento.jpg",
      );

      stmt.run(
        "Martillo de Acero",
        "Martillo con mango de fibra de vidrio",
        "Peso: 16oz | Material: acero templado",
        45.0,
        "Herramientas",
        "img/martillo.jpg",
      );

      stmt.run(
        "Tubo PVC 1/2",
        "Tubo para agua fría",
        "Longitud: 5 metros | Diámetro: 1/2 pulgada",
        12.0,
        "Gasfitería",
        "img/tubo-pvc.jpg",
      );

      // ─── ESTRUCTURAS ───────────────────────────────────────────
      stmt.run(
        "Bloque de Concreto",
        "Bloque hueco de concreto para muros de cerco y tabiquería.",
        "Dimensiones: 9x19x39 cm | Peso: 7 kg | Resistencia: 50 kg/cm2",
        2.8,
        "Estructuras",
        "img/bloque-concreto.jpg",
      );

      stmt.run(
        "Ladrillo Pandereta",
        "Ladrillo hueco ideal para tabiques interiores y divisiones.",
        "Dimensiones: 9x9x24 cm | Peso: 1.8 kg",
        0.9,
        "Estructuras",
        "img/ladrillo-pandereta.jpg",
      );

      stmt.run(
        "Fierro Corrugado 1/2",
        "Varilla de acero corrugado para refuerzo de estructuras de concreto.",
        "Diámetro: 1/2 pulgada | Longitud: 9 metros | Norma: ASTM A615",
        38.0,
        "Estructuras",
        "img/fierro.jpg",
      );

      stmt.run(
        "Fierro Corrugado 3/8",
        "Varilla de acero corrugado para losas y columnas.",
        "Diámetro: 3/8 pulgada | Longitud: 9 metros | Norma: ASTM A615",
        22.0,
        "Estructuras",
        "img/fierro-3-8.jpg",
      );

      stmt.run(
        "Malla Electrosoldada",
        "Malla de acero soldada para losas aligeradas y pisos industriales.",
        "Medidas: 2.4x6 m | Abertura: 15x15 cm | Diámetro: 4.5 mm",
        85.0,
        "Estructuras",
        "img/malla-electrosoldada.jpg",
      );

      // ─── MEZCLAS ───────────────────────────────────────────────
      stmt.run(
        "Cemento Tipo V",
        "Cemento de alta resistencia a sulfatos, ideal para obras en contacto con suelos agresivos.",
        "Peso: 42.5 kg | Uso: cimientos en suelos con sulfatos",
        35.0,
        "Mezclas",
        "img/cemento-tipo-v.jpg",
      );

      stmt.run(
        "Yeso en Bolsa",
        "Yeso para tarrajeo y acabados interiores de paredes y techos.",
        "Peso: 20 kg | Fraguado: 20 minutos",
        15.0,
        "Mezclas",
        "img/yeso.jpg",
      );

      stmt.run(
        "Arena Gruesa (saco)",
        "Arena gruesa lavada para preparación de mezclas de concreto.",
        "Peso: 50 kg | Granulometría: 2-5 mm",
        9.0,
        "Mezclas",
        "img/arena-gruesa.jpg",
      );

      stmt.run(
        "Pegamento para Cerámico",
        "Adhesivo cementoso para instalación de cerámicos y porcelanatos.",
        "Peso: 25 kg | Rendimiento: 4-6 m2 por bolsa",
        22.0,
        "Mezclas",
        "img/pegamento-ceramico.jpg",
      );

      stmt.run(
        "Aditivo Impermeabilizante",
        "Aditivo líquido para mezclas de concreto en obras expuestas al agua.",
        "Volumen: 1 litro | Rendimiento: 50 kg de cemento por litro",
        18.0,
        "Mezclas",
        "img/impermeabilizante.jpg",
      );

      // ─── HERRAMIENTAS ──────────────────────────────────────────
      stmt.run(
        "Palana Cuchara",
        "Palana tipo cuchara para excavación y movimiento de tierra.",
        "Material: acero al carbono | Mango: madera tornillo | Largo: 1.5 m",
        35.0,
        "Herramientas",
        "img/palana.jpg",
      );

      stmt.run(
        "Nivel de Aluminio",
        "Nivel de burbuja para verificar superficies horizontales y verticales.",
        "Longitud: 60 cm | Material: aluminio | Burbujas: 3",
        28.0,
        "Herramientas",
        "img/nivel.jpg",
      );

      stmt.run(
        "Cinta Métrica 5m",
        "Cinta métrica de acero para mediciones en obra.",
        "Longitud: 5 metros | Ancho: 19 mm | Material: acero inoxidable",
        12.0,
        "Herramientas",
        "img/cinta-metrica.jpg",
      );

      stmt.run(
        "Plomada de Centro",
        "Plomada de bronce para verificar la verticalidad de muros y columnas.",
        "Peso: 300 g | Material: bronce | Cordel: 5 metros",
        14.0,
        "Herramientas",
        "img/plomada.jpg",
      );

      stmt.run(
        "Brocha 4 pulgadas",
        "Brocha para aplicación de pintura, selladores e impermeabilizantes.",
        "Ancho: 4 pulgadas | Cerda: nylon | Mango: madera",
        8.5,
        "Herramientas",
        "img/brocha.jpg",
      );

      stmt.run(
        "Wincha de Albañil",
        "Hilo de nylon para trazar líneas rectas en muros y pisos.",
        "Longitud: 100 metros | Color: rojo | Material: nylon",
        6.0,
        "Herramientas",
        "img/wincha-albanil.jpg",
      );

      // ─── GASFITERÍA ────────────────────────────────────────────
      stmt.run(
        "Tubo PVC 3/4",
        "Tubo PVC para instalaciones de agua fría.",
        "Longitud: 5 metros | Diámetro: 3/4 pulgada | Presión: 10 bar",
        16.0,
        "Gasfitería",
        "img/tubo-pvc-3-4.jpg",
      );

      stmt.run(
        "Tubo PVC Desagüe 4 pulgadas",
        "Tubo PVC para instalaciones de desagüe y alcantarillado.",
        "Longitud: 3 metros | Diámetro: 4 pulgadas | Norma: NTP",
        24.0,
        "Gasfitería",
        "img/tubo-desague.jpg",
      );

      stmt.run(
        "Codo PVC 90° 1/2",
        "Codo de 90 grados para cambios de dirección en tuberías de agua.",
        "Diámetro: 1/2 pulgada | Material: PVC | Presión: 10 bar",
        1.2,
        "Gasfitería",
        "img/codo-pvc.jpg",
      );

      stmt.run(
        "Llave de Paso 1/2",
        "Válvula de compuerta para control del flujo de agua.",
        "Diámetro: 1/2 pulgada | Material: bronce | Presión máx: 10 bar",
        18.0,
        "Gasfitería",
        "img/llave-paso.jpg",
      );

      stmt.run(
        "Cinta Teflón",
        "Cinta selladora para uniones roscadas en tuberías.",
        "Ancho: 12 mm | Longitud: 10 metros | Espesor: 0.1 mm",
        1.5,
        "Gasfitería",
        "img/teflon.jpg",
      );

      stmt.finalize();

      console.log("Base de datos inicializada con productos.");
    }
  });
});

// Buscar productos con filtros
function buscarProductos(nombre, categoria, precioMin, precioMax, callback) {
  let sql =
    "SELECT * FROM productos WHERE nombre LIKE ? AND precio >= ? AND precio <= ?";
  let params = [`%${nombre}%`, precioMin, precioMax];

  if (categoria) {
    sql += " AND categoria = ?";
    params.push(categoria);
  }

  db.all(sql, params, (err, rows) => {
    if (err) callback(err, null);
    else callback(null, rows);
  });
}

// Crear usuario
function crearUsuario(
  nombre,
  correo,
  contrasena,
  telefono,
  direccion,
  callback,
) {
  const sql = `
    INSERT INTO usuarios (nombre, correo, contrasena, telefono, direccion)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.run(
    sql,
    [nombre, correo, contrasena, telefono, direccion],
    function (err) {
      if (err) callback(err, null);
      else callback(null, { id: this.lastID });
    },
  );
}

// Buscar usuario por correo
function buscarUsuarioPorCorreo(correo, callback) {
  const sql = "SELECT * FROM usuarios WHERE correo = ?";
  db.get(sql, [correo], (err, row) => {
    if (err) callback(err, null);
    else callback(null, row);
  });
}

// Crear pedido
function crearPedido(usuario_id, producto_id, cantidad, total, nombre, telefono, direccion, callback) {
    const sql = `
        INSERT INTO pedidos (usuario_id, producto_id, cantidad, total, nombre_cliente, telefono, direccion)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(sql, [usuario_id, producto_id, cantidad, total, nombre, telefono, direccion], function(err) {
        if (err) callback(err, null);
        else callback(null, { id: this.lastID });
    });
}

// Obtener pedidos de un usuario
function obtenerPedidosUsuario(usuario_id, callback) {
    const sql = `
        SELECT p.*, pr.nombre as producto_nombre, pr.imagen_url
        FROM pedidos p
        JOIN productos pr ON p.producto_id = pr.id
        WHERE p.usuario_id = ?
        ORDER BY p.creado_en DESC
    `;
    db.all(sql, [usuario_id], (err, rows) => {
        if (err) callback(err, null);
        else callback(null, rows);
    });
}

module.exports = { buscarProductos, crearUsuario, buscarUsuarioPorCorreo, crearPedido, obtenerPedidosUsuario, db };
