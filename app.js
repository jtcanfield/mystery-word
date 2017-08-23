const express = require('express');
const path = require('path');
const mustache = require('mustache-express');
const bodyParser = require('body-parser');
const app = express();
const userDataFile = require('./data.json');
const session = require('express-session');
const fs = require('fs');
const wordFile = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");
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
var gameActive = false;
var gameFinish = false;



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

app.post("/startgame:dynamic", function (req, res) {
  if (authedUser === ""){res.redirect('/login');return}
  var arrayOfPossibleWords = [];
  switch (req.params.dynamic) {
    case "easy":
      wordFile.map((x) =>{
        if (x.length >= 4 && x.length <= 6){
          arrayOfPossibleWords.push(x);
        }
      });
      break;
    case "medium":
      wordFile.map((x) =>{
        if (x.length >= 6 && x.length <= 8){
          arrayOfPossibleWords.push(x);
        }
      });
      break;
    case "hard":
      wordFile.map((x) =>{
        if (x.length > 8){
          arrayOfPossibleWords.push(x);
        }
      });
      break;
    default:
  }
  var wordindex = Math.floor(Math.random() * arrayOfPossibleWords.length);
  req.sessionStore.word = [...arrayOfPossibleWords[wordindex]];
  var emptyArray = [];
  req.sessionStore.word.map((x) =>{emptyArray.push("_")});
  req.sessionStore.emptyWord = emptyArray;
  req.sessionStore.guessed = [];
  gameActive = true;
  console.log(req.sessionStore);
  res.render("index", {emptyWord:req.sessionStore.emptyWord});
});

app.post("/submitletter", function (req, res) {
  if (authedUser === ""){res.redirect('/login');return}
  if (gameActive === false){res.render("index", {username : authedUser});return}
  gameFinish = true;
  req.sessionStore.emptyWord.map((x) =>{
    if (x === "_"){
      gameFinish = false;
    }
  });
  if (gameActive === true && gameFinish === false){
    var lettersubmitted = req.body.lettersubmitted.toLowerCase();
    if (req.sessionStore.guessed.indexOf(lettersubmitted) !== -1){
      res.render("index", {emptyWord:req.sessionStore.emptyWord, guessed:req.sessionStore.guessed, letterstatus:"You Already Guessed That Letter!"});
      return
    }
    req.sessionStore.guessed.push(lettersubmitted);
    if (req.sessionStore.word.indexOf(lettersubmitted) !== -1){
      var x = 0;
      while (x < 20){
        if (req.sessionStore.word.indexOf(lettersubmitted) !== -1){
          var indexOfCorrectLetter = req.sessionStore.word.indexOf(lettersubmitted);
          req.sessionStore.emptyWord[indexOfCorrectLetter] = lettersubmitted;
        } else {}
        x++
      }
      res.render("index", {emptyWord:req.sessionStore.emptyWord, guessed:req.sessionStore.guessed, letterstatus:"Nice!"});
      return
    }
    if (req.sessionStore.word.indexOf(lettersubmitted) === -1){
      res.render("index", {emptyWord:req.sessionStore.emptyWord, guessed:req.sessionStore.guessed, letterstatus:"Wrong!"});
      return
    }
    console.log("GAME BROKE!");
    console.log(req.sessionStore);
    return
  }
  if (gameActive === true && gameFinish === true){
    res.render("index", {username:authedUser});
    return
  }
  // res.render("index", {username : authedUser});
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
  authedUser = req.body.username;
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
