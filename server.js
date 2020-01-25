'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var dns = require('dns');
var bodyParser = require('body-parser');
var cors = require('cors');

process.env.MONGO_URI="mongodb+srv://franciscotov:real2479@cluster0-4vicv.mongodb.net/test?retryWrites=true&w=majority";
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true});
var Schema = mongoose.Schema;//useNewUrlParser: true, useUnifiedTopology: true
var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);//

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}))

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
const options = {
  //all: true;
  family: 6,
  hints: dns.ADDRCONFIG | dns.V4MAPPED,
};
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

const urlSchema= new Schema({
  original_url: String,
  short_url: Number,
});

mongoose.set('useFindAndModify', false);//
const Url = mongoose.model("Url", urlSchema); 

/*
app.route('/api/shorturl/new').post((req,res, next)=>{
  var firstName = req.body.url;
  //var ip= req.ip;
  res.json({name:'hdhshd'+ firstName+''});
  next();
})
*/

//dns.resolve('google.com', (error, addresses) => { console.error(error); console.log(addresses); });
options.all = true;
//console.log("hola");
// your first API endpoint...
var urlErr = false;
 app.post("/api/shorturl/new", function (req, res){
  var host = req.body.url;
  host= host.toString();//
  Url.findOne({original_url: 'patron_url'}, (err, data) =>{
    if(err) console.error(err);
    if(!data){
      var patronUrl = new Url({original_url: 'patron_url', short_url: 1});
      patronUrl.save(function(err, data){
      if(err) return console.error(err);
        console.log(data);
        //done(null, data)
      });
    }
  });
  options.all = true;
  dns.lookup(host, (err, addresses)=> {
    if(err && err.code === 'ENOTFOUND'){
      urlErr= true;
      console.log('holaa')
      res.json({error: "invalid URL"});
    }
    
    else{
      Url.findOne({original_url: host}, (err, data) =>{
        if(err) console.error(err);
        //console.log(data);
        if(data){
          res.json({original_url: host, short_url: data.short_url});
        }//
        else{
          Url.findOne({original_url: 'patron_url'}, (err, data)=>{
            if(err) console.error(err);
            if(data){
              var newUrl= new Url({original_url: host, short_url: data.short_url});
              newUrl.save(function(err, data){
                if(err) return console.error(err);
                console.log(data)
                //done(null, data)
              });
              Url.findOneAndUpdate({original_url: 'patron_url'},{short_url: data.short_url+1},{new: true}, (err, data)=>{
                if(err) {console.error(err)}
                console.log(data);
              });
            }
          })
        }
      })
      //Url.findOne({short_url: 29}, (err, data)=>{
       // if(err) console.error(err);
       // console.log(data);
      //})
    }
    //console.log(consulta);//
    console.error(err);
  });
  
});
app.get('/api/shorturl/:new?', (req,res, next)=>{
  var urlShorted = req.params.new;
  Url.findOne({short_url: Number(urlShorted)}, (err, data) =>{
    if(err) console.error(err);
    console.log(data);
    //res.json(data);
    res.redirect('http://'+data.original_url);
    next();
  });
});

//
app.listen(port, function () {
  console.log('Node.js listening ...');
});