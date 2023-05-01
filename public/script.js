active_div = null;
active_div_orig = null;
active_button = null;

function get_recents() {

}

function get_all() {
    
}

function goToViewAll() {
  window.location.replace("/dashboard-full.html");
}
function editFunction(calledFrom) {
  console.log("YO");
  var eqn = document.getElementById("equation");
  console.log(eqn);

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