// Si ya tiene sesión, redirigir al inicio
const nombreGuardado = localStorage.getItem("nombreUsuario");
if (nombreGuardado) {
    window.location.href = "/index.html";
}

// ─── TABS ─────────────────────────────────────────────────
document.getElementById("tabLogin").addEventListener("click", () => switchTab("login"));
document.getElementById("tabRegister").addEventListener("click", () => switchTab("register"));

function switchTab(tab) {
    document.getElementById("formLogin").style.display = tab === "login" ? "block" : "none";
    document.getElementById("formRegister").style.display = tab === "register" ? "block" : "none";
    document.getElementById("tabLogin").classList.toggle("activo", tab === "login");
    document.getElementById("tabRegister").classList.toggle("activo", tab === "register");
}

// ─── LOGIN ────────────────────────────────────────────────
document.getElementById("btnLogin").addEventListener("click", login);

async function login() {
    const correo = document.getElementById("loginCorreo").value;
    const contrasena = document.getElementById("loginPassword").value;
    const errorEl = document.getElementById("loginError");
    errorEl.textContent = "";

    try {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ correo, contrasena })
        });

        const data = await res.json();

        if (!res.ok) {
            errorEl.textContent = data.error;
            return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("nombreUsuario", data.nombre);
        window.location.href = "/index.html";

    } catch (err) {
        errorEl.textContent = "Error al conectar con el servidor.";
    }
}

// ─── REGISTRO ─────────────────────────────────────────────
document.getElementById("btnRegister").addEventListener("click", register);

async function register() {
    const nombre = document.getElementById("regNombre").value;
    const correo = document.getElementById("regCorreo").value;
    const contrasena = document.getElementById("regPassword").value;
    const telefono = document.getElementById("regTelefono").value;
    const direccion = document.getElementById("regDireccion").value;
    const errorEl = document.getElementById("registerError");
    errorEl.textContent = "";

    try {
        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, correo, contrasena, telefono, direccion })
        });

        const data = await res.json();

        if (!res.ok) {
            errorEl.textContent = data.error;
            return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("nombreUsuario", data.nombre);
        window.location.href = "/index.html";

    } catch (err) {
        errorEl.textContent = "Error al conectar con el servidor.";
    }
}