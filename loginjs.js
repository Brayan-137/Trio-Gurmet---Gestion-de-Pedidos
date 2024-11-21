window.onload = () => {
    const button_ingresar = document.getElementById("button_ingresar");
    const input_name = document.getElementById("input_name");
    const input_password = document.getElementById("input_password");
    const label_message = document.getElementById("label_message");

    input_name.setAttribute('value', sessionStorage.getItem('name'));
    input_password.setAttribute('value', sessionStorage.getItem('password'));

    
    button_ingresar.addEventListener("click", async () => {
        const name =   input_name.value;
        const password = input_password.value;

        sessionStorage.setItem('name', name);
        sessionStorage.setItem('password', password);

        input_name.innerHTML = '';
        input_password.innerHTML = '';
        
        const token = sessionStorage.getItem('token');

        if (!token || token == "undefined") {
            await login(name, password);
        } 
    });
}


async function login(name, password) {
    console.log("login");
    return fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            password: password
        })
    })
    .then(response => {
        if (response.ok) {
            return response.json().then(datos =>{
                console.log(datos);
                window.location.href = 'otro.html';
            });
        } else {
            label_message.textContent = 'Nombre o contraseña incorrectos';
            throw new Error("Error de autenticación: " + response.status);
        }
    })
    .then(response => {
        sessionStorage.setItem('token', response.token)
        console.log(sessionStorage.getItem('token'));
        return response
    })
    .catch(error => {
        console.error("Error: " + error);
        return error.message
    });
}
