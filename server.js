const fs = require("fs");
const path = require("path");
const walkdir = require("walkdir");
const express = require('express');
const bodyparser = require("body-parser");
const app = express();
const mime = require("mime");
const port = 8000;

app.use(bodyparser.raw({type:"*/*"}));
app.use('/', function (req, res) {
    console.log(req.method, req.path);
    var reqpath = path.join(__dirname, req.path);
    if(req.method=="GET") {
        if(fs.existsSync(reqpath)) {
          if(fs.statSync(reqpath).isDirectory()) {
            var files = walkdir.sync(reqpath).map(function(f) {
              return f.substr(reqpath.length+1);
            }).filter(function(f) {
              return path.basename(f)[0]!="." && !fs.statSync(path.join(reqpath, f)).isDirectory();
            });
            var data = JSON.stringify(files);
            res.setHeader("Content-Length", data.length);
            res.type("application/json");
            res.status(200).send(data);              
          } else {
            var data = fs.readFileSync(reqpath);
            res.setHeader("Content-Length", data.length);
            res.type(mime.getType(reqpath));
            res.status(200).send(data);
          }
        } else
            res.status(404).send("Not found");
    } else if(req.method=="PUT") {
        fs.writeFile(reqpath, req.body, function(err) {
            if(err)
              res.status(400).send(JSON.stringify(err));
            else
              res.status(200).send(`Wrote ${reqpath}\n`);
        });
    }
    else
        res.status(403).send("Forbidden");
});

app.listen(port, function() {
    console.log(`Server listening on port ${port}!`);
});