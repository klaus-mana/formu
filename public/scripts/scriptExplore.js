
var userId = "64521db0f1028b25ce6aa424";

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
    console.log(response);
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
      console.log(fn);
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
                    <p class="formName">${current[1]}</p><p class="tag">#${current[2]}</p>
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
     var buttons = document.getElementsByClassName("viewEdit");
     for (const b of buttons) {
      console.log(b);
      b.addEventListener('click', event => {
        if(b.id.contains("other")) {
            addToAccount(b);
        } else {
            editClicked(b);
        }
    }
      );
     }
}

function addToAccount(b) {
    
}