//index.js - punto café
//carga el json, renderiza la vista y maneja los eventos del index
 
 
//1. referencias a los elementos del html
 
const URL_DATOS = './recursos/datos/index.json'
 
const btnMenu = document.querySelector('#btn-menu')
const navegacion = document.querySelector('#navegacion-principal')
const contador = document.querySelector('#contador-carrito')
const grillaCategorias = document.querySelector('#grilla-categorias')
const filtros = document.querySelector('#filtros-destacados')
const grillaDestacados = document.querySelector('#grilla-destacados')
const promo = document.querySelector('#promo')
const formulario = document.querySelector('#form-suscripcion')
const mensajeForm = document.querySelector('#mensaje-form')
const aviso = document.querySelector('#aviso')
 
 
//2. funciones de datos y renderizado
 
//trae los datos de un json con fetch y los devuelve como objeto
const fetchDatos = async (url) => {
    const respuesta = await fetch(url)
 
    //si el archivo no se encuentra (404, etc) se corta con un error
    if(!respuesta.ok){
        throw new Error(`No se pudo cargar ${url} (estado ${respuesta.status})`)
    }
 
    const datos = await respuesta.json()
    return datos
}
 
//inyecta en el contenedor el html que arma la plantilla para cada dato
const render = (contenedor, datos, plantilla) => {
    if(datos.length === 0){
        contenedor.innerHTML = '<p class="mensaje-vacio">No hay productos para mostrar.</p>'
        return
    }
 
    let html = ''
    datos.forEach((dato) => {
        html += plantilla(dato)
    })
    contenedor.innerHTML = html
}
 
//devuelve solo los productos de la categoría elegida
const filtrarPorCategoria = (productos, categoria) => {
    if(categoria === 'todos'){
        return productos
    }
    return productos.filter((producto) => producto.categoria === categoria)
}
 
//da formato de precio argentino: 1200 -> $1.200
const formatearPrecio = (precio) => {
    return `$${precio.toLocaleString('es-AR')}`
}
 
 
//3. plantillas: reciben un dato del json y devuelven el html como string
 
const plantillaCategoria = (categoria) => {
    return `
        <li>
            <article class="tarjeta-categoria">
                <a href="${categoria.enlace}">
                    <img src="${categoria.imagen}" alt="Categoría ${categoria.nombre}" width="200">
                    <h3>${categoria.nombre}</h3>
                    <p class="link-explorar">Explorar ${categoria.nombre}</p>
                </a>
            </article>
        </li>
    `
}
 
//el id queda en data-id para el botón agregar
const plantillaProducto = (producto) => {
    return `
        <article class="tarjeta-producto">
            <img src="${producto.imagen}" alt="${producto.nombre}" width="300">
            <div class="info-card">
                <h3>${producto.nombre}</h3>
                <p class="precio">${formatearPrecio(producto.precio)}</p>
                <p class="descripcion">${producto.descripcion}</p>
                <button type="button" class="btn-agregar" data-id="${producto.id}">Agregar</button>
            </div>
        </article>
    `
}
 
const plantillaPromo = (promo) => {
    return `
        <div class="texto-promo">
            <p class="etiqueta-promo">${promo.etiqueta}</p>
            <h2>${promo.titulo}</h2>
            <p>${promo.detalle}</p>
            <a class="btn-promo" href="${promo.enlace}">${promo.boton}</a>
        </div>
        <img class="imagen-promo" src="${promo.imagen}" alt="${promo.titulo}" width="420">
    `
}
 
 
//4. carrito en localStorage (compartido con menu.html y checkout.html)
 
const obtenerCarrito = () => {
    const guardado = localStorage.getItem('carrito')
    return guardado ? JSON.parse(guardado) : []
}
 
//si el producto ya está suma 1 a la cantidad, si no lo agrega
const agregarAlCarrito = (producto) => {
    const carrito = obtenerCarrito()
    const existente = carrito.find((item) => item.id === producto.id)
 
    if(existente){
        existente.cantidad++
    }else{
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: 1
        })
    }
 
    localStorage.setItem('carrito', JSON.stringify(carrito))
}
 
//suma las cantidades y las muestra sobre el ícono del carrito
const actualizarContador = () => {
    const total = obtenerCarrito().reduce((suma, item) => suma + item.cantidad, 0)
 
    contador.textContent = total
    //si el carrito está vacío el globito se oculta
    contador.hidden = total === 0
}
 
//mensaje flotante que se muestra unos segundos
let temporizador
const mostrarAviso = (texto) => {
    aviso.textContent = texto
    aviso.classList.add('visible')
    clearTimeout(temporizador)
    temporizador = setTimeout(() => aviso.classList.remove('visible'), 2500)
}
 
 
//5. menú hamburguesa (celular)
 
btnMenu.addEventListener('click', () => {
    //toggle agrega la clase si no está y la quita si está
    const abierto = navegacion.classList.toggle('abierta')
 
    //se informa el estado para lectores de pantalla
    btnMenu.setAttribute('aria-expanded', abierto)
    btnMenu.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú')
})
 
 
//6. validaciones del formulario: devuelven '' si está bien o el mensaje de error
 
//solo letras (con tildes y ñ) y espacios
const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/
//texto@texto.dominio
const regexEmail = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/
 
