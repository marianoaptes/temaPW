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
app.get('/', (req, res) =>  {
    res.render('index',{utilizator: req.session.utilizator});
});
app.get('/programari', (req, res) => {
    res.render('programari', {programari: req.session.programari, utilizator: req.session.utilizator});
});
app.get('/contact', (req, res) =>  {
    res.render('contact',{utilizator: req.session.utilizator});
});
app.get('/video', (req, res) =>  {
    res.render('video',{utilizator: req.session.utilizator});
});
app.get('/logare', (req, res) => {	
	res.render('logare',{mesaj: req.cookies.mesaj, utilizator: req.session.utilizator});
});
app.get('/programare-noua', (req, res) => {	
	res.render('programare-noua',{utilizator: req.session.utilizator});
});
app.post('/schimba-programare', (req, res) => {
    console.log("aici")
    modify_prog(req,res);
});
app.post('/programari', (req, res) => {
    add_prog(req,res);
});
app.post('/verificare-logare', (req, res) => {	
    retrive_progs(req,res);
    });
app.get('/admin', (req,res) => {
    retrive_users(req,res);
});
app.get('/servicii', (req,res) =>{
    fs.readFile('servicii.json', (err, data) => {
        if (err) throw err;
        const listaServicii = JSON.parse(data);
        res.render('servicii',{servicii: listaServicii.servicii, utilizator: req.session.utilizator});
})});  
async function modify_prog(req, res)
{
    var user=req.body.username
    var de_schimbat=req.body.programare
    var action=req.body.schimba
    console.log(action)
    var programari_client=[]
    await MongoClient.connect(url, async function(err, client) {
        var db = client.db('db');
        await db.collection('programari').find({username: user}).toArray(async function(err,docs)
        {
            if(docs[0]!=undefined){
            programari_client=docs[0]['programari'];
            for(var i=0;i<Object.keys(programari_client).length;i++)
            {
                if(de_schimbat==programari_client[i].data){
                    if(action=="confirm") programari_client[i].stare="confirmata";
                    if(action=="delete") 
                    {
                        if(Object.keys(programari_client).length==1)
                            programari_client=[];
                        else
                            programari_client=programari_client.splice(i, 1)
                    }
                }
            }}
        }); 
        client.close();
    });
    await MongoClient.connect(url, async function(err, client) {
        var db = client.db('db');
        await db.collection('programari').updateOne({
            username: user
        }, {
            $set: {
            programari: programari_client
            }
        }); 
        req.session.programari=programari_client
        user='admin'
        client.close(); 
    });   
}
/*async function confirm_prog(req, res)
{
    var user=req.body.username
    var de_inlocuit=req.body.programare
    console.log(de_inlocuit)
    var programari_client=[]
    await MongoClient.connect(url, async function(err, client) {
        var db = client.db('db');
        await db.collection('programari').find({username: user}).toArray(async function(err,docs)
        {
            if(docs[0]!=undefined){
            programari_client=docs[0]['programari'];
            for(var i=0;i<Object.keys(programari_client).length;i++)
            {
                if(de_inlocuit==programari_client[i].data)
                    programari_client[i].stare="confirmata";
            }
            }
        }); 
        client.close();
    });
    await MongoClient.connect(url, async function(err, client) {
        var db = client.db('db');
        await db.collection('programari').updateOne({
            username: user
        }, {
            $set: {
            programari: programari_client
            }
        }); 
        req.session.programari=programari_client
        user='admin'
        console.log(programari_client)
        client.close(); 
    });   
}*/
async function add_prog(req, res)
{
    var user=req.session.utilizator
    var pass=req.session.parola
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
                var ok=0;
            await db.collection('users').find({username:req.body.user, password:req.body.pass}).toArray(function(err,docs)
            {
                if(docs[0]!=undefined){
                    ok=1;
                }
            });
            await db.collection('programari').find({username:req.body.user}).toArray(function(err,docs){
                if(docs[0]!=undefined&&ok){
                    req.session.programari=docs[0]['programari'];
                    res.redirect('http://localhost:6789/') 
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
       
app.listen(port, () => console.log(`Serverul rulează la adresa http://localhost:`));