/*
Author: Bella Salter
Purpose: To be used with dashboard.html and dashboard-full.html for FormU.
*/
var active_div = null;
var active_div_orig = null;
var active_button = null;
var formula_contents = null;
var userId = "";
var allTags = [];

/*
MathJax setup for the window
*/
window.MathJax = {
  tex2jax: {
    inlineMath: [ ['$','$'], ["\\(","\\)"] ],
    displayMath: [ ['$$','$$'], ["\\[","\\]"] ]
  }
};
 
/*
Loads the MathJax for the window.
*/
window.onload = load_lib();
function load_lib() {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.7/MathJax.js?config=TeX-MML-AM_CHTML';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(script, s);
};

/*
Formats a dictionary of functions from the response from the server.
If keyword is full, then returns everything. Otherwise, only returns the first 3.
*/
async function getDict(keyword="full") {
  var retDict ={};
    var response = await(await fetch(`/user/${userId}/formulas`, {
      method:"GET"
    })).json();
    for(var formula of response) {
      if(formula != null) {
        retDict[`${formula._id}`] = [`${formula.raw_latex}`, `${formula.name}`, `${formula.tags}`];
        for(var tag of formula.tags) {
          console.log(tag);
          if(!allTags.includes(tag)) {
            allTags.push(tag);
          }
        }
      }
    }
  if(keyword == "full") {
    return retDict;
  } else {
    var i = 0;
    if (Object.keys(retDict).length <= 3) return retDict;

    return Object.fromEntries(Object.entries(retDict).slice(0,3));
  }
}

/*
Formats the given dictionary properly for display and shows contents on the page.
*/
function showDict(latexDict) {
    //temporary
    console.log("showing");
    var contentDiv = document.getElementById("content");
    formula_contents = latexDict;
    /*console.log(latexDict);*/
    console.log(latexDict);
    for (var fn of Object.keys(latexDict)) {
      if(fn != null) {
        console.log(fn);
        var current = latexDict[fn];
        var thisDiv = document.createElement("div");
        thisDiv.setAttribute("class", "function");
        var newElement = 
        `
        <div class="function" id="div_${fn}">
                  <div class="titleWrapper">
                    <p class="formName">${current[1]}</p><p class="tag">#${current[2]}</p>
                  </div>
                  <span class="mathSpan">
                      <p class="math" id="math_${fn}">${current[0]}</p>
                  </span>
                  <button class="viewEdit" id="${fn}">Edit/Use</button>
                  <hr>
        </div>
        `;
        /*
        console.log(newElement);*/
        contentDiv.innerHTML = contentDiv.innerHTML + newElement;
        //var buttonElement = document.getElementById(`${fn}`)
        MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
      }
    }
     var buttons = document.getElementsByClassName("viewEdit");
     for (const b of buttons) {
      console.log(b);
      b.addEventListener('click', event => {
        editClicked(b);
      });
     }


}

/*
Creates a new blank function for the user.
*/
async function createNewFunction() {
  console.log("Creating new function");
  var reqBody = {
      user_id: userId,
      raw_latex: "\\( \\)"
  }
  var response = await(await fetch("/formula/create", {
    method:"POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(reqBody)
  })).json();
  console.log(response);
  var req2 = {
    form_id : response._id
  }
  var response2 = await fetch(`/user/${userId}/save`, {
    method : "PATCH",
    headers:{"Content-Type": "application/json"},
    body:JSON.stringify(req2)
  });
  window.location.replace("/formula.html" + `?id=${response._id}`);
}

/*
Window initiation, checks user auth and adds some necessary event listeners.
*/
window.onload = async function () {

  // ==== CHECK USER AUTH === //
  const authResponse = await (await fetch('/auth/check')).text();
  if (authResponse == 'EXPIRED') {
    window.location.href = '/login.html';
  }
  console.log(authResponse);
  userId = authResponse;
  // === END CHECK USER AUTH === //

  MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
  var showFunctions = {}
  if(window.location.pathname == "/dashboard-full.html") {
    showDict(await getDict());
    await formatTags();
  } else if(window.location.pathname == "/dashboard.html") {
    showDict(await getDict("few"));
  }
    document.getElementById("addNew").addEventListener('click', event => {
    createNewFunction();
  });
};

/*
Gets a dictionary of the formulas tagged with the given tag. Also calls showDict to show this function.
*/
async function getTagged(tag) {
  var retDict ={};
    var response = await(await fetch(`/user/${userId}/formulas`, {
      method:"GET"
    })).json();
    for(var formula of response) {
      if(formula != null && formula.tags.includes(tag)) {
        retDict[`${formula._id}`] = [`${formula.raw_latex}`, `${formula.name}`, `${formula.tags}`];
      }
    }
  document.getElementById("content").innerHTML = 
  `
  <h3 id="bigTitle">All Functions</h3>
  <span id="addNew" class="material-symbols-outlined">add_circle</span>
  `
  showDict(retDict);
}

/*
Formats the tags properly and adds event listeners.
*/
async function formatTags() {
  var tagsLocation = document.getElementById("tagsDiv");
  console.log(allTags);
  for(const tag of allTags) {
    var newHTMl= 
    `
    <h4 class="tags"><a id="${tag}">${tag}</a></h4>
    `
    tagsLocation.innerHTML = tagsLocation.innerHTML + newHTMl;
  }
  for(const tag of allTags) {
    document.getElementById(tag).addEventListener("click", async () => {
      await getTagged(tag);
    })
  }
}

/*
* Should be called from the button associated with the function. 
*/
function editClicked(calledFrom) {
  //console.log("here");
  //console.log("calledFrom" + calledFrom.id);
  //var parent = calledFrom.parentElement;
  //var allChildren = parent.allChildren;
  //console.log(`PAREnt : ${parent}`);
  //console.log(allChildren);
  var function_id = calledFrom.id;
  console.log(function_id);
  window.location.replace("/formula.html" + `?id=${function_id}`);
  formula_contents = formula_contents[`${function_id}`]
}

/*
Directs the user to the full dashboard.
*/
function goToViewAll() {
  window.location.replace("/dashboard-full.html");
}

/*
Goes to the edit function page for the right function.
To be called from the button next to the equation on the formula page. 
*/
function editFunction(calledFrom) {
  console.log("YO");
  var eqn = document.getElementById("equation");
  console.log(eqn);
  //AUTH HERRE? 
  if(true) {
    var eqnLatex = "\\(2e^2\\)";//!!fix to get from url id and populate 
    var eqnId = eqn.id;
    var newInputHTML = 
    `
    <input type="text" value="${eqnLatex}" id="in_${eqn.id}"/>
    `
    eqn.innerHTML = newInputHTML;
    var newInput = document.getElementById(`in_${eqn.id}`);
    newInput.addEventListener("keypress", function (e) {
      if(e.key === "enter") {
        updateEqn(eqn.id, newInput.value);
      }
    });
    calledFrom.innerHTML = "Submit";
    calledFrom.addEventListener("keypress", function (e) {
      if(e.key === "enter") {
        updateEqn(eqn.id, newInput.value);
      }
    })
  }
}
