const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser')
const session = require('express-session');
var cookieParser=require("cookie-parser");
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost';
const fs = require('fs');

const app = express();

const port = 6789;

app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static('public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()) 
app.use(session({ resave: false ,secret: '123456' , saveUninitialized: true, cookie: { secure: !true}}));
app.get('/', (req, res) =>  res.render('index', {utilizator: req.session.utilizator}));
app.get('/programari', (req, res) => {
    res.render('programari', {programari: req.session.programari, utilizator: req.session.utilizator});
    console.log(req.session.programari)
});
app.get('/logare', (req, res) => {	
	res.render('logare',{mesaj: req.cookies.mesaj, utilizator: req.session.utilizator});
});
app.get('/programare-noua', (req, res) => {	
	res.render('programare-noua',{utilizator: req.session.utilizator});
});
app.post('/programari', (req, res) => {
    /*fs.readFile('utilizatori.json', (err, data) => {
		if (err) throw err;
        const listaUtilizatori = JSON.parse(data);
        for(var i=0;i<Object.keys(listaUtilizatori.utilizatori).length;i++)
        {
            if(listaUtilizatori.utilizatori[i].username==req.session.utilizator)
                listaUtilizatori.utilizatori[i].programari.push({"data":req.body.data, "stare":"in asteptare"})
        }
        let json = JSON.stringify(listaUtilizatori);
                fs.writeFile('utilizatori.json', json);
    })*/
    MongoClient.connect(url, function(err, client) {
        var db = client.db('db');
        var programari_client=db.collection('programari').findOne({username: req.session.utilizator})
        console.log('acestea is: '+programari_client)
        programari_client.push({"data":req.body.data, "stare":"in asteptare"})
        db.collection('programari').updateOne({
            username: req.session.utilizator
        }, {
            $set: {
                programari: programari_client.programari
            }
        });
        client.close();
    });
    req.session.programari=programari_client
    res.render('programari', {programari: req.session.programari, utilizator: req.session.utilizator});
    console.log(req.session.programari)
});
app.post('/verificare-logare', (req, res) => {	
    var ok=0;
    MongoClient.connect(url, function(err, client) {
        var db = client.db('db');
        if(db.collection('users').find({username: req.body.user, password: req.body.pass})!=null)
        {
            console.log("am gasit")
            res.cookie('mesaj','',{expires: new Date(1999,1,1)})
            req.session.utilizator=req.body.user;
            var element=db.collection('programari').find({username: req.body.user})
            req.session.programari=element.programari
            ok=1;
            client.close();
            res.redirect('http://localhost:6789/')
        }
        if(ok==0)
	{
        console.log("am intrat si aici")
		req.session.destroy((err) => {
			if(err) {
				return console.log(err);
			}});
		res.cookie('mesaj','Utilizator sau parola gresite', {expires: new Date(360000 + Date.now())})
		res.redirect('http://localhost:6789/logare')
	}
    });
	/*fs.readFile('utilizatori.json', (err, data) => {
		if (err) throw err;
		const listaUtilizatori = JSON.parse(data).utilizatori;
		listaUtilizatori.forEach(element => {
			if(req.body.user==element.username&&req.body.pass==element.parola)
	{
		res.cookie('mesaj','',{expires: new Date(1999,1,1)})
        req.session.utilizator=req.body.user;
        req.session.programari=element.programari
		ok=1;
		res.redirect('http://localhost:6789/')
    }
});*/
	
});
	


app.listen(port, () => console.log(`Serverul rulează la adresa http://localhost:`));