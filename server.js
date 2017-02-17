var express = require('express');
var mongo = require("mongodb").MongoClient;
var path = require("path");
var app = express();

app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname+'/index.html'));
})

app.get("/:url",function(req, res){
    
    mongo.connect('mongodb://localhost:27017/urls', function(err, db) {
        if(err) throw err;
        var collection = db.collection("links");
        collection.findOne({
            urlid: req.url.slice(1)
        }, function(err, data){
            if (err) throw err;
            if (data){
                console.log(data.url);
                res.redirect(data.url);
            }
            else {
                res.send({error: "url unknown!"})
            }
        })
    });
});

app.get('/new/:url*', function (req, res) {
    
  var url = req.url.slice(5);
  console.log(url);
  if (validateURL(url)) {
      var short = insert(url);
      var obj = {
          "shortURL": "https://fcc-url-shortener-j4k0b.c9users.io/"+short,
          "originalURL": url
      };
      res.send(obj);
  }
  else {
      res.send("error");
  }
  
});

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});


function insert (url){
    var n = numberGen();
    mongo.connect('mongodb://localhost:27017/urls', function(err, db) {
        if(err) throw err;
        
        var collection = db.collection("links");
        collection.insert({
            urlid: n,
            url: url
        });
        db.close();
    });
    return n;
}
function validateURL(url) {
    // Checks to see if it is an actual url
    // Regex from https://gist.github.com/dperini/729294
    //function from https://github.com/Rafase282/
    var regex = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
    return regex.test(url);
  }
 function numberGen() {
    //function from https://github.com/Rafase282/
    var num = Math.floor(100000 + Math.random() * 900000);
    return num.toString().substring(0, 4);
  }