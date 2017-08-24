const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const userDataFile = require('./data.json');

function getUser(username){
  return userDataFile.users.find(function (user) {
    return user.username.toLowerCase() == username.toLowerCase();
  });
}

var checkLogin = function (usrname, pass, callback){
  fs.readFile('data.json', 'utf8', function(err, data){
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

var checkExistingUsers = function(username, email, callback){
  userDataFile.users.map((x) =>{
    if (x.username.toLowerCase() === username){
      callback(true, "Username already exists, choose another user name");
      return
    }
    if (x.email.toLowerCase() === email){
      callback(true, "Email already exists. Lost your Username or Password? Email me!");
      return
    }
  });
}

var addUser = function(newusername, newpassword, newemail, callback){
  fs.readFile('data.json', 'utf8', function(err, data){
    if (err){
        console.log(err);
    } else {
      obj = JSON.parse(data);
      obj.users.push({username: newusername, password: newpassword, email: newemail});
      json = JSON.stringify(obj);
      fs.writeFile('data.json', json, 'utf8');
    }
  });
  callback();
}

module.exports = {
  userObjectPull:getUser,
  checkLogin:checkLogin,
  checkExistingUsers:checkExistingUsers,
  addUser:addUser
}
