window.onload = () => {
    const button_pedidos = document.getElementById("button_pedidos");
    const datosPedidos = document.querySelector('#datosTabla tbody');

    button_pedidos.addEventListener("click", async () => {
        try {

            const response = await loadDatosPedido();
            

            datosPedidos.innerHTML = '';

            response.forEach(skills => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${skills.id}</td>
                    <td>${skills.name}</td>
                    <td>${skills.description}</td>
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
    try {
        const response = await fetch('http://127.0.0.1:8000/api/skills', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            const datos = await response.json();
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
