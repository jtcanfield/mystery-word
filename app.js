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
var gameWin = false;
var gameLoss = false;



app.get("/", function (req, res) {
  if (authedUser === ""){res.redirect('/login');return}
  res.render("index", {pregame:"active",username : authedUser});
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
  req.sessionStore.lives = 8;
  gameActive = true;
  console.log(req.sessionStore);
  res.render("index", {game:"active",emptyWord:req.sessionStore.emptyWord, guessed:req.sessionStore.guessed, lives: req.sessionStore.lives, letterstatus:"Go!"});
});

function isLetter(c) {
  return c.toLowerCase() != c.toUpperCase();
};

app.post("/submitletter", function (req, res) {
  if (authedUser === ""){res.redirect('/login');return}
  if (gameActive === false){res.render("index", {username : authedUser});return}
  if (gameActive === true){
    var lettersubmitted = req.body.lettersubmitted.toLowerCase();
    if (isLetter(lettersubmitted) === false){//Input is not a letter
      res.render("index", {game:"active",emptyWord:req.sessionStore.emptyWord, guessed:req.sessionStore.guessed, lives: req.sessionStore.lives, letterstatus:"That is not a letter..."});
      return
    }
    if (req.sessionStore.guessed.indexOf(lettersubmitted) !== -1){
      res.render("index", {game:"active",emptyWord:req.sessionStore.emptyWord, guessed:req.sessionStore.guessed, lives: req.sessionStore.lives, letterstatus:"You Already Guessed That Letter!"});
      return
    }
    req.sessionStore.guessed.push(lettersubmitted);
    if (req.sessionStore.word.indexOf(lettersubmitted) === -1){//Input is not correct
      req.sessionStore.lives -= 1;
      if (req.sessionStore.lives === 0){//Game Loss
        req.sessionStore.emptyWord.map((x, index) =>{//Maps thru word to try and makes letters correct
          if (x === "_"){
            req.sessionStore.emptyWord[index] = "wrong"+req.sessionStore.word[index];
            gameActive = false;
          }
        });
        fs.readFile('stats.json', 'utf8', function readFileCallback(err, data){
          if (err){
              console.log(err);
          } else {
            obj = JSON.parse(data);
            obj.users.push({username: req.body.username, password: req.body.password2, email: req.body.email, wins: "", losses:"", avgwordlength:"", avgtime:""});
            json = JSON.stringify(obj);
            fs.writeFile('stats.json', json, 'utf8');
        }});
        res.render("index", {gamefinal:"active",emptyWord:req.sessionStore.emptyWord, guessed:req.sessionStore.guessed, lives: "Out of lives!", letterstatus:"Wrong!"});
        return
      } else {
        res.render("index", {game:"active",emptyWord:req.sessionStore.emptyWord, guessed:req.sessionStore.guessed, lives: req.sessionStore.lives, letterstatus:"Wrong!"});
      }
      return
    }
    if (req.sessionStore.word.indexOf(lettersubmitted) !== -1){//Input is correct
      req.sessionStore.word.map((x, index) =>{//Maps thru word to try and makes letters correct
        if (x === lettersubmitted){
          req.sessionStore.emptyWord[index] = lettersubmitted;
        }
      });
      gameWin = true;
      req.sessionStore.emptyWord.map((x) =>{
        if (x === "_"){
          gameWin = false;
        }
      });
      if (gameWin === true){//GAME WIN HERE, EDIT INFO, MAKE IT LOOK BETTER
        res.render("index", {username:authedUser});
        return
      } else {
        res.render("index", {game:"active",emptyWord:req.sessionStore.emptyWord, guessed:req.sessionStore.guessed, lives: req.sessionStore.lives, letterstatus:"Nice!"});
      }
    } else {
      console.log("GAME BROKE!");
      console.log(req.sessionStore);
    }
  }
});

app.post("/signup", function (req, res) {
  var validform = true;
  if (req.body.username === undefined || req.body.password1 === undefined || req.body.password2 === undefined){
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
        if (req.body.email === null || req.body.email === undefined){
          obj.users.push({username: req.body.username, password: req.body.password2, email: ""});
        } else {
          obj.users.push({username: req.body.username, password: req.body.password2, email: req.body.email});
        }
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
