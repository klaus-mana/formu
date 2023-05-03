
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


function showDict(latexDict) {
    //temporary
    var contentDiv = document.getElementById("content");
    formula_contents = latexDict;
    console.log(latexDict);
    for (var fn of Object.keys(latexDict)) {
      var current = latexDict[fn]
      var thisDiv = document.createElement("div")
      thisDiv.setAttribute("class", "function");
      var newElement = 
      `
      <div class="function" id="${fn}">
                <div class="titleWrapper">
                  <p class="formName">${current[1]}</p><p class="tag">#${current[2]}</p>
                </div>
                <span class="mathSpan">
                    <p class="math" id="${fn}">${current[0]}</p>
                </span>
                <button class="viewEdit" id="button_${fn}">Edit/Use</button>
                <hr>
      </div>
      `;
      console.log(newElement);
      contentDiv.innerHTML = contentDiv.innerHTML + newElement;
      var buttonElement = document.getElementById(`button_${fn}`)
      MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
    }
     var buttons = document.getElementsByClassName("viewEdit");
     for (var b of buttons) {
      b.addEventListener('click', event => {
        editClicked(b);
      });
     }


}

window.addEventListener("load", () => {
  load_lib();
  console.log(window.location);
  var showFunctions = {}
  if(window.location.pathname == "/dashboard-full.html") {
    //showFunctions = getAllUser();
    showFunctions = {
      "id11" : ["latexx", "title-full", "tag"],
      "id2" : ["\\(2e^2\\)", "e^2", "e"],
    };
  } else if(window.location.pathname == "/dashboard.html") {
    //showFunctions = getAllRecents();
    showFunctions = {
      "abc" : ["latexx", "title-norm", "tagged"],
      "idkk" : ["\\(2e^2\\)", "e^2", "e"],
      "whatever" : ["\\(2^x\\)", "2 x squared", "math"]
    };
  } else if(window.location.pathname == "/explore.html") {
    showFunctions = {
      "exploreid1" : ["\\(\\frac{2}{x}\\)", "cool fraction", "lame tag"],
      "exploreid2" : ["\\(\\frac{3}{x}\\)", "cool fraction 2", "lame tag 2"],
      "exploreid3" : ["\\(\\frac{4}{x}\\)", "cool fraction 3", "lame tag 3"],
      "exploreid4" : ["\\(\\frac{5}{x}\\)", "cool fraction 4", "lame tag 4"],
      "exploreid12" : ["\\(\\frac{13}{x}\\)", "cool fraction 12", "lame tag 12"],
      "exploreid13" : ["\\(\\frac{14}{x}\\)", "cool fraction 13", "lame tag 13"],
      "exploreid14" : ["\\(\\frac{15}{x}\\)", "cool fraction 14", "lame tag 14"]
    }
  }
  showDict(showFunctions);
});


/*
* Should be called from the button associated with the function. 
*/
function editClicked(calledFrom) {
  var parent = calledFrom.parentElement;
  var allChildren = parent.allChildren;
  console.log(`PAREnt : ${parent}`);
  console.log(allChildren);
  var function_id = parent.id;
  window.location.replace("/formula.html");
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
/*
function edit_clicked(calledFrom) {
    calledFrom.parentElement.classList.toggle("active");
    var collapseDiv = calledFrom.nextElementSibling.nextElementSibling;
    console.log(collapseDiv);
    if (collapseDiv.style.maxHeight) {
        collapseDiv.style.maxHeight = null;
      } else {
        collapseDiv.style.maxHeight= collapseDiv.scrollHeight + "px";
      }
    var allCollapse = collapseDiv.children;
    for(var i=0; i < allCollapse.length; i++) {
        console.log(allCollapse[i]);
        allCollapse[i].classList.toggle("active");
        if (allCollapse[i].style.maxHeight) {
            allCollapse[i].style.maxHeight = null;
          } else {
            allCollapse[i].style.maxHeight= allCollapse[i].scrollHeight + "px";
          }
    }
}*/