/////////////////////////////////////////////////////////
//Initialising various modules etc
let bodyParser = require('body-parser');
const express = require('express');
const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
const fetch = require('node-fetch');
const fs = require('fs');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const Parser = require('rss-parser');
let parser = new Parser();
let rssfeed ='';
getrssfeed()



let jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
app.set('superSecret', "secret"); // secret variable
let session = require('express-session');
const all_pokemon = require('./all_pokemon.json');



app.use(session({
    name: 'logincookie',
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

let data = fs.readFileSync('users.json', 'utf8');

let file = JSON.parse(data);

/////////////////////////////////////////////////////////
// Variables containing the html content used for website

let home = '<img src="potd.png" class="ui fluid image" alt="potd image">' +
    '<h1>Today\'s Pokemon of the day:</h1>\n' +
    '<div style="text-align: center;" id="inner_content"></div>';

let pokedex = '<img src="pokedex.png" class="ui fluid image" alt="pokedex image">\n' +
    '<form class="ui form">\n' +
    '<div class="field" id="nameDiv">\n' +
    '<div class="ui search action input" id="pokedexsearch">\n' +
    '<input class="prompt" type="text"  name="name" id="inputval" placeholder="Type a name E.g. \'Pikachu\'">\n' +
    '<button class ="ui button" type="button" onclick="pokeSubmit(jsUcfirst(inputval.value))">Submit</button>\n' +
    '</div>\n' +
    '</div>\n' +
    '\n' +
    '</form>\n' +
    '<div id="inner_content">\n' +
    '</div>\n' +
    '<script>\n' +
    '\n' +
    '$("#choose_search").change(function() {\n' +
    'if ($(this).val() == "id") {\n' +
    '$(\'#idDiv\').show();\n' +
    '} else {\n' +
    '$(\'#idDiv\').hide();\n' +
    '}\n' +
    '\n' +
    'if ($(this).val() == "name") {\n' +
    '$(\'#nameDiv\').show();\n' +
    '} else {\n' +
    '$(\'#nameDiv\').hide();\n' +
    '}\n' +
    '\n' +
    '});\n' +
    '</script>';

let account = '<h1>My Account</h1>\n' +
    '<div class="ui red button" onclick="findfavourites(accountData[\'uname\'],true)">Refresh Your Favourites</div>\n' +
    '<div class="ui segment" style="max-height:375px; overflow: auto">\n' +
    '<div style="text-align: center;" id="inner_content">\n' +
    '\n' +
    '\n' +
    '</div>\n' +
    '\n' +
    '</div>';

let loginPage = '<div class="ui middle aligned center aligned grid">\n' +
    '  <div class="column">\n' +
    '<h2 class="ui red image header">\n' +
    '  <div class="content">\n' +
    'Log-in to your account\n' +
    '  </div>\n' +
    '</h2>\n' +
    '<form class="ui large form">\n' +
    '  <div class="ui stacked segment">\n' +
    '<div class="field">\n' +
    '  <div class="ui left icon input">\n' +
    '<i class="user icon"></i>\n' +
    '<input type="text" id="loginuname" placeholder="Username">\n' +
    '  </div>\n' +
    '</div>\n' +
    '<div class="field">\n' +
    '  <div class="ui left icon input">\n' +
    '<i class="lock icon"></i>\n' +
    '<input type="password" id="loginpassword" placeholder="Password">\n' +
    '  </div>\n' +
    '</div>\n' +
    '<div class="ui fluid large red submit button" onclick="login()" >Login</div>\n' +
    '  </div>\n' +
    '\n' +
    '  <div class="ui error message"></div>\n' +
    '\n' +
    '</form>\n' +
    '\n' +
    '<div class="ui message" >\n' +
    '  New to us? ' +
    '<div id="aBtn" onclick="openform();aFunction()" class="ui red icon button centered"> Sign Up</div>\n' +
    '</div>\n' +
    '<div class="ui message" style="text-align-all: left" >\n' +
    '  Or sign in with Google: ' +
    '<div class="ui fluid g-signin2" id="gsign" data-onsuccess="onSignIn" data-theme="dark" ></div>\n' +
    '</div>\n' +
    '</div>\n' +
    '</div>\n' +
    '<div class="ui basic large modal">\n' +
    '<i class="close icon"></i>\n' +
    '<div class="header">\n' +
    'Sign Up\n' +
    '</div>\n' +
    '<div class="content">\n' +
    '<form class="ui form" id="sign_up_form">\n' +
    '<div class="ui piled segment">\n' +
    '<p style="color:black;"> </p>\n' +
    '<div class="two fields">\n' +
    '<div class="field">\n' +
    '<label>First name</label>\n' +
    '<input placeholder="First Name" name="name" type="text" id="firstname">\n' +
    '</div>\n' +
    '<div class="field">\n' +
    '<label>Surname</label>\n' +
    '<input placeholder="Surname" name="name" type="text" id="surname">\n' +
    '\n' +
    '</div>\n' +
    '\n' +
    '</div>\n' +
    '<div class="field">\n' +
    '<label>Username</label>\n' +
    '<input placeholder="Username" name="username" type="text" id="username">\n' +
    '</div>\n' +
    '<div class="field">\n' +
    '<label>Password</label>\n' +
    '<input type="password" name="password" id="password">\n' +
    '</div>\n' +
    '<div class="ui error message"></div>\n' +
    '</div>\n' +
    '\n' +
    '</div>\n' +
    '<div class="actions">\n' +
    '<div class="two fluid ui inverted buttons">\n' +
    '<div class="ui cancel red basic inverted button">\n' +
    '<i class="remove icon"></i>\n' +
    'Cancel\n' +
    '</div>\n' +
    '<div class="ui ok green basic inverted button">\n' +
    '<i class="checkmark icon"></i>\n' +
    'Submit\n' +
    '</div>\n' +
    '</div>\n' +
    '</div>\n' +
    '</form>\n' +
    '</div>';

let favourites='<img src="userfavs.png" class="ui fluid image" alt="user favourites image">\n'  +
    '<h2>Search a user to see their favourites</h2>\n' +
    '<form class="ui form">\n' +
    '<div class="field" id="nameDiv">\n' +
    '<div class="ui search action input" id="usersearch">\n' +
    '<input class="prompt" type="text"  name="name" id="username" placeholder="Type a user\'s username" >\n' +
    '<button class ="ui button" type="button" onclick="findfavourites(username.value)">Submit</button>\n' +
    '</div>\n' +
    '</div>\n' +
    '\n' +
    '</form>\n' +
    '<br/>\n' +
    '<div class="ui segment" style="max-height:250px; overflow: auto">\n' +
    '<div style="text-align: center; " id="inner_content">\n' +
    '</div>\n'+
    '</div>';


/////////////////////////////////////////////////////////


// checks if a username is already taken, returning true if the user
// name is unavailable
function username_taken(uname) {
    for (let i = 0; i < file['users'].length; i++) {
        if (uname.toLowerCase() === file['users'][i]['uname'].toLowerCase()) {
            return true
        }
    }
    return false
}

// receives sign-up information and, providing username is available, will create new account for the user
app.post('/sign_up_submit',async function (req, resp) {
    const uname = req.body.uname;
    const fname = req.body.fname;
    const sname = req.body.sname;
    const password = req.body.password;
    if (username_taken(uname)) {
        resp.status(409);
        resp.send("error: Sorry that username isn't available, please try another");
    } else {
        createnewuser(uname, fname, sname, password);
        resp.status(200);
        resp.send("You're all signed up ");
    }
});

//used during login to verify supplied username and password match server records (password is checked against stored hash)
 async function login_check(uname, password) {
    let response;
    for (let i = 0; i < file.users.length; i++) {
        if (uname === file.users[i]['uname']) {
            let hash = file.users[i]['password'];
            let check= bcrypt.compareSync(password, hash, function (err, res) {
                return res
            });
            if (check){
                let profile = file.users[i];
                response = JSON.parse(JSON.stringify(profile));
                delete response['password'];

            }

        }
    }

    return response
}


// Signs user in using regular username and password, supplies login token for authenticating certain post methods
app.post('/login', async function (req, resp) {
    const uname = req.body.uname;
    const password = req.body.password;
    let data = await login_check(uname, password);
    if (data) {
        req.session.user = uname;
        let token = jwt.sign(data, app.get('superSecret'), {
            expiresIn: 1440 // expires in 24 hours
        });
        req.session.token = token;
        console.log(req.session.user +' has just signed in!')
        resp.status(200);
    } else {
        resp.status(409);
        data = 'Incorrect credentials';
    }
    resp.send(data)
});


// Signs user in using google, verifying ID using token and returning user's profile
// if user is new, will first create profile before logging in
app.post('/gsignin', async function (req, resp) {
    const gtoken = req.body.idtoken;
    let data = await fetch ('https://oauth2.googleapis.com/tokeninfo?id_token='+gtoken);
    if (data.ok){
        let profile = JSON.parse(await data.text());
        let uname = profile.email
        if (!username_taken(uname)){
            let fname = profile.given_name;
            let sname = profile.family_name;
            let password = null;
            createnewuser(uname,fname,sname,password)
        }
        let payload = finduserprofile(uname)
        req.session.user = uname;
        req.session.token = jwt.sign(payload, app.get('superSecret'), {
            expiresIn: 1440 // expires in 24 hours
        });
        console.log(req.session.user +' has just signed in using Google!')
        resp.status(200);
        resp.send(finduserprofile(uname))
    }else{console.error}
});


// Accesses the pokemon API to obtain information about pokemon based on supplied ID
async function getpokemon(pokeID) {
    try{
        let resp = await fetch("http://pokeapi.co/api/v2/pokemon/" + pokeID);
        if (resp.ok) {
            let text = await resp.text();
            data = JSON.parse(text);

            let pokemon = new Map(); //Empty Map

            if (data.sprites["front_default"] != null) {
                pokemon.Sprite = data.sprites["front_default"]
            } else {
                pokemon.Sprite = 'No sprite is currently available for this pokémon :('
            }
            pokemon.Pokedex_ID = data.id;
            pokemon.Name = data.name;


            if (data.types.length == 2) {
                pokemon.Type_1 = data.types[1]["type"]["name"];
                pokemon.Type_2 = data.types[0]["type"]["name"];
                pokemon.Type_2 = jsUcfirst(pokemon.Type_2);

            } else {
                pokemon.Type_1 = data.types[0]["type"]["name"]
            }
            pokemon.Name = jsUcfirst(pokemon.Name);
            pokemon.Type_1 = jsUcfirst(pokemon.Type_1);


            return (pokemon)
        } else {
            return resp.status
        }
    }catch(error){
        console.log(error)
    }
}

// takes a pokeID (number 1-807) and returns a JSON containing the details of corresponding pokemon
app.get('/pokemon', async function (req, resp) {
    let pokeID = req.query.pokeID;
    if (isNaN(pokeID)) {
        for (let i = 0; i < all_pokemon.length; i++) {
            if (all_pokemon[i]['title'] === pokeID) {
                pokeID = i + 1
            }
        }
    }
    resp.send(await getpokemon(pokeID));
});

// finds today's "pokemon of the day", and returns JSON file with its details
app.get('/potd', async function (req, resp) {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0');
    let yyyy = today.getFullYear();
    today = mm * dd * yyyy;
    let IDotd = today % 807;
    resp.send(await getpokemon(IDotd));
});

// function used to capitalise first character of string (for names etc)
function jsUcfirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// function used to create neww user and save changes to JSON file
async function createnewuser(uname, fname, sname, password) {
    bcrypt.hash(password, saltRounds, function (err, hash) {
        uname = new User(uname, fname, sname, hash);
        file.users.push(uname);
        const json = JSON.stringify(file, null, 2);
        fs.writeFile('users.json', json, 'utf8', function (err) {
            if (err) {
                console.log(err);
            }
        });
    });
}

//class used for creating User entities
class User {
    constructor(uname, fname, sname, password) {
        this.uname = uname;
        this.fname = jsUcfirst(fname);
        this.sname = jsUcfirst(sname);
        this.fullname = this.fname + ' ' + this.sname;
        this.password = password;
        this.favourites = [];
    }
}

//function to add favourite
function addfavourite(uname, pokeID) {
    for (let j = 0; j < file.users.length; j++) {
        if (file.users[j]['uname'] == uname) {
            file.users[j]['favourites'].push(parseInt(pokeID))
            const json = JSON.stringify(file, null, 2);
            fs.writeFile('users.json', json, 'utf8', function (err) {
                if (err) {
                    console.log(err);
                }
            })
            console.log('Added '+pokeID+' to '+uname+'\'s favourites!');
        }
    }
}

//function to remove favourite
function removefavourite(uname,pokeID) {
    for (let j = 0; j < file.users.length; j++) {
        if (file.users[j]['uname'] == uname) {
            for (let i = 0; i < file.users[j].favourites.length; i++) {
                if (file.users[j]['favourites'][i] === parseInt(pokeID)) {
                            file.users[j]['favourites'].splice(i, 1);
                        }
                    }
                    const json = JSON.stringify(file, null, 2);
                    fs.writeFile('users.json', json, 'utf8', function (err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                console.log('Removed '+pokeID+' from '+uname+'\'s favourites!');
                }
            }
}

// fetches RSS feed used in website
async function getrssfeed(){
    try{
        let feed = await parser.parseURL('https://www.pokemon.com/us/pokemon-news/rss');
        feed.reverse;
        rssfeed = '<img src="news.png" class="ui fluid image" alt="news image">\n' +
            '<div class="ui relaxed divided list">';

        feed.items.forEach(item => {

            rssfeed += '  <div class="item">\n' +
                '<div class="content">\n' +
                '  <h5><a href="' + item.link + '">'+ item.title + '</a></h5>\n' +
                '  <div class="description">'+item.contentSnippet+'</div>\n' +
                '</div>\n' +
                '  </div>'

        });
        rssfeed += '</div>';
        return rssfeed
    }
    catch(error){
        console.log(error)
    }
}

// Returns a user profile based on supplied username
function finduserprofile (uname){
    for (let i = 0; i < file.users.length; i++) {
        if (uname === file.users[i]['uname']) {
            let user = file.users[i];
            let profile = JSON.parse(JSON.stringify(user));
            if (profile['password']){
                delete profile['password'];}
            return profile
        }
    }
}
/////////////////////////////////////////////////////////
// Page management

// list of
let pages = [home, pokedex, favourites];
let pagenames = ['home', 'pokedex','favourites'];


/////////////////////////////////////////////////////////
// many app.gets, responding to requests for various different things

// returns the html for each of the pages found in the website's sidebar
for (let i = 0; i < pages.length; i++) {
    app.get('/' + pagenames[i],async function (req, resp) {
        resp.send(pages[i]);
    });
}

app.use(express.static('client'));

//returns html for the login page
app.get('/loginPage',async function (req, resp) {
    resp.send(loginPage);
});

//returns html for the account page
app.get('/account',async function (req, resp) {
    if(username_taken(req.session.user)){
        resp.send(account);}
    else{resp.status(409)
        resp.send('You need to be logged in for that')}
});

// returns list of pages in the pagesnames variable - used for website navigation purposes
app.get('/pages',async function (req, resp) {
    resp.send(pagenames);
});

// returns list of all pokemon names - for search feature
app.get('/all_pokemon',async function (req, resp) {
    resp.send(all_pokemon);
});

// returns html for a list of pokemon news taken from an RSS feed
app.get('/rss',async function (req, resp) {
    await getrssfeed();
    resp.send(rssfeed);
});

// returns list of all registered users (only usernames) - for search feature
app.get('/all_users',async function (req, resp) {
    let all_users =[];
    for (let i=0;i<file.users.length;i++){
        all_users.push({'title':file.users[i]['uname']})
    }
    resp.send(all_users);
});


//runs check for cookies
app.get('/cookie_check', async function (req, resp) {
    if (req.session.token) {
        jwt.verify(req.session.token, app.get('superSecret'), function(err, decoded) {       if (err) {
            return resp.json({ success: false, message: 'Failed to authenticate token.' });       } else {
            req.decoded = decoded;
            console.log('user:',req.session.user)
            data = finduserprofile(req.session.user);
            resp.status(200);
            resp.send(data);
        }
        });

    } else {
        resp.status(204);
    }

});


//logs the user out, returns confirmation to client
app.get('/logout', async function (req, resp) {
    if (req.session) {
        resp.clearCookie('logincookie')
        resp.status(200);
        resp.send('Successfully signed out');

    } else {
        resp.status(409);
        resp.send('Already Signed out')
    }
});

//returns a user's favourites
app.get('/fav', async function (req, resp) {
    let uname = req.query.uname;
    console.log(uname)
    try{
        for (let i=0;i<file.users.length;i++){
            if(file.users[i]['uname']===uname){
                console.log('true')
                let favs = file.users[i]['favourites']
                resp.status(200)
                resp.send(favs);
            }
        }
    }catch(err){
        console.log(err)
    }

});

// middleware to check token
let apiRoutes = express.Router();
apiRoutes.use(function(req, res, next) {

    let token = req.session.token || req.body.token;

    if (token) {

        jwt.verify(token, app.get('superSecret'), function(err, decoded) {       if (err) {
            return res.json({ success: false, message: 'Failed to authenticate token.' });       } else {
            req.decoded = decoded;         next();
        }
        });

    } else {

        return res.status(403).send({
            success: false,
            message: 'You need to be logged in for that'
        });

    }
});


// route for adding new favourite - requires login token
apiRoutes.post('/add_fav',async function (req, resp) {
    if(req.session.user){
        let pokeID = req.body.pokeID;
        await addfavourite(req.session.user,pokeID);
        data = finduserprofile(req.session.user);
        resp.status(202);
        resp.send(data);
        // resp.send("Favourite added!");
    }
    else{
        console.log('problem adding')
    }
});


// route for removing favourite - requires login token
apiRoutes.post('/delete_fav',async function (req, resp) {
    if(req.session.user){
        let pokeID = req.body.pokeID;
        await removefavourite(req.session.user,pokeID);
        data = finduserprofile(req.session.user);
        resp.status(200);
        resp.send(data);
    }
    else {
        console.log('problem deleting fav')    }
});

app.use('/api', apiRoutes);
module.exports = app;