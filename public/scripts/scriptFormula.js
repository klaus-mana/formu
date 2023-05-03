
var active_div = null;
var active_div_orig = null;
var active_button = null;
var formula_contents = null;


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
  script.onload = function () {
    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
  };
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.7/MathJax.js?config=TeX-MML-AM_CHTML';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(script, s);
};


function show_dict() {
    //temporary
    var contentDiv = document.getElementById("content");
    var latexDict = {
      "id1" : ["latex", "title", "tag"],
      "id2" : ["\\(2e^2\\)", "e^2", "e"],
    };
    formula_contents = latexDict;
    console.log(latexDict);
    for (var fn of Object.keys(latexDict)) {
      var current = latexDict[fn]
      var thisDiv = document.createElement("div")
      thisDiv.setAttribute("class", "function");

      var newElement = 
      `
      <div class="function" id="${fn}">
                <h4 id="name" class="formName">${current[1]}</h4>
                <span class="mathSpan">
                    <p class="math" id="${fn}">${current[0]}</p>
                </span>
                <button class="viewEdit" id="button_${fn}">View/Edit</button>
                <hr>
      </div>
      `;
      console.log(newElement);
      contentDiv.innerHTML = contentDiv.innerHTML + newElement;
      var buttonElement = document.getElementById(`button_${fn}`)
      buttonElement.addEventListener("click", () => {
        console.log("SDJFKLE");
        editClicked(buttonElement);
      });
      MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
    }

}

function shareFunction() {
    console.log("Implement, trying to share function");
}

window.addEventListener("load", () => {
  displayFunction();
  document.getElementById("editButton").addEventListener("click" , () => {
      editFunction();
  });
  document.getElementById("shareButton").addEventListener("click", () => {
      shareFunction();
  })
});

function displayFunction() {
  var name = "Energy Equation"
  document.getElementById("formName").innerHTML = name;
  var eqnLatex = "\\(E=mc^2\\)";
  document.getElementById("equation").innerHTML = eqnLatex;
  MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
}

/*
* Should be called from the button associated with the function. 
*/
function editClicked(calledFrom) {
  var parent = calledFrom.parentElement;
  var allChildren = parent.allChildren;
  console.log(parent);
  console.log(allChildren);
  var function_id = parent.id;
  window.location.replace("/formula.html");
  formula_contents = formula_contents[`${function_id}`]
}

/*
To be called from the button next to the equation on the formula page. 
*/
function editFunction() {
  console.log("YO");
  var eqn = document.getElementById("equation");
  console.log(eqn);
  //AUTH HERRE? 
  if(true) {
    var eqnLatex = "\\(2e^2\\)";//!!fix to get from url id and populate 
    var eqnId = eqn.id;
    var newInputHTML = 
    `
    <input class="inputChanges" type="text" value="${eqnLatex}" id="in_${eqn.id}"/>
    `
    eqn.innerHTML = newInputHTML;
    var newInput = document.getElementById(`in_${eqn.id}`);
    newInput.addEventListener("keypress", function (e) {
      if(e.key === "enter") {
        updateEqn(eqn.id, newInput.value);
      }
    });
    /*newInput.style.backgroundColor ="#edeae6";
    newInput.style.borderRadius = "10px";*/
    var calledFrom = document.getElementById("editButton");
    console.log(calledFrom);
    calledFrom.innerHTML = "Save";
    var formSpan = document.getElementById("equation");
    formSpan.style.backgroundColor = "#edeae6";
    calledFrom.addEventListener("click", () => {
        updateEqn(eqnId, newInput.value);
    });
  }
}

function updateEqn(id, newVal) {
    console.log(`Need to implement actually sending, trying to update ${id} with a value of ${newVal}`)
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