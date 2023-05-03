
var userId = "6452ad4081ca31753412925d";
var user = "bt2";

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

window.onload = async function () {
    document.getElementById("searchButton").addEventListener("click", async () => {
        var results = await search();
    })
}

async function search() {
    var content = document.getElementById("content");
    var searchTerm = document.getElementById("search").value;
    console.log(`Searching for ${searchTerm}.`)
    var reqBody = {
        term : searchTerm
    }
    var response = await(await fetch(`/formula/search/${searchTerm}`, {
            method:"GET",
        })).json();
    var new_HTML = "";
    console.log(response);
    if(response.length == 0) {
        new_HTML = 
        `
        <p>No results found.</p>
        `
    } else {
        showDict(createSearchDict(response));
    }
    content.innerHTML = content.innerHTML + new_HTML;
    addListenersToButtons();
    //console.log(response);
}

function createSearchDict(response) {
    var retDict = {};
    for(var formula of response) {
        var mine = (formula.user_id == userId);
        retDict[`${formula._id}`] = [`${formula.raw_latex}`, `${formula.name}`, `${formula.tags}`, mine];
    }
    return retDict;
}

function showDict(latexDict) {
    //temporary
    //console.log("showing");
    var contentDiv = document.getElementById("content");
    /*console.log(latexDict);*/
    for (var fn of Object.keys(latexDict)) {
      //console.log(fn);
      var current = latexDict[fn];
      var thisDiv = document.createElement("div");
      thisDiv.setAttribute("class", "function");
      if(current[3]) {
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
      } else {
        var newElement = `
        <div class="function" id="div_${fn}">
                    <div class="titleWrapper">
                    <p class="formName" id="name_${fn}">${current[1]}</p><p class="tag">#${current[2]}</p>
                    </div>
                    <span class="mathSpan">
                        <p class="math" id="math_${fn}">${current[0]}</p>
                    </span>
                    <button class="viewEdit" id="other_${fn}">Save</button>
                    <hr>
        </div>
      `;
      }
      /*
      console.log(newElement);*/
      contentDiv.innerHTML = contentDiv.innerHTML + newElement;
      //var buttonElement = document.getElementById(`${fn}`)
      MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
    }
}

function addListenersToButtons() {
    var buttons = document.getElementsByClassName("viewEdit");
    for (const b of buttons) {
     console.log(b.id.includes("other"));
     b.addEventListener('click', async () => {
       console.log("CLICKED!");
       if(b.id.includes("other")) {
           console.log("o");
           addToAccount(b);
       } else {
           console.log("yo");
           editClicked(b);
       }
    });
    }
}
async function addToAccount(b) {
    var fnIdStart = b.indexOf("_");
    var fnId = b.substring(fnIdStart+1, b.size());
    var otherUserId = "6452ad4081ca31753412925d";
    var response = await(await fetch(`/formula/${fnId}`, {
        method:"GET"
      })).json();
    var reqBody = {
        user_id: userId,
        raw_latex: response.raw_latex,
        name: response.name,
        tags: response.tags,
        description: response.description,
        username: user
    }
    var response = await(await fetch("/formula/create", {
        method:"POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(reqBody)
      })).json();
    console.log(response);
}


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