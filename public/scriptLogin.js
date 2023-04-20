
const form = document.getElementById("loginForm")
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const user = formData.get("userEnter");
    const pass = formData.get("passEnter");
    const reqBody = {
        username: user,
        password: pass
    }
    var r = await fetch("/auth/login", {
        method:"POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(reqBody)
    });
    var response = await r.json();
    if(r.ok) {
        console.log("Successful login");
        console.log("Token: " + response.token);
        window.location.replace("/dashboard.html")
    } else {
        console.log("Unsuccessful: " + response.message);
    }
})