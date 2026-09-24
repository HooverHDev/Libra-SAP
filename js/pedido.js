const token = localStorage.getItem('token');
if (!token) { window.location.href = '/auth.html'; }

const pedido = JSON.parse(localStorage.getItem('pedidoActual'));
if (!pedido) { window.location.href = '/index.html'; }

// Mostrar resumen
document.getElementById('pedidoImg').src = `/${pedido.imagen}`;
document.getElementById('pedidoNombre').textContent = pedido.nombre;
document.getElementById('pedidoCantidad').textContent = `Cantidad: ${pedido.cantidad}`;
document.getElementById('pedidoTotal').textContent = `Total: S/ ${(pedido.precio * pedido.cantidad).toFixed(2)}`;

// Precargar datos del usuario si los tiene
async function cargarDatosUsuario() {
    try {
        const res = await fetch('/api/auth/perfil', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        document.getElementById('pedidoNombreInput').value = data.nombre || '';
        document.getElementById('pedidoTelefono').value = data.telefono || '';
        document.getElementById('pedidoDireccion').value = data.direccion || '';
    } catch (err) {
        console.error(err);
    }
}

cargarDatosUsuario();

// Confirmar pedido
document.getElementById('btnConfirmar').addEventListener('click', async () => {
    const nombre = document.getElementById('pedidoNombreInput').value;
    const telefono = document.getElementById('pedidoTelefono').value;
    const direccion = document.getElementById('pedidoDireccion').value;
    const errorEl = document.getElementById('pedidoError');

    errorEl.textContent = '';

    if (!nombre || !telefono || !direccion) {
        errorEl.textContent = 'Por favor completa todos los datos de entrega.';
        return;
    }

    try {
        const res = await fetch('/api/pedidos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                producto_id: pedido.producto_id,
                cantidad: pedido.cantidad,
                nombre,
                telefono,
                direccion
            })
        });

        const data = await res.json();

        if (!res.ok) {
            errorEl.textContent = data.error;
            return;
        }

        // Mostrar éxito
        localStorage.removeItem('pedidoActual');
        document.getElementById('btnConfirmar').style.display = 'none';
        document.querySelectorAll('.input-group').forEach(el => el.style.display = 'none');
        document.querySelectorAll('h3').forEach(el => el.style.display = 'none');
        document.getElementById('pedidoExito').style.display = 'block';

    } catch (err) {
        errorEl.textContent = 'Error al conectar con el servidor.';
    }
});