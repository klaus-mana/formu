
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
                <h4 class="formName">${current[1]}</h4>
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
      })
      MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
    }

}

window.addEventListener("load", () => {
  show_dict();
  if(window.location == "./formula.html") {
    console.log("WORK");
  }
});


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