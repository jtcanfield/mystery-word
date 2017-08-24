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
var textFocus = document.querySelector('input');
if (textFocus !== null){
  textFocus.focus();
}
