/*
Author: Bella Salter
Purpose: To be used with explore.html for FormU.
*/
var active_div = null;
var active_div_orig = null;
var active_button = null;
var formula_contents = null;
var eqnLatex = "";
var fnID = "";
var userId = "";

/*
MathJax config
*/
window.MathJax = {
  tex2jax: {
    inlineMath: [ ['$','$'], ["\\(","\\)"] ],
    displayMath: [ ['$$','$$'], ["\\[","\\]"] ]
  }
};
window.onload = load_lib();

/*
Checks user auth and loads MathJax
*/
async function load_lib() {
  // ==== CHECK USER AUTH === //
  const authResponse = await (await fetch('/auth/check')).text();
  if (authResponse == 'EXPIRED') {
      window.location.href = '/login.html';
  }
  userId = authResponse;
  // === END CHECK USER AUTH === //

  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.onload = function () {
    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
  };
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.7/MathJax.js?config=TeX-MML-AM_CHTML';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(script, s);
};

/*
Creates necessary event listeners on load.
*/
window.addEventListener("load", () => {
  displayFunction();
  document.getElementById("editButton").addEventListener("click" , () => {
      editFunction();
  });

  document.getElementById("deleteButton").addEventListener("click", () => {
    deleteFunction();
  });
  document.getElementById("runButton").addEventListener("click", () => {
    useSimple();
  });

  const fileRunForm = document.getElementById('fileRunForm');
  fileRunForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const data = new FormData(fileRunForm);

  const response = await fetch(`/formula/${fnID}/run/file`, {
    method: 'POST',
    body: data
   });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'result.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      console.log(await response.text());
    }
  });
  
});

/*
Runs the simple input in the formula.
*/
async function useSimple() {
  var input = document.getElementById("simpleInput").value;
  var reqBody ={};
  for(var x of input.split(",")){
    x=x.trim();
    var fullX = x.split("=");
    var varName = fullX[0].trim();
    var varVal = fullX[1].trim();
    reqBody[varName] = parseFloat(varVal);
  }
  var response = await (await fetch(`/formula/${fnID}/run/simple`, {
    method:"POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(reqBody)
  })).text();
  document.getElementById("outputPlace").value = response;
}

/*
Deletes the function.
*/
async function deleteFunction() {
  var reqBody= {
    form_id:fnID
  };
  var response = await(await fetch(`/user/${userId}/remove`, {
    method:"DELETE",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(reqBody)
  }));
  var response2 = await(await fetch(`/formula/${userId}/delete`, {
    method:"DELETE",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(reqBody)
  }));
  window.location.replace("/dashboard-full.html");
}

/*
Gets all details about the function and displays them.
Adds event listeners to the buttons now that all fields are populated.
*/
async function displayFunction() {
  const queryString = window.location.search;
  var urlSearch = new URLSearchParams(queryString);
  var id = urlSearch.get("id");
  fnID = id;
  var response = await(await fetch(`/formula/${fnID}`, {
    method:"GET"
  })).json();
  var describe = document.getElementById("describe");
  if(response.description.length!=0) {
    describe.setAttribute("placeholder", "");
    describe.setAttribute("value", response.description);
  }

  var name = response.name;
  var tags = response.tags;
  document.getElementById("formTag").innerHTML = `#${tags}`;
  document.getElementById("formName").value = name;
  document.getElementById("formName").addEventListener("keypress", async function (e) {
    if(e.keyCode == 13) {
      var newVal = document.getElementById("formName").value;
      var r = await submitChanges({name: newVal}); 
    }
  });
  document.getElementById("tagAdder").addEventListener("keypress", async function (e) {
    if(e.keyCode == 13) {
      var oldTags = response.tags;
    var newTag = document.getElementById("tagAdder").value;
    if(newTag.length > 0) {
      oldTags.push(newTag);
      var r = await submitChanges({tags:oldTags});
      document.getElementById("formTag").innerHTML =`#${oldTags}`;
    }
  }
  });
  document.getElementById("describe").addEventListener("keypress", async function (e) {
    if(e.keyCode == 13) {
      var newDescribe = document.getElementById("describe").value;
      var r = await submitChanges({description:newDescribe});
    }
  })
  eqnLatex = response.raw_latex;
  document.getElementById("equation").innerHTML = eqnLatex;
  MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
  document.getElementById("submitButton").addEventListener("click", async () => {
    var newInput = document.getElementById(`in_${fnID}`);
    var newEqn = newInput.value;
    var oldTags = response.tags;
    var newTag = document.getElementById("tagAdder").value;
    if(newTag.length > 0) {
      oldTags.push(newTag);
    }
    var allChanges = {
      raw_latex:newEqn, 
      name: document.getElementById("formName").value,
      description: document.getElementById("describe").value,
      tags: oldTags
    }
    var r = await submitChanges(allChanges);
    var wrapper = document.getElementById("equation");
    wrapper.innerHTML = `${newEqn}`
    document.getElementById("editButton").style.display = "inline";
    document.getElementById("submitButton").style.display = "none";
    wrapper.style.backgroundColor ="#DDD9D4";
    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
    window.location.replace("/dashboard-full.html");
    });
}

/*
Submits changes to the server.
*/
async function submitChanges(data){
  var response = await(await fetch(`/formula/${fnID}/edit`, {
    method:"PATCH",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
  })).json();
  return response;
}

/*
To be called from the button next to the equation on the formula page. Allows editing of the funciton.
*/
async function editFunction() {
  var eqn = document.getElementById("equation");
  //AUTH HERRE? 
  if(true) {
    var newInputHTML = 
    `
    <input class="inputChanges" type="text" value="${eqnLatex}" id="in_${fnID}"/>
    `
    eqn.innerHTML = newInputHTML;
    var newInput = document.getElementById(`in_${fnID}`);
    newInput.addEventListener("keypress", function (e) {
      if(e.key === "enter") {
        updateEqn(eqn.id, newInput.value);
      }
    });
    var calledFrom = document.getElementById("editButton");
    var submitFrom = document.getElementById("submitButton");
    //start changes here
    calledFrom.style.display = "none";
    submitFrom.style.display = "inline";
    var formSpan = document.getElementById("equation");
    formSpan.style.backgroundColor = "#edeae6";
  }
}

/*
Updates the equation to the new value.
*/
function updateEqn(id, newVal) {
    var wrapper = document.getElementById("equation");
    wrapper.innerHTML = `${newVal}`
    var editButton = document.getElementById("editButton");
    editButton.innerHTML = "Edit";
    editButton.addEventListener("click", () => {
        editFunction();
    });
    wrapper.style.backgroundColor ="#DDD9D4";
    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
    }