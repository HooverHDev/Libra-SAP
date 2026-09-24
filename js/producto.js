document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    window.location.href = "index.html";
    return;
  }

  try {
    const response = await fetch(`/api/productos/${id}`);
    if (!response.ok) throw new Error("No encontrado");

    const prod = await response.json();
    const container = document.getElementById("detalleContainer");

    const specs = prod.especificaciones
      ? prod.especificaciones
          .split("|")
          .map((s) => `<li>${s.trim()}</li>`)
          .join("")
      : "<li>Consulte especificaciones con un asesor.</li>";

    const stock = prod.stock ?? 10;
    const stockClass =
      stock > 5 ? "stock-ok" : stock > 0 ? "stock-poco" : "stock-agotado";
    const stockTexto =
      stock > 5
        ? `✅ En stock (${stock} disponibles)`
        : stock > 0
          ? `⚠️ Pocas unidades (${stock} disponibles)`
          : "❌ Agotado";

    // Actualizar breadcrumb
    document.getElementById("breadcrumbCategoria").textContent = prod.categoria;
    document.getElementById("breadcrumbNombre").textContent = prod.nombre;

    container.innerHTML = `
            <div class="detalle-grid">
                <div class="detalle-imagen">
                    <img src="/${prod.imagen_url || ""}" alt="${prod.nombre}">
                </div>
                <div class="info-principal">
                    <span class="categoria-tag">${prod.categoria}</span>
                    <h2>${prod.nombre}</h2>
                    <p class="descripcion-larga">${prod.descripcion}</p>

                    <div class="ficha-tecnica">
                        <h3>Ficha Técnica</h3>
                        <ul>${specs}</ul>
                    </div>

                    <div class="stock-badge ${stockClass}">${stockTexto}</div>

                    <div class="precio-seccion">
                        <span class="label">Precio por unidad:</span>
                        <div class="precio-valor">S/ ${prod.precio.toFixed(2)}</div>
                    </div>

                    <div class="cantidad-selector">
                        <button id="btnMenos">−</button>
                        <span id="cantidad">1</span>
                        <button id="btnMas">+</button>
                        <span class="cantidad-total">Total: <strong id="totalPrecio">S/ ${prod.precio.toFixed(2)}</strong></span>
                    </div>

                    <button class="cta-button" id="btnComprar" ${stock === 0 ? "disabled" : ""}>
                        ${stock === 0 ? "Sin stock" : "🛒 Comprar ahora"}
                    <button class="cta-button secondary" id="btnImprimir">Imprimir Ficha</button>
                </div>
            </div>
        `;

    // Selector de cantidad
    let cantidad = 1;
    document.getElementById("btnMenos").addEventListener("click", () => {
      if (cantidad > 1) {
        cantidad--;
        document.getElementById("cantidad").textContent = cantidad;
        document.getElementById("totalPrecio").textContent =
          `S/ ${(prod.precio * cantidad).toFixed(2)}`;
      }
    });

    document.getElementById("btnMas").addEventListener("click", () => {
      if (cantidad < stock) {
        cantidad++;
        document.getElementById("cantidad").textContent = cantidad;
        document.getElementById("totalPrecio").textContent =
          `S/ ${(prod.precio * cantidad).toFixed(2)}`;
      }
    });

    document.getElementById("btnImprimir").addEventListener("click", () => {
      window.print();
    });

    // Botón comprar
    document.getElementById("btnComprar").addEventListener("click", () => {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = `/auth.html`;
        return;
      }
      // Pasar datos a la página de pedido
      const datos = {
        producto_id: prod.id,
        nombre: prod.nombre,
        imagen: prod.imagen_url,
        precio: prod.precio,
        cantidad,
      };
      localStorage.setItem("pedidoActual", JSON.stringify(datos));
      window.location.href = "/pedido.html";
    });
  } catch (error) {
    document.getElementById("detalleContainer").innerHTML =
      `<div class="error-msg">Error: No se pudo cargar la información del material.</div>`;
  }
});
