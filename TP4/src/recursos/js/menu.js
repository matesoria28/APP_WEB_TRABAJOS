import { productosPuntoCafe } from './productos.js';

// Referencias al DOM
const grillaProductos = document.querySelector('.grilla-productos');
const contenedorFiltros = document.querySelector('.filtros-lista');
const contador = document.querySelector('#contador-carrito');
const aviso = document.querySelector('#aviso');

// funciones de Carrito
const obtenerCarrito = () => {
  const guardado = localStorage.getItem('carrito');
  return guardado ? JSON.parse(guardado) : [];
};

const agregarAlCarrito = (producto) => {
  const carrito = obtenerCarrito();
  const existente = carrito.find((item) => item.id === producto.id);

  if (existente) {
    existente.cantidad++;
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: 1
    });
  }

  localStorage.setItem('carrito', JSON.stringify(carrito));
};

// cartel de aviso "Producto agregado al carrito"
let temporizador;
const mostrarAviso = (texto) => {
  if (!aviso) return;
  aviso.textContent = texto;
  aviso.classList.add('visible');
  clearTimeout(temporizador);
  temporizador = setTimeout(() => aviso.classList.remove('visible'), 2500);
};

const actualizarContador = () => {
  if (!contador) return;
  const total = obtenerCarrito().reduce((suma, item) => suma + item.cantidad, 0);
  contador.textContent = total;
  contador.hidden = total === 0;
};

// Función de Renderizado en la Grilla
function renderizarProductos(contenedor, lista) {
  if (!contenedor) return;

  if (lista.length === 0) {
    contenedor.innerHTML = '<p class="mensaje-vacio">No hay productos disponibles en esta categoría.</p>';
    return;
  }

  let htmlAcumulado = '';

  lista.forEach((producto) => {
    htmlAcumulado += `
      <article id="${producto.categoria}" class="tarjeta-producto">
        <img src="${producto.imagen}" alt="${producto.nombre}" width="300" />
        <div class="info-card">
          <h3>${producto.nombre}</h3>
          <p class="precio">$${producto.precio}</p>
          <p class="descripcion">${producto.descripcion}</p>
          <button type="button" class="btn-agregar" data-id="${producto.id}">Agregar</button>
        </div>
      </article>
    `;
  });

  contenedor.innerHTML = htmlAcumulado;
}

// Evento de Clic en "Agregar"
grillaProductos.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-agregar')) {
    const id = Number(e.target.dataset.id);
    const productoEncontrado = productosPuntoCafe.find((p) => p.id === id);

    if (productoEncontrado) {
      agregarAlCarrito(productoEncontrado);
      actualizarContador();
      // Mostrar aviso flotante
      mostrarAviso(`${productoEncontrado.nombre} se agregó al carrito`);
    }
  }
});

// Inicialización de la Página
document.addEventListener('DOMContentLoaded', () => {
  // A. Mostrar total de ítems en el ícono del carrito al cargar
  actualizarContador();

  // Render inicial con todos los productos de la lista
  renderizarProductos(grillaProductos, productosPuntoCafe);

  // Eventos de Clicks en los Filtros 
  if (contenedorFiltros) {
    contenedorFiltros.addEventListener('click', (e) => {
      const boton = e.target.closest('.filtro-btn');
      if (!boton) return;

      e.preventDefault();

      // Cambiar estado visual del botón activo
      contenedorFiltros.querySelectorAll('.filtro-btn').forEach((b) => b.classList.remove('activo'));
      boton.classList.add('activo');

      // Obtener categoría elegida desde el href del enlace
      const categoriaElegida = boton.getAttribute('href').replace('#', '');

      if (categoriaElegida === 'todos') {
        renderizarProductos(grillaProductos, productosPuntoCafe);
      } else {
        const productosFiltrados = productosPuntoCafe.filter(
          (p) => p.categoria === categoriaElegida
        );
        renderizarProductos(grillaProductos, productosFiltrados);
      }
    });
  }

  // Evento de Click en "Agregar"
  if (grillaProductos) {
    grillaProductos.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-agregar')) {
        const id = Number(e.target.dataset.id);
        const productoEncontrado = productosPuntoCafe.find((p) => p.id === id);

        if (productoEncontrado) {
          agregarAlCarrito(productoEncontrado);
          actualizarContador();
          mostrarAviso(`${productoEncontrado.nombre} se agregó al carrito`);        }
      }
    });
  }
});

