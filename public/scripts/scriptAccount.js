/*
Author: Bella Salter
Purpose: To be used with viewProfile.html for Formu.
*/
var userId = "";

/*
Checks the user auth and retrieves information about the user. Displays the information in the fields.
*/
window.onload = async () => {
  // ==== CHECK USER AUTH === //
  const authResponse = await (await fetch('/auth/check')).text();
  if (authResponse == 'EXPIRED') {
    window.location.href = '/login.html';
  }
  console.log(authResponse);
  userId = authResponse;
  // === END CHECK USER AUTH === //
    var response = await(await fetch(`/user/${userId}`, {
        method:"GET"
      })).json();
    console.log(response);
    document.getElementById("userEnter").innerHTML = response.username;
    document.getElementById("emailEnter").innerHTML = response.email;
}

