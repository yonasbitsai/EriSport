const express = require('express');
const fs = require("fs");
const { Buffer } = require("buffer");
const path = require('path')
var bodyParser = require('body-parser');
const handlebars = require('express-handlebars');
const formidableMiddleware = require('express-formidable');
const db = require('./sqlite.js');

const app = express();
app.use(formidableMiddleware({
    multiples: true
  }));

app.use('/static', express.static(path.join(__dirname, 'public')))

app.set('view engine', 'hbs');
app.engine( 'hbs', handlebars.engine( {
    extname: 'hbs',
    defaultView: 'index',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials/'
  }));
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var hbs = handlebars.create({});
hbs.handlebars.registerHelper("counter", function (index){
    return index + 1;
});

app.get('/', async (req, res) => {
    res.render("index.hbs", {'pageTitle': "Eritrean Sport Federation in North America"});
});

app.get('/registration/:id', async (req, res) => {
    var SN = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
    res.render("registrationForm.hbs", {'pageTitle': "Eritrean Sport Federation in North America",
                                    'SN': SN, 'id': req.params.id});
});

app.get('/viewteam/:id', async (req, res) => {
    var team = await db.getTeam(req.params.id);
    var members = await db.getMembersByTeam(req.params.id);
    res.render("teamPage.hbs", {'pageTitle': "Eritrean Sport Federation in North America",
                                        'team': team[0],
                                        "members": members,
                                        'id': req.params.id});
});

app.post('/register/:id', async(req, res) => {
    const team = req.fields;
    const photos = req.files;
    for(var i=1; i<=22; i++){
        var firstName = "firstname"+i;
        var lastName = "lastname"+i;
        var photo = "photo"+i;
        var file = req.files[photo];
        if(file.size==0) continue;
        var fileName = req.fields[firstName]+"_"+req.fields[lastName];
        const buffer = fs.readFileSync(file.path);
        team[photo] = buffer.toString('base64');
        var type = file.type.split("/")[1];
        const path = './.data/photos/'+fileName+"."+type;
        fs.writeFile(path, buffer, function(err){
            if(err){
                console.error(err);
            }
        });
    }
    await db.saveTeam(team, req.params.id);
    res.render("confirmation.hbs", {'pageTitle': "Eritrean Sport Federation in North America"});
});


app.listen(3000, () => console.log('Erisport app is listening on port 3000.'));