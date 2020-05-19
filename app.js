const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser')
const session = require('express-session');
var cookieParser=require("cookie-parser");
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost';
const fs = require('fs');
var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;

var $ = jQuery = require('jquery')(window);
//var $ = require("jquery");
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
    console.log('acestea sunt'+req.session.programari)
    res.render('programari', {programari: req.session.programari, utilizator: req.session.utilizator});
});
app.get('/logare', (req, res) => {	
	res.render('logare',{mesaj: req.cookies.mesaj, utilizator: req.session.utilizator});
});
app.get('/programare-noua', (req, res) => {	
	res.render('programare-noua',{utilizator: req.session.utilizator});
});
app.post('/programari', (req, res) => {
    add_prog(req,res);
});
app.post('/verificare-logare', (req, res) => {	
    retrive_progs(req,res);
    });
app.get('/admin', (req,res)=>{
    retrive_users(req,res);
});
async function add_prog(req, res)
{
    var user=req.session.utilizator
    var programari_client=[]
    await MongoClient.connect(url, async function(err, client) {
        var db = client.db('db');
        await db.collection('programari').find({username: user}).toArray(async function(err,docs)
        {
            if(docs[0]!=undefined){
            programari_client=docs[0]['programari'];
            programari_client=programari_client.concat({"data":req.body.data, "stare":"in asteptare"})
            }
        }); 
        client.close();
    });
    await MongoClient.connect(url, async function(err, client) {
        var db = client.db('db');
        await db.collection('programari').updateOne({
            username: req.session.utilizator
        }, {
            $set: {
            programari: programari_client
            }
        }); 
        req.session.programari=programari_client
        user=req.session.utilizator
        console.log(programari_client)
        res.render('programari', {programari: programari_client, utilizator: user});
        client.close(); 
    });   
}
async function retrive_progs(req,res)
{   
    await MongoClient.connect(url,async function(err, client) {
            var db = client.db('db');
            res.cookie('mesaj','',{expires: new Date(1999,1,1)})
            req.session.utilizator=req.body.user;
            if(req.session.utilizator=="admin")
            {
                res.redirect('http://localhost:6789/admin');
            }else{
            await db.collection('programari').find({username:req.body.user}).toArray(function(err,docs){
                if(docs[0]!=undefined){
                    req.session.programari=docs[0]['programari'];
                    res.redirect('http://localhost:6789/');   
                }else
                {
                    req.session.destroy((err) => {
                        if(err) {
                            return console.log(err);
                        }});
                    res.cookie('mesaj','Utilizator sau parola gresite', {expires: new Date(360000 + Date.now())})
                    res.redirect('http://localhost:6789/logare')
                }
                client.close();  
            });}     
    })};
    async function retrive_users(req,res)
    {   
        await MongoClient.connect(url,async function(err, client) {
                var db = client.db('db');
                res.cookie('mesaj','',{expires: new Date(1999,1,1)})
                await db.collection('programari').find().toArray(function(err,docs){
                    if(docs!=undefined){
                        req.session.users=docs
                    }
                    res.render('admin',{utilizator:'admin',utilizatori:req.session.users});   
                    client.close();  
        });     
        })};
        
       /* $(document).ready(function() {
            $('#confirm').click(function(event) {
                var id  =event.target.id ;
            });
        });*/
        $(document).ready("#confirm").click(function(e) {
              e.preventDefault();
              console.log("ase")
            });
   
       
app.listen(port, () => console.log(`Serverul rulează la adresa http://localhost:`));