// URL base de la API
const API_URL = 'http://127.0.0.1:8000/api/orders';

// Selección de elementos del DOM
const filtroForm = document.getElementById('filtro-form');
const estadoSelect = document.getElementById('estado');
const nombreInput = document.getElementById('nombre');
const tablaPedidos = document.getElementById('tabla-pedidos');

let orders = null;


window.onload = async () => {
    // Obtener los pedidos de la base de datos
    orders = await fetch(API_URL, {
        method: 'GET',
        headers: {
            'Content-Type': 'aplication/json',
            'User-Type': 'employee',
            'Authorization': `Bearer ${"9|7UwzgXqhxT6AnKy6DxbHTEnAKRhXJIGlz2NTC12h3b7d3315"}`
        }
    })
    .then(response => response.json())
    .then(data => () => {
        console.log(data);
        mostrarPedidos();
    })
    .catch(error => console.log("Error:" + String(error)));


    // Eventos
    filtroForm.addEventListener('submit', (event) => {
        event.preventDefault();
        filtrarPedidos();
    });

    estadoSelect.addEventListener('change', (event) => filtrarPedidos());

    let temporizador;
    nombreInput.addEventListener('input', (event) => {
        clearTimeout(temporizador);
        temporizador = setTimeout(filtrarPedidos, 500);
    });
}

// Filtrar pedidos en tabla
function filtrarPedidos (filtros={estado: estadoSelect.value, nombre:nombreInput.value.trim()}) {
    console.log("Filtrando pedidos por:", filtros)
    let pedidosFiltrados = orders;
    if (filtros.estado) {
        filtros.estado = filtros.estado === "pendiente" ? "PENDING" : "RESOLVED";
        pedidosFiltrados = pedidosFiltrados.filter(pedido => pedido.status === filtros.estado);
    }
    if (filtros.nombre) {
        pedidosFiltrados = pedidosFiltrados.filter(pedido => pedido.client && pedido.client.name.toLowerCase().includes(filtros.nombre.toLowerCase()));
    }

    mostrarPedidos(pedidosFiltrados);
}

// Mostrar pedidos en la tabla
function mostrarPedidos(pedidos=orders) {
    tablaPedidos.innerHTML = ''; 

    if (pedidos.length === 0) {
        tablaPedidos.innerHTML = '<tr><td colspan="5">No se encontraron pedidos.</td></tr>';
        return;
    }

    pedidos.forEach((pedido) => {
        // console.log('Procesando pedido:', pedido); 

        const row = document.createElement('tr');
        row.dataset.id = pedido.id; // Añadir el ID al atributo data-id para identificar filas

        row.innerHTML = `
            <td>${pedido.id || 'Sin ID'}</td>
            <td>${pedido.status || 'Desconocido'}</td>
            <td>${pedido.client_id || 'Sin Cliente'}</td>
            <td>${pedido.client ? pedido.client.name : 'Sin Nombre'}</td>
            <td class="actions">
                <button class="update" onclick="cambiarEstado(${pedido.id}, '${pedido.status}')">Cambiar Estado</button>
            </td>
        `;

        tablaPedidos.appendChild(row);
    });
}

async function cambiarEstado(id, estadoActual) {
    // Cambiar el estado entre PENDING y ATTENDED
    const nuevoEstado = estadoActual === 'PENDING' ? 'RESOLVED' : 'PENDING';
    const tr = document.querySelector(`tr[data-id="${id}"]`);

    console.log(`Cambiando estado del pedido con ID ${id} a ${nuevoEstado}`);

    await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',	
        headers: {
            'Content-Type': 'application/json',
            'User-Type': 'employee',
            'Authorization': `Bearer ${8|eynwNsGwZ5S2APIbO6TUuCRaH4gZpx3PMMoRGV3Wa4a8736e}`
         },
        body: JSON.stringify({ status: nuevoEstado }),
    })
    .then((response) => response.json())
    .then((data) => {
        orders.forEach((order) => {
            if(order.id === data.id){
                // console.log('Procesando pedido:', order);

                order.status = data.status;

                tr.querySelector('td:nth-child(2)').textContent = data.status;
                tr.querySelector('td:nth-child(5) button').setAttribute('onclick', `cambiarEstado('${order.id}', '${order.status}')`);
                filtrarPedidos();
            }
        });
    })
    .catch((error) => {
        console.error('Error al cambiar el estado awawa:', error);
    });
}