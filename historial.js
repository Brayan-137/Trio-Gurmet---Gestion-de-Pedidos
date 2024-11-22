window.onload = () => {
    const button_pedidos = document.getElementById("button_pedidos");
    const datosPedidos = document.querySelector('#datosTabla tbody');

    button_pedidos.addEventListener("click", async () => {
        try {

            const response = await loadDatosPedido();
            

            datosPedidos.innerHTML = '';

            response.orders.forEach(dishes => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${dishes.id}</td>
                `;
                datosPedidos.appendChild(row);
            });
        } catch (error) {
            console.error("Error al cargar tus pedidos:", error);
        }
    });
}

async function loadDatosPedido() {
    console.log("loadDatosPedido");
    const id = sessionStorage.getItem('id')
    const token = sessionStorage.getItem('token')
    console.log(token)
    try {
        const response = await fetch('https://triogourmet-bps-pnt20242-unisabana.onrender.com/api/clients/'+id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Type': 'client',
                'Authorization': 'Bearer ' + token
            }
        });

        if (response.ok) {
            const datos = await response.json();
            console.log(datos)
            return datos;
        } else {
            console.error("Error en la respuesta de la API:", response.status);
            throw new Error(`Error: ${response.status}`);
        }
    } catch (error) {
        console.error("Error en loadDatosPedido:", error.message);
        throw error;
    }
}
