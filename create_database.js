var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost';

MongoClient.connect(url, function(err, client) {
  var db = client.db('db');
  db.collection('users').insertOne({
    username: "admin",
    password: "admin"
});
  db.collection('users').insertOne({
  username: "maria.noaptes",
  password: "mnoaptes",
  varsta:"21",
  ocupatie:"student"
});
  db.collection('users').insertOne({
  username: "alin34",
  password: "alin34",
  varsta:"36",
  ocupatie:"youtuber"
});
  db.collection("programari").insertOne({
    username: "maria.noaptes",
    programari:[{"data":"16.02.2020", "stare": "efectuata"}]
  })
  db.collection("programari").insertOne({
    username: "alin34",
    programari:[{"data":"12.05.2020", "stare": "in asteptare"}]
  })
  console.log(db.collection('users').find());
  console.log(db.collection('programari').find());
  client.close();
}); 