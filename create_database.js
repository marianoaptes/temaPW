/*var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost';

MongoClient.connect(url, function(err, client) {
  var db = client.db('db');
  var doc = db.collection('programari').find({username:"maria.noaptes"});
  if(doc!=null)
      console.log(doc);
  client.close();
}); /*
MongoClient.connect(url, async function(err, client) {
  var db = client.db('db');
  db.collection('programari').updateOne({
      username: 'maria.noaptes'
  }, {
      $set: {
          programari: [{'data':'12.03.2018','stare':'in asteptare'}]
      }
  });
  client.close();
});*/
/*
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost';

MongoClient.connect(url, function(err, client) {
  var db = client.db('db');
    var cursor = db.collection('programari').find();

    cursor.each(function(err, doc) {

        console.log(doc);

    });
}); */

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost';
MongoClient.connect(url,function(err, client) {
  var db = client.db('db');
  db.collection('programari').deleteOne({
      username: 'alexandra'
  });
  db.collection('users').deleteOne({
    username: 'alexandra'
});
  client.close();
});