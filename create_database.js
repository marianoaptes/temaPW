var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost';

MongoClient.connect(url, function(err, client) {
  var db = client.db('db');
  var doc = db.collection('programari').findOne({username:"alin34"});
  console.log(doc)
  if(doc!=null)
      console.log(doc['programari']);

  client.close();
}); 