/*
Author: Bella Salter
Purpose: To be used with explore.html for FormU.
*/
var userId = "";
var user = "";

/*
Loading MathJax
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
Checks user auth and adds necessary event listeners.
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

    document.getElementById("searchButton").addEventListener("click", async () => {
        var results = await search();
    })
    document.getElementById("search").addEventListener("keypress", async function(e) {
        if(e.keyCode == 13) {
            await search();
        }
    });
}

/*
Does the search function with the current value of the search bar.
To be called when event listeners for search triggered.
*/
async function search() {
    var content = document.getElementById("content");
    var searchTerm = document.getElementById("search").value;
    content.innerHTML = 
    `
    <h3 id="bigTitle">Search</h3>
            <div id="searchWrapper">
                <input type="text" id="search" placeholder="Search">
                <a id="searchButton" ><span class="material-symbols-outlined">search</span></a>
            </div>
    `;
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
    document.getElementById("searchButton").addEventListener("click", async() => {
        await search();
    });
    document.getElementById("search").addEventListener("keypress", async function(e) {
        if(e.keyCode == 13) {
            await search();
        }
    });
    //console.log(response);
}

/*
Formats a dictionary to be easily used from the response from a search request.
*/
function createSearchDict(response) {
    var retDict = {};
    console.log(response);
    for(var formula of response) {
        var mine = (formula.user_id == userId);
        retDict[`${formula._id}`] = [`${formula.raw_latex}`, `${formula.name}`, `${formula.tags}`, mine];
    }
    return retDict;
}

/*
Shows the input dictionary on the page.
*/
function showDict(latexDict) {
    var contentDiv = document.getElementById("content");
    for (var fn of Object.keys(latexDict)) {
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
      contentDiv.innerHTML = contentDiv.innerHTML + newElement;
      MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
    }
}

/*
Adds the necessary listeners to buttons on the page, depending on whether or not it is one of the
current user's functions.
*/
function addListenersToButtons() {
    var buttons = document.getElementsByClassName("viewEdit");
    for (const b of buttons) {
     //console.log(b.id.includes("other"));
     b.addEventListener('click', async () => {
       //console.log("CLICKED!");
       if(b.id.includes("other")) {
           //console.log("o");
           addToAccount(b);
       } else {
           //console.log("yo");
           editClicked(b);
       }
    });
    }
}

/*
Adds the function to the current account. 
Called from the Save button on a function not owned by the current user.
*/
async function addToAccount(b) {
    var fnIdStart = b.id.indexOf("_");
    var fnId = b.id.substring(fnIdStart+1, b.id.length);
    console.log(`Adding ${fnId}`);
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
      var req2 = {
        form_id : response._id
      };
      var response2 = await fetch(`/user/${userId}/save`, {
        method : "PATCH",
        headers:{"Content-Type": "application/json"},
        body:JSON.stringify(req2)
      });
    
}

/*
Goes to the page to edit the function.
To be called from the edit buttons
*/
function editClicked(calledFrom) {
    var function_id = calledFrom.id;
    console.log(function_id);
    window.location.replace("/formula.html" + `?id=${function_id}`);
    formula_contents = formula_contents[`${function_id}`]
  }