const express = require('express');
const path = require('path');
const mustache = require('mustache-express');
const bodyParser = require('body-parser');
const app = express();
const userDataFile = require('./data.json');
const session = require('express-session');
const fs = require('fs');
const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");
app.use(session({ secret: 'this-is-a-secret-token', cookie: { maxAge: 60000, httpOnly: false}}));
const main = require("./public/main.js");
app.engine('mustache', mustache());
app.set('view engine', 'mustache');
app.set('views', './views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text());
function getUser(username){
  return userDataFile.users.find(function (user) {
    return user.username.toLowerCase() == username.toLowerCase();
  });
}
var authedUser = "";




app.get("/", function (req, res) {
  if (authedUser === ""){res.redirect('/login');}
  res.render("index");
});

app.get("/login", function (req, res) {
  authedUser = "";
  res.render("login");
});

app.get("/signup", function (req, res) {
  authedUser = "";
  res.render("signup");
});

app.get("/statistics", function (req, res) {
  if (authedUser === ""){

  }
  if (authedUser !== ""){
    res.render("statistics", {username:authedUser});
  }
});

app.post("/", function (req, res) {
  res.redirect('/');
});

app.post("/login", function (req, res) {
  fs.readFile('data.json', 'utf8', function readFileCallback(err, data){
      if (err){
          console.log(err);
      } else {
      obj = JSON.parse(data);
      var userCheck = getUser(req.body.username);
      if (userCheck !== undefined && req.body.password === userCheck.password){
        authedUser = req.body.username;
        res.redirect("/");
        return
      } else {
        res.render("login", {status:"Incorrect User Id or Password"});
        return
      }
  }});
});
app.post("/signup", function (req, res) {
  res.redirect('/signup');
});


app.post("/logout", function (req, res) {
  authedUser = "";
  res.redirect('/login');
});
app.post("/loginredirect", function (req, res) {
  authedUser = "";
  res.redirect('/login');
});
app.post("/signupredirect", function (req, res) {
  authedUser = "";
  res.redirect('/signup');
});
app.post("/statisticsredirect", function (req, res) {
  res.redirect('/statistics');
});
app.get("/:dynamic", function (req, res) {
  console.log("DYNAMIC TRIGGERED:")
  console.log(req.params.dynamic);
  res.redirect('/');
});

app.listen(3000, function () {
  console.log('Hosted on local:3000');
})
