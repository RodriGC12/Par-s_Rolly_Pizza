const testApi = async () => {
    try {
        const payload = {
            nombre: 'agus',
            apellido: 'herr',
            correo: 'agus2@test.com',
            contrasena: '1234',
            rol: 'cocinero'
        };

        console.log("Sending:", payload);

        const res = await fetch("http://localhost:3000/api/usuarios", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Response:", data);
    } catch(err) {
        console.error("Fetch error:", err);
    }
}
testApi();
