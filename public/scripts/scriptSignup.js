

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
    await response;
    window.location.replace("/dashboard.html");
};
