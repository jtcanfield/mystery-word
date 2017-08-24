const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const express = require("express");
const router = express.Router();
const userDataFile = require('./data.json');

function getUser(username){
  return userDataFile.users.find(function (user) {
    return user.username.toLowerCase() == username.toLowerCase();
  });
}

var checkLogin = function (usrname, pass, callback){
  fs.readFile('data.json', 'utf8', function (err, data){
    if (err){
        console.log(err);
    } else {
    obj = JSON.parse(data);
    var userCheck = getUser(usrname);
      if (userCheck !== undefined && pass === userCheck.password){
        callback(true);
        return
      } else {
        callback(false);
        return
      }
    }
  });
}

function checkSignUp(username, email){
  var toreturn = 0;
  userDataFile.users.map((x) =>{
    var usernamestring = x.username.toLowerCase();
    var emailstring = x.email.toLowerCase();
    if (usernamestring === username){
      res.render('signup', {status:"Username already exists, choose another user name"});
      toreturn = 1;
      return
    }
    if (emailstring === email){
      res.render('signup', {status:"Email already exists. Lost your Username or Password? Email me!"});
      toreturn = 2;
      return
    }
  });
  return toreturn
}

module.exports = {
  userObjectPull:getUser,
  checkLogin:checkLogin,
  checkSignUp:checkSignUp
}
