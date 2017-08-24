const path = require('path');
const bodyParser = require('body-parser');
const statsDataFile = require('./stats.json');
const fs = require('fs');

function getStats(username){
  return statsDataFile.users.find(function (user) {
    return user.username.toLowerCase() == username.toLowerCase();
  });
}

function changestats(name, win, loss, wordlength){
    fs.readFile('stats.json', 'utf8', function readFileCallback(err, data){
      if (err){
          console.log(err);
      } else {
        obj = JSON.parse(data);
        console.log(name);
        var userdata = getStats(name);
        console.log(userdata);
        userdata.games += 1;
        userdata.wins += win;
        userdata.losses += loss;
        userdata.wordlengths.push(wordlength);
        userdata.avgwordlength = (userdata.wordlengths.reduce((a,b) => a+b, 0))/userdata.wordlengths.length;
        json = JSON.stringify(obj);
        fs.writeFile('stats.json', json, 'utf8');
    }});
  return
}

module.exports = {
  changestats: changestats
}
