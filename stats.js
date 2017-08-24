const path = require('path');
const bodyParser = require('body-parser');
const statsDataFile = require('./stats.json');
const fs = require('fs');

function changestats(username, win, loss, wordlength){
    fs.readFile('stats.json', 'utf8', function readFileCallback(err, data){
      if (err){
          console.log(err);
      } else {
        obj = JSON.parse(data);
        obj.users.username.wins += win;
        obj.users.username.losses += loss;
        json = JSON.stringify(obj);
        fs.writeFile('stats.json', json, 'utf8');
    }});
  return
}

module.exports = {
  changestats: changestats,
}
