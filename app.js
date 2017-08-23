const express = require('express');
const path = require('path');
const mustache = require('mustache-express');
const bodyParser = require('body-parser');
const app = express();
const file = './data.json';
const fs = require('fs');
// const main = require("./public/main.js");
// const todosArray = ["Wash the car"];
app.engine('mustache', mustache());
app.set('view engine', 'mustache');
app.set('views', './views');
app.use(express.static(path.join(__dirname, 'public')));

// Set app to use bodyParser()` middleware.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text());

//This is the initial rendering, saying to use index.mustache, and declares todosMustache
app.get("/", function (req, res) {
  fs.readFile('data.json', 'utf8', function readFileCallback(err, data){
      if (err){
          console.log(err);
      } else {
      obj = JSON.parse(data);
      var arrayfile = obj.todoArray;
      var done = obj.doneArray
      // this makes todosMustache the arrayfile that was just downloaded
      res.render('index', { todosMustache: arrayfile,  doneMustache: done});
  }});
  // This will make todosMustache the todosArray
  // res.render('index', { todosMustache: todosArray });
});

//This means that every time method="post" is called on action="/", it will add to the array and redirect the user
app.post("/", function (req, res) {
  var addtolist = req.body.inputtodo
  // todosArray.push(addtolist);
  fs.readFile('data.json', 'utf8', function readFileCallback(err, data){
      if (err){
          console.log(err);
      } else {
      obj = JSON.parse(data); //now it an object
      obj.todoArray.push(addtolist); //add some data
      json = JSON.stringify(obj); //convert it back to json
      fs.writeFile('data.json', json, 'utf8'); // write it back
  }});
  res.redirect('/');
});


app.post("/:dynamic", function (req, res) {
  console.log("Well, that button worked");
  console.log(req.params.dynamic);
  fs.readFile('data.json', 'utf8', function readFileCallback(err, data){
      if (err){
          console.log(err);
      } else {
      obj = JSON.parse(data); //now it an object
      // console.log(obj.todoArray);
            // the code you're looking for
            var needle = 'hi';
            // iterate over each element in the array
            for (var i = 0; i < obj.todoArray.length; i++){
            // look for the entry with a matching `code` value
              if (obj.todoArray[i] === req.params.dynamic){
                // console.log(obj.todoArray[i]);
                 // we found it
                // obj[i].name is the matched result
              }
            }
      // json = JSON.stringify(obj); //convert it back to json
      // fs.writeFile('data.json', json, 'utf8'); // write it back
  }});
  res.redirect('/');
});


app.listen(3000, function () {
  console.log('Hosted on local:3000');
})
