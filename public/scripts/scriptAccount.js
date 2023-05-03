var userId = "6452ad4081ca31753412925d";

window.onload = async () => {
    var response = await(await fetch(`/user/${userId}`, {
        method:"GET"
      })).json();
    console.log(response);
    document.getElementById("userEnter").innerHTML = response.username;
    document.getElementById("emailEnter").innerHTML = response.email;
}

