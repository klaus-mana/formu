
var active_div = null;
var active_div_orig = null;
var active_button = null;
var formula_contents = null;
var userId = "64521db0f1028b25ce6aa424";

window.MathJax = {
  tex2jax: {
    inlineMath: [ ['$','$'], ["\\(","\\)"] ],
    displayMath: [ ['$$','$$'], ["\\[","\\]"] ]
  }
};
 

window.onload = load_lib();
function load_lib() {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  /*
  script.onload = function () {
    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
  };*/
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.7/MathJax.js?config=TeX-MML-AM_CHTML';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(script, s);
};

async function getDict(keyword="full") {
  if(keyword == "full") {
    var retDict ={};
    var response = await(await fetch(`/user/${userId}/formulas`, {
      method:"GET"
    })).json();
    for(var formula of response) {
      retDict[`${formula._id}`] = [`${formula.raw_latex}`, `${formula.name}`, `${formula.tags}`];
    }
    return retDict;
  } else {
    var i = 0;
    var retDict ={};
    var response = await(await fetch(`/user/${userId}/formulas`, {
      method:"GET"
    })).json();
    for(var formula of response) {
      retDict[`${formula._id}`] = [`${formula.raw_latex}`, `${formula.name}`, `${formula.tags}`];
      i++;
      if(i>2) {
        return retDict;
      }
    }
  }
}

function showDict(latexDict) {
    //temporary
    console.log("showing");
    var contentDiv = document.getElementById("content");
    formula_contents = latexDict;
    /*console.log(latexDict);*/
    for (var fn of Object.keys(latexDict)) {
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
     var buttons = document.getElementsByClassName("viewEdit");
     for (const b of buttons) {
      console.log(b);
      b.addEventListener('click', event => {
        editClicked(b);
      });
     }


}

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

window.onload = async function () {
  MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
  //load_lib();
  /*console.log(window.location);*/
  var showFunctions = {}
  if(window.location.pathname == "/dashboard-full.html") {
    //showFunctions = getAllUser();
    showFunctions = {
      "id11" : ["latexx", "title-full", "tag"],
      "id2" : ["\\(2e^2\\)", "e^2", "e"],
    };
    showDict(await getDict());
  } else if(window.location.pathname == "/dashboard.html") {
    console.log("HERE");
    //showFunctions = getAllRecents();
    showFunctions = {
      "abc" : ["latexx", "title-norm", "tagged"],
      "idkk" : ["\\(2e^2\\)", "e^2", "e"],
      "whatever" : ["\\(2^x\\)", "2 x squared", "math"]
    };
    showDict(await getDict("few"));
  }
    document.getElementById("addNew").addEventListener('click', event => {
    console.log("event");
    createNewFunction();
  });
};



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

function goToViewAll() {
  window.location.replace("/dashboard-full.html");
}
/*
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

function updateEqn(id, newVal) {
  console.log(`Need to implement, trying to update ${id} with a value of ${newVal}`)
}