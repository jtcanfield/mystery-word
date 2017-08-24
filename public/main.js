//When game is over, The Below fills in the missing letters
var word = document.querySelector('h2');
if (word){
  var wordcontent = document.querySelector('h2').textContent.split(" ");
  var wordarray = [];
  wordcontent.map((x) => {
    if (x.includes("wrong") || x.includes("WRONG")){
      wordarray.push("<span style='color:red;'> "+x[5]+" </span>");
    } else {
      wordarray.push(" "+x+" ");
    }
  });
  word.innerHTML = wordarray.join('\u0020');
}
//Automatically focuses the text to the first input
var textFocus = document.querySelector('input');
if (textFocus !== null){
  textFocus.focus();
}
//keeps track of time on client side
var timekeeper = document.getElementById('timekeeper');
if (timekeeper){
  function timerBeginCount(){
    var timeTaken = Number(timekeeper.value);
    x = setInterval(function() {
      timeTaken += 1000;
      document.getElementById('timekeeper').value = timeTaken;
      var mins = Math.floor((timeTaken % (1000 * 60 * 60)) / (1000 * 60));
      var secs = Math.floor((timeTaken % (1000 * 60)) / 1000);
      finalTime = mins + "m " + secs + "s ";
      console.log(finalTime);
    }, 1000);
  };
  timerBeginCount();
}
//Edits URL to prevent incorrect refresh
if (window.location.pathname === "/startgamehard" || window.location.pathname === "/startgamemedium" ||  window.location.pathname === "/startgameeasy" ||  window.location.pathname === "/submitletter"){
  window.history.pushState("", "", '/');
}
