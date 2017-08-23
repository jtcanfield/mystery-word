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
  if (authedUser === ""){res.redirect('/login');return}
  res.render("index", {username : authedUser});
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
    res.render("statistics");
    return
  }
  if (authedUser !== ""){
    res.render("statistics", {username:authedUser});
    return
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
  var validform = true;
  if (req.body.username === undefined || req.body.password1 === undefined || req.body.password2 === undefined || req.body.email === undefined){
    res.render('signup', {status:"One field is undefined, please try again using valid characters."});
    return
  }
  if (req.body.password1.length < 4){
    res.render('signup', {status:"Password must have at least 4 characters"});
    return
  }
  if (req.body.password1 !== req.body.password2){
    res.render('signup', {status:"Passwords do not match"});
    return
  }
  if (req.body.username.length < 4){
    res.render('signup', {status:"Username must have at least 4 characters"});
    return
  }
  userDataFile.users.map((x) =>{
    var usernamestring = x.username;
    var emailstring = x.email;
    if (usernamestring.toLowerCase() === req.body.username.toLowerCase()){
      res.render('signup', {status:"Username already exists, choose another user name"});
      validform = false;
      return
    }
    if (emailstring.toLowerCase() === req.body.email.toLowerCase()){
      res.render('signup', {status:"Email already exists. Lost your Username or Password? Email me!"});
      validform = false;
      return
    }
  });
  if (validform === false){return};
  if (validform === true){
    fs.readFile('data.json', 'utf8', function readFileCallback(err, data){
      if (err){
          console.log(err);
      } else {
        obj = JSON.parse(data);
        obj.users.push({username: req.body.username, password: req.body.password2, email: req.body.email, currentword: ""});
        json = JSON.stringify(obj);
        fs.writeFile('data.json', json, 'utf8');
    }});
  }
  authSession = req.body.username;
  res.redirect('/');
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
