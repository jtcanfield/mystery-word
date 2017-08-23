const express = require('express');
const path = require('path');
const mustache = require('mustache-express');
const bodyParser = require('body-parser');
const app = express();
const file = './data.json';
const session = require('express-session');
const fs = require('fs');
const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");
app.use(session({ secret: 'this-is-a-secret-token', cookie: { maxAge: 60000, httpOnly: false}}));
const main = require("./public/main.js");
app.engine('mustache', mustache());
app.set('view engine', 'mustache');
app.set('views', './views');
app.use(express.static(path.join(__dirname, 'public')));

// Set app to use bodyParser()` middleware.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text());


app.get("/", function (req, res) {
});

app.post("/", function (req, res) {
  res.redirect('/');
});


app.post("/:dynamic", function (req, res) {
  console.log("Well, that button worked");
  console.log(req.params.dynamic);
  res.redirect('/');
});


app.listen(3000, function () {
  console.log('Hosted on local:3000');
})