const validarNombre = (nombre) => {
    const valor = nombre.trim()
 
    if(valor === ''){
        return 'Ingresá tu nombre.'
    }else if(valor.length < 3){
        return 'El nombre debe tener al menos 3 letras.'
    }else if(!regexNombre.test(valor)){
        return 'El nombre solo puede tener letras y espacios.'
    }
    return ''
}
 
const validarEmail = (email) => {
    const valor = email.trim()
 
    if(valor === ''){
        return 'Ingresá tu email.'
    }else if(!regexEmail.test(valor)){
        return 'El email no es válido. Ejemplo: nombre@correo.com'
    }
    return ''
}
 
const validarPreferencia = (preferencia) => {
    if(preferencia === ''){
        return 'Elegí qué promos te interesan.'
    }
    return ''
}
 
const validarTerminos = (aceptado) => {
    if(!aceptado){
        return 'Tenés que aceptar recibir correos de Punto Café.'
    }
    return ''
}
 
//muestra u oculta el error de un campo
const mostrarError = (campo, mensaje) => {
    const error = document.querySelector(`#error-${campo.id}`)
    error.textContent = mensaje
 
    //aria-invalid marca el campo con error (y el css lo pinta de rojo)
    if(mensaje){
        campo.setAttribute('aria-invalid', 'true')
    }else{
        campo.removeAttribute('aria-invalid')
    }
}
 
 
//7. formulario de suscripción
 
const nombre = document.querySelector('#nombre')
const email = document.querySelector('#email')
const preferencia = document.querySelector('#preferencia')
const terminos = document.querySelector('#terminos')
 
//cada campo con su función de validación
const reglas = [
    { campo: nombre, validar: () => validarNombre(nombre.value) },
    { campo: email, validar: () => validarEmail(email.value) },
    { campo: preferencia, validar: () => validarPreferencia(preferencia.value) },
    { campo: terminos, validar: () => validarTerminos(terminos.checked) }
]
 
//al salir de un campo se valida solo ese (evento blur)
reglas.forEach((regla) => {
    regla.campo.addEventListener('blur', () => {
        mostrarError(regla.campo, regla.validar())
    })
})
 
formulario.addEventListener('submit', (evento) => {
    //se evita que el formulario recargue la página
    evento.preventDefault()
 
    let valido = true
    reglas.forEach((regla) => {
        const error = regla.validar()
        mostrarError(regla.campo, error)
        if(error){
            valido = false
        }
    })
 
    if(!valido){
        mensajeForm.textContent = 'Revisá los campos marcados.'
        mensajeForm.className = 'mensaje-form error'
        //se lleva el foco al primer campo con error
        formulario.querySelector('[aria-invalid="true"]').focus()
        return
    }
 
    //datos que se enviarían al servidor
    const suscripcion = {
        nombre: nombre.value.trim(),
        email: email.value.trim(),
        preferencia: preferencia.value
    }
    console.log('Suscripción enviada:', suscripcion)
 
    mensajeForm.textContent = `¡Gracias ${suscripcion.nombre}! Te vamos a avisar de las promos en ${suscripcion.email}.`
    mensajeForm.className = 'mensaje-form exito'
    formulario.reset()
})
 
 
//8. inicio: carga del json, renderizado, filtro y botón agregar
 
const iniciarApp = async () => {
    actualizarContador()
 
    let datos
 
    //estrategia de caché: si ya se cargó en esta sesión no se vuelve a pedir
    try{
        if(sessionStorage.getItem('datosIndex')){
            datos = JSON.parse(sessionStorage.getItem('datosIndex'))
        }else{
            datos = await fetchDatos(URL_DATOS)
            sessionStorage.setItem('datosIndex', JSON.stringify(datos))
        }
    }catch(error){
        console.error(error)
        grillaDestacados.innerHTML = '<p class="mensaje-vacio">No se pudieron cargar los productos. Intentá de nuevo más tarde.</p>'
        return
    }
 
    //renderizado de las tres secciones
    render(grillaCategorias, datos.categorias, plantillaCategoria)
    render(grillaDestacados, datos.destacados, plantillaProducto)
    promo.innerHTML = plantillaPromo(datos.promo)
 
    //filtro por categoría (un solo escuchador para todos los botones)
    filtros.addEventListener('click', (evento) => {
        const boton = evento.target.closest('.filtro-btn')
        if(!boton) return
 
        //se cambia el botón activo
        filtros.querySelector('.activo').classList.remove('activo')
        boton.classList.add('activo')
        filtros.querySelectorAll('.filtro-btn').forEach((btn) => {
            btn.setAttribute('aria-pressed', btn === boton)
        })
 
        const filtrados = filtrarPorCategoria(datos.destacados, boton.dataset.categoria)
        render(grillaDestacados, filtrados, plantillaProducto)
    })
 
    //botón agregar: se busca el producto por el data-id de la tarjeta
    grillaDestacados.addEventListener('click', (evento) => {
        const boton = evento.target.closest('.btn-agregar')
        if(!boton) return
 
        const id = Number(boton.dataset.id)
        const producto = datos.destacados.find((item) => item.id === id)
 
        agregarAlCarrito(producto)
        actualizarContador()
        mostrarAviso(`${producto.nombre} se agregó al carrito`)
    })
}
 
iniciarApp()