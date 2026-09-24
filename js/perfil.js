// Si no hay sesión, redirigir al login
const token = localStorage.getItem("token");
const nombre = localStorage.getItem("nombreUsuario");

if (!token || !nombre) {
    window.location.href = "/auth.html";
}

// Cargar datos del perfil
async function cargarPerfil() {
    try {
        const res = await fetch("/api/auth/perfil", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) {
            window.location.href = "/auth.html";
            return;
        }

        const data = await res.json();

        document.getElementById("perfilNombre").textContent = data.nombre;
        document.getElementById("perfilCorreo").textContent = data.correo;
        document.getElementById("perfilTelefono").textContent = data.telefono || "No registrado";
        document.getElementById("perfilDireccion").textContent = data.direccion || "No registrada";

        const fecha = new Date(data.creado_en);
        document.getElementById("perfilFecha").textContent = fecha.toLocaleDateString("es-PE", {
            year: "numeric", month: "long", day: "numeric"
        });

    } catch (err) {
        console.error("Error al cargar perfil:", err);
    }
}

cargarPerfil();

// Header
function actualizarHeaderUsuario(nombre) {
    const btn = document.getElementById("btnAuth");
    btn.textContent = `👤 ${nombre} ▾`;
    btn.onclick = toggleMenu;
}

function toggleMenu() {
    const menu = document.getElementById("userMenu");
    menu.classList.toggle("visible");
}

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
    actualizarHeaderUsuario(nombre);

    document.getElementById("btnCerrarSesion").addEventListener("click", cerrarSesion);
    document.getElementById("btnCerrarSesionPerfil").addEventListener("click", cerrarSesion);
});