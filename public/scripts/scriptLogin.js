/*
Author: Bella Salter
Purpose: To be used with login.html for FormU.
*/
const form = document.getElementById("loginForm")
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    const user = formData.get("userEnter");
    const pass = formData.get("passEnter");

    const reqBody = {
        username: user,
        password: pass
    };

    const r = await fetch("/auth/login", {
        method:"POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(reqBody)
    });

    if(r.ok) {
        const response = await r.json();
        window.location.replace("/dashboard.html");
    } else {
        const response = await r.text()
        console.log("Unsuccessful: " + response);
    }
})