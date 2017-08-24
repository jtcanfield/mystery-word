if (document.querySelector('h2')){
  var word = document.querySelector('h2').textContent.split(" ");
  var wordarray = [];
  word.map((x) => {
    if (x.includes("wrong") || x.includes("WRONG")){
      wordarray.push("<span style='color:red;'>"+x[5]+"</span>");
    } else {
      wordarray.push(x);
    }
    console.log(wordarray);
  });
}
var textFocus = document.querySelector('input');
if (textFocus !== null){
  textFocus.focus();
}
