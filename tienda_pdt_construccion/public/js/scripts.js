let categoriaActiva = "";

// ─── CARRUSEL HERO ─────────────────────────────────────────
const slides = document.querySelectorAll(".hero-slide");
let slideActual = 0;

setInterval(() => {
    slides[slideActual].classList.remove("activo");
    slideActual = (slideActual + 1) % slides.length;
    slides[slideActual].classList.add("activo");
}, 5000);

// Búsqueda
document.getElementById("searchBtn").addEventListener("click", () => {
    buscarProductos();
});

document.getElementById("searchInput").addEventListener("keyup", (e) => {
    if (e.key === "Enter") buscarProductos();
});

// Slider de precio
const slider = document.getElementById("sliderPrecio");
const valorPrecio = document.getElementById("valorPrecio");

slider.addEventListener("input", () => {
    valorPrecio.textContent = `S/ ${slider.value}`;
    buscarProductos();
});

// Filtros de categoría
document.querySelectorAll(".filtro-cat").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".filtro-cat").forEach(b => b.classList.remove("activo"));
        btn.classList.add("activo");
        categoriaActiva = btn.dataset.cat;
        buscarProductos();
    });
});

async function buscarProductos() {
    const termino = document.getElementById("searchInput").value;
    const precioMax = document.getElementById("sliderPrecio").value;
    const container = document.getElementById("productosContainer");

    container.innerHTML = "Cargando...";

    const params = new URLSearchParams({
        q: termino,
        categoria: categoriaActiva,
        precioMin: 0,
        precioMax: precioMax
    });

    try {
        const response = await fetch(`/api/productos?${params}`);
        const productos = await response.json();

        container.innerHTML = "";

        if (productos.length === 0) {
            container.innerHTML = "<p>No se encontraron materiales.</p>";
            return;
        }

        productos.forEach((prod) => {
            const card = document.createElement("div");
            card.className = "producto-card";
            card.style.cursor = "pointer";
            card.onclick = () => {
                window.location.href = `producto.html?id=${prod.id}`;
            };

            const img = document.createElement("img");
            img.src = prod.imagen_url ? `/${prod.imagen_url}` : "https://via.placeholder.com/300x200?text=Sin+Imagen";
            img.alt = prod.nombre;
            img.className = "producto-img";

            const nombre = document.createElement("h3");
            nombre.textContent = prod.nombre;

            const desc = document.createElement("p");
            desc.textContent = prod.descripcion;

            const precio = document.createElement("span");
            precio.className = "precio";
            precio.textContent = `S/ ${prod.precio.toFixed(2)}`;

            card.appendChild(img);
            card.appendChild(nombre);
            card.appendChild(desc);
            card.appendChild(precio);
            container.appendChild(card);
        });

    } catch (error) {
        console.error("Error:", error);
        container.innerHTML = "Error al conectar con el servidor.";
    }
}

// Carga inicial
buscarProductos();

// ─── AUTH HEADER ───────────────────────────────────────────
function actualizarHeaderUsuario(nombre) {
    const btn = document.getElementById("btnAuth");
    btn.textContent = `👤 ${nombre} ▾`;
    btn.onclick = toggleMenu;
}

function toggleMenu() {
    const menu = document.getElementById("userMenu");
    menu.classList.toggle("visible");
}

// Cerrar menú al hacer clic fuera
document.addEventListener("click", (e) => {
    const menu = document.getElementById("userMenu");
    const btn = document.getElementById("btnAuth");
    if (menu && !menu.contains(e.target) && e.target !== btn) {
        menu.classList.remove("visible");
    }
});

function cerrarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("nombreUsuario");
    window.location.href = "/index.html";
}

window.addEventListener("DOMContentLoaded", () => {
    const nombre = localStorage.getItem("nombreUsuario");
    const btn = document.getElementById("btnAuth");

    if (nombre) {
        actualizarHeaderUsuario(nombre);
    } else {
        btn.addEventListener("click", () => window.location.href = "/auth.html");
    }

    // Cerrar sesión
    const btnCerrar = document.getElementById("btnCerrarSesion");
    if (btnCerrar) btnCerrar.addEventListener("click", cerrarSesion);
});
