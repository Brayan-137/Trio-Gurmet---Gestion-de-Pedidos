window.onload = () => {
    const button_ingresar = document.getElementById("button_ingresar");
    const input_email = document.getElementById("input_email");
    const input_password = document.getElementById("input_password");
    const label_message = document.getElementById("label_message");

    input_email.setAttribute('value', sessionStorage.getItem('email'));
    input_password.setAttribute('value', sessionStorage.getItem('password'));

    
    button_ingresar.addEventListener("click", async () => {
        const email =   input_email.value;
        const password = input_password.value;

        sessionStorage.setItem('email', email);
        sessionStorage.setItem('password', password);

        input_email.innerHTML = '';
        input_password.innerHTML = '';
        
        const token = sessionStorage.getItem('token');

        if (!token || token == "undefined") {
            await login(email, password);
        } 
    });
}


async function login(email, password) {
    console.log("login");
    return fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + btoa(`${email}:${password}`),
            'Content-Type': 'application/json',
            'User-Type': 'client'
        },
    })
    .then(response => {
        if (response.ok) {
            return response.json().then(datos =>{
                sessionStorage.setItem('token', datos.access_token);
                sessionStorage.setItem('id', datos.user.id);
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
