// URL base de la API
const API_URL = 'https://triogourmet-bps-pnt20242-unisabana.onrender.com/api/orders';

// Selección de elementos del DOM
let filtroForm = null;
let estadoSelect = null;
let nombreInput = null;
let tablaPedidos = null;

let orders = null;

window.onload = async () => {
    if (!sessionStorage.getItem('token')) {
        window.location.href = 'login.html';
    }

    filtroForm = document.getElementById('filtro-form');
    estadoSelect = document.getElementById('estado');
    nombreInput = document.getElementById('nombre');
    tablaPedidos = document.getElementById('tabla-pedidos');

    const token = sessionStorage.getItem('token');

    // Obtener los pedidos de la base de datos
    await fetch(API_URL, {
        method: 'GET',
        headers: {
            'Content-Type': 'aplication/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        orders = data;
        mostrarPedidos();
    })
    // .catch(error => console.log("Error:" + String(error)));


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

    const logout = document.getElementById('button-logout');

    logout.addEventListener('click', async (event) => {
        event.preventDefault();
        const token = sessionStorage.getItem('token');
        if (token) {
            await fetch('https://triogourmet-bps-pnt20242-unisabana.onrender.com/api/logout', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => {
                console.log(response)
                if (!response.ok) {
                    console.log("Error en la respuesta");
                    return;
                }
                response.json();
            })
            .then(response => {
                console.log(response);
                sessionStorage.clear();
                window.location.href = 'login.html'
            })
            .catch(error => console.log("Error: ", error));
        }  
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
        tablaPedidos.innerHTML = '<tr><td colspan="4">No se encontraron pedidos.</td></tr>';
        return;
    }
    // console.log(pedidos);
    pedidos.forEach((pedido) => {
        // console.log('Procesando pedido:', pedido); 

        const row = document.createElement('tr');
        row.dataset.id = pedido.id; // Añadir el ID al atributo data-id para identificar filas

        row.innerHTML = `
            <td>${pedido.id || 'Sin ID'}</td>
            <td>${pedido.client_id || 'Sin Cliente'}</td>
            <td>${pedido.client ? pedido.client.name : 'Sin Nombre'}</td>
        `;
        let dishes = document.createElement('ul');
        let total = 0;
        pedido.dishes.forEach((dish) => {
            let li = document.createElement('li')
            li.innerHTML = dish.name;
            total += dish.price*dish.pivot.quantity;
            dishes.append(li)
        });
        let dishes_campo = document.createElement('td');
        dishes_campo.append(dishes);
        row.append(dishes_campo);
        row.innerHTML += `<td>$${total}</td>`;
        row.innerHTML += `<td onClick="cambiarEstado(${pedido.id}, '${pedido.status}')"><p>${pedido.status || 'Desconocido'}</p></td>`;

        tablaPedidos.appendChild(row);
    });
}

async function cambiarEstado(id, estadoActual) {
    // Cambiar el estado entre PENDING y ATTENDED
    const nuevoEstado = estadoActual === 'PENDING' ? 'RESOLVED' : 'PENDING';
    const tr = document.querySelector(`tr[data-id="${id}"]`);

    console.log(`Cambiando estado del pedido con ID ${id} a ${nuevoEstado}`);
    const token = sessionStorage.getItem('token');

    await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',	
        headers: {
            'Accept': 'aplication/json',
            'Content-Type': 'aplication/json',
            'Authorization': `Bearer ${token}`,
         },
        body: JSON.stringify({ status: nuevoEstado})
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la solicitud: ' + response.statusText);
          }
          return response.json();
    })
    .then((data) => {
        console.log(data)
        orders.forEach((order) => {
            if(order.id === data.id){
                // console.log('Procesando pedido:', order);

                order.status = data.status;

                tr.querySelector('td:nth-child(5)').textContent = data.status;
                tr.querySelector('td:nth-child(6)').setAttribute('onclick', `cambiarEstado('${order.id}', '${order.status}')`);
                filtrarPedidos();
            }
        });
    })
    .catch((error) => {
        console.error('Error al cambiar el estado awawa:', error);
    });
}