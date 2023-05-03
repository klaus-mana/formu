const form = document.getElementById('signupForm');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await createUser();
});

const createUser = async () => {
    const userEnter = document.getElementById("userEnter").value;
    const emailEnter = document.getElementById("emailEnter").value;
    const passEnter = document.getElementById("passEnter").value;
    const requestBody = {
        username : userEnter,
        email : emailEnter,
        password : passEnter
    };
    var response = await fetch("/auth/register", {
        method:"POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(requestBody)
    });

    if(response.ok) {
        await response.json();
        console.log("OK");
        window.location.replace("/dashboard.html");
    } else {
        const r = await response.text()
        console.log("Unsuccessful: " + response);
    }
};