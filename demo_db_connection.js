
//------Input Text Box Variable---------------------------------//


// var express = require('express'); 
// var app = express(); 
// app.get('/myform', function(req, res){ 
//     var myText = req.query.mytext; //mytext is the name of your input box
//     res.send('Your Text:' +myText); 
//     console.log(myText);
// }); 
// console.log(myText);
// app.listen(3000)

//-------------------------readline-sync--------------------------//

var readline = require('readline-sync');

var inputText = readline.question("Enter your input text: ");

//console.log(inputText)


//-----------------------DB connection--------------------------//

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "amicus1994",
  database: "sports"
});
con.connect(function (err) {
  if (err) throw err;
  console.log("DB Connected!");
})

//-------------------------Natural Language API-------------------//

var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
var naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
  version: '2018-11-16',
  iam_apikey: 'PqrFNV8qW4Q1MsF8jA3QinxokKzI2QuEaejCXdYfNuW4',
  url: 'https://gateway.watsonplatform.net/natural-language-understanding/api'
});

var parameters = {
  'text': inputText,
  'features': {
    'keywords': {
      'sentiment': true,
      'emotion': true,
      'limit': 3
    }
  }
};

var words = [];
naturalLanguageUnderstanding.analyze(parameters, function (err, response) {
  if (err)
    console.log('error:', err);
  else {
    for (var i = 0; i < response.keywords.length; i++) {
      words[i] = JSON.stringify(response.keywords[i].text);
      console.log(words[i]);
    }
    var players = false;
    var team = false;
    var goals = false;
    var National_Stadium = false;
    var Stadion_Miejsiki = false;
    var efficient_player=false;
    for (var i = 0; i < words.length; i++) {
      if (words[i] == '"players"')
        var players = true;
      if (words[i] == '"team"')
        var team = true;
      if (words[i] == '"goals"')
        var goals = true;
      if (words[i] == '"National Stadium"')
        var National_Stadium = true;
      if (words[i] == '"Stadion Miejski"')
        var Stadion_Miejsiki = true;
      if (words[i]== '"efficient player"')
        var efficient_player=true;
    }
    if (efficient_player == true) {
      var sql1 = "select player from goal where gtime=(select min(gtime) from goal)";
      con.query(sql1, function (err, result) {
        if (err) throw err;
        console.log(result)
      })
    }
    else if (players == true && team == true && goals == true) {
      var sql1 = "SELECT player, teamid, COUNT(*) FROM game JOIN goal ON League = id WHERE (team1 = 'GRE' OR team2 = 'GRE') AND teamid != 'GRE' GROUP BY player, teamid";
      con.query(sql1, function (err, result) {
        if (err) throw err;
        console.log(result)
      })
    }
    else if (National_Stadium == true && players == true && team == true) {
      var sql1 = "SELECT DISTINCT player, teamid FROM game JOIN goal ON League= id WHERE stadium = 'National Stadium, Warsaw' AND (team1 = 'POL' OR team2 = 'POL') AND teamid != 'POL'";
      con.query(sql1, function (err, result) {
        if (err) throw err;
        console.log(result)
      })
    }
    else if (Stadion_Miejsiki == true && players == true && team == true) {
      var sql1 = "SELECT DISTINCT player, teamid, gtime FROM game JOIN goal ON League = id WHERE stadium = 'Stadion Miejski (Wroclaw)' AND (( teamid = team2 AND team1 != 'ITA') OR ( teamid = team1 AND team2 != 'ITA'))";
      con.query(sql1, function (err, result) {
        if (err) throw err;
        console.log(result)
      })
    }
  }
}
);



