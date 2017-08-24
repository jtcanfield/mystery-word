const path = require('path');
const bodyParser = require('body-parser');
const statsDataFile = require('./stats.json');
const fs = require('fs');

function getStats(name){
  var index = 0;
  statsDataFile.users.map((x, idx) =>{
    if (x.username.toLowerCase() === name.toLowerCase()){
      index = idx;
      return
    }
  });
  return index
}

function changestats(name, win, loss, word, wordlength, time){
    fs.readFile('stats.json', 'utf8', function readFileCallback(err, data){
      if (err){
          console.log(err);
      } else {
        obj = JSON.parse(data);
        var userdata = obj.users[getStats(name)];
        userdata.games = Number(userdata.games)+ 1;
        userdata.wins = Number(userdata.wins)+Number(win);
        userdata.losses = Number(userdata.losses)+Number(loss);
        userdata.words.push(word.join(""));
        userdata.wordlengths.push(wordlength);
        userdata.avgwordlength = (userdata.wordlengths.reduce((a,b) => a+b, 0))/userdata.wordlengths.length;
        userdata.times.push(time);
        userdata.avgtime = (userdata.times.reduce((a,b) => a+b, 0))/userdata.times.length;
        json = JSON.stringify(obj);
        fs.writeFile('stats.json', json, 'utf8');
    }});
  return
}

module.exports = {
  changestats: changestats
}
