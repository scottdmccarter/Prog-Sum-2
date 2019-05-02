/////////////////////////////////////////////////////////
//Initialising various constants etc
/*global gapi*/
const domain = window.location.href;
let loggedIn = false;
let accountData;

// function testing if current device is mobile or not, returns true for mobile
function mobiledevice() {
    if(window.innerWidth <= 768) {
        return true;
    } else {
        return false;
    }
}

// Initialising various functions
    pagemanage();
    pagechange('home');
    cookie_check();
    leftside();
    $('.ui.left.sidebar').sidebar({
        transition: 'overlay'
    });

    $('.ui.left.sidebar')
        .sidebar('attach events', '.open');


// function called following login, informing user of successful login and altering page where necessary
async function nowLoggedIn(userdata){
    if(loggedIn === true)
    {
        accountData = userdata;
        console.log('logged in as ' + accountData['uname']);
        alert("You're logged in as " + accountData['uname']);
        document.getElementById('loginPage').innerHTML = '<h4><i class="user icon"></i>Signed in: ' + accountData['uname'] + '</h4>';
    }
}


// Runs when page is loaded to check for cookies, used for login persistence
async function cookie_check(){
    try {
        let res = await fetch(domain + 'cookie_check');
        if (res.status === 200){
            loggedIn=true;
            let response = await res.text();
            let userdata = JSON.parse(response);
            nowLoggedIn(userdata)
        }
        else{
        throw new Error(await res.text());
        }
    }
    catch(err){
        console.log(err)
    }
}

// Requests logout confirmation from server, upon receiving this, it informs user and adjusts webpage accordingly
async function logout(){
    try {
        let res = await fetch(domain + 'logout');
        if (res.ok){
            loggedIn=false;
            let response = await res.text();
            alert(response);
            loggedIn = false;
            accountData = undefined;
            document.getElementById('loginPage').innerHTML = 'Log in';
            $('.ui.dropdown')
                .dropdown({})
        }

    }
    catch(err){
        console.log(err)
    }

}

// Event listener, monitoring logout button
document.getElementById('logout').addEventListener('click', function (event) {
    event.preventDefault();
    logout();
    pagechange('home');
});

// Function requesting information on the "Pokemon of the day" from the server and adjusts webpage accordingly
async function potd() {
    let res = await fetch(domain + 'potd');
    if (res.ok) {
        let data = await res.text();
        let pokemon = JSON.parse(data);
        let sprite = '<img src=' + pokemon.Sprite + ' style="width:50px;height:50px; " />';
        document.getElementById("potd").innerHTML = sprite;
        document.getElementById("potd2").innerHTML = sprite;

        pokemon.Sprite = '<img src=' + pokemon.Sprite + ' style="width:150px;height:150px;" />';

        let output = '<h2>' + pokemon.Name + '</h2>\n' +
            pokemon.Sprite +
            '<h4> Pokedex ID: ' + pokemon.Pokedex_ID + '</h4>\n';

        document.getElementById("inner_content").innerHTML = output

    }
}

// Function for signin via google, sends login token to server for validation and receives user info in return
async function gsignin(googleUser){
    let id_token = googleUser.getAuthResponse().id_token;
    try {
        let response = await fetch(domain + 'gsignin',
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: "idtoken=" + id_token
            });
        if (!response.ok) {
            console.log(response);
            alert(await response.text())
        }
        else{
            let data = await response.text();
            // console.log(data);
            if (!response.ok) {
                throw new Error(data);
            } else {
                let details = JSON.parse(data);
                loggedIn = true;
                nowLoggedIn(details);
                try {
                    let res = await fetch(domain + 'account');
                    let body = await res.text();
                    if (mobiledevice()){
                        document.getElementById('mobile_top').innerHTML = body;
                    }
                    else{
                    document.getElementById('content_here').innerHTML = body;
                    }
                    await findfavourites(accountData['uname'], true)
                } catch (error) {
                    console.log(error)
                }
            }
        }
    }
        catch(err){
        console.log(err)
    }
    let auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
    });
}

// General "page managing" function, with eventlisteners and relevant responses for the different content the webpages displays
async function pagemanage() {
    let response = await fetch(domain + 'pages');
    let responsetext = await response.text();
    let pages = JSON.parse(responsetext);

    for (let i = 0; i < pages.length; i++) {
        let page = pages[i];
        document.getElementById(pages[i]).addEventListener('click', function () {
            highlight(page, pages);
            pagechange(page);
            $('.ui.left.sidebar').sidebar("toggle"
            );
        });
    }
    document.getElementById('loginPage').addEventListener('click', async function () {
        if (loggedIn===false) {
            highlight('loginPage', pages);
            await pagechange('loginPage');
            gapi.signin2.render("gsign", {
                "scope": "profile email openid",
                "width": 200,
                "height": 40,
                "longtitle": true,
                "theme": "dark",
                "onsuccess": function (googleUser) {
                    // Called when the user signs in
                    gsignin(googleUser)

                },
                "onfailure": function (e) {
                    console.warn("Google Sign-In failure: " + e.error);
                }
            });
        }
        else{
            $('.ui.dropdown')
                .dropdown("show",{
                    transition: 'scale',
                    action: 'hide'
                });
        }
        // console.log(loggedIn)
    });
    document.getElementById('account').addEventListener('click', function () {
        highlight('account', pages);
        pagechange('account');
        findfavourites(accountData['uname'],true)
    });
}
// Function that actually changes the contents of the pages, for the pages in the sidebar
async function pagechange(page) {
    try {
        let res = await fetch(domain + page);
        let responsetext = await res.text();

        if (mobiledevice()){
            document.getElementById('mobile_top').innerHTML = responsetext;
        }
        else{
            document.getElementById('content_here').innerHTML = responsetext;
        }

        if (page === 'pokedex') {
            let response = await fetch(domain + 'all_pokemon');
            let body = await response.text();
            let all_pokemon = JSON.parse(body);
            console.log(all_pokemon);

            $(function () {
                $('#pokedexsearch').search({
                    source: all_pokemon,
                    maxResults: 15
                })
            });

            }

        if (page === 'home') {
            potd()
        }

        if (page === 'favourites'){
            let response2 = await fetch(domain + 'all_users');
            let body = await response2.text();
            let all_users = JSON.parse(body);
            if(loggedIn){
            // findfavourites(accountData['uname'])
            }
            $(function () {
                $('#usersearch').search({
                    source: all_users,
                    maxResults: 15
                })
            });
        }
    } catch (error) {
        console.log(error);
        let body = "<h4> Oh no! We're having some issues, please try again later</h4>";
        if (mobiledevice()){
            document.getElementById('mobile_top').innerHTML = body;
        }
        else{
            document.getElementById('content_here').innerHTML = body;
        }

    }
}

// Function that highlights the currently active page in the sidebar
function highlight(page, pages) {
    for (var i = 0; i < pages.length; i++) {
        if (pages[i] === page) {
            document.getElementById(pages[i]).classList.add('active');
        } else {
            document.getElementById(pages[i]).classList.remove('active');
        }
    }
}


//  Function that takes as its input a number, it requests information about the pokemon with that ID from the server
async function pokeSubmit(pokeID) {
    if(pokeID.length > 0){
    try {
        let res = await fetch(domain + "pokemon" + "?pokeID=" + pokeID);
        if (res.ok) {
            let data = await res.text();
            let pokemon = JSON.parse(data);

            let output = '<h2>' + pokemon.Name + '</h2>\n' +
                '<img src=' + pokemon.Sprite + ' style="width:150px;height:150px;" />' +
                '<h4> Pokedex ID: ' + pokemon.Pokedex_ID + '</h4>\n' +
                '<h4> Type: ' + pokemon.Type_1 + '</h4>\n';
            if (pokemon.Type_2) {
                output += '<h4> Type 2: ' + pokemon.Type_2 + '</h4>\n'
            }


            document.getElementById("inner_content").innerHTML = output;
            if(loggedIn){
                if(accountData['favourites'].includes( pokemon.Pokedex_ID)){

                    console.log(pokemon.Pokedex_ID+' is in favourites');
                    document.getElementById("inner_content").innerHTML += '<div class="ui red button" onclick="removefav('+pokemon.Pokedex_ID+');pagechange(\'pokedex\')" >Remove favourite</div>\n'
                }
                else{
                    console.log('not in favourites');
                    document.getElementById("inner_content").innerHTML += '<div class="ui yellow button" onclick="addfav('+pokemon.Pokedex_ID+')" >Add favourite</div>\n'
                }

            }

        } else {
            throw new Error("Please check spelling");
        }
    } catch (error) {
        document.getElementById('inner_content').innerHTML = "<img src='error.png' height='100' width='100' alt='error image'> \n"+
            "<h4> Oh no! We can't seem to find that Pokemon, check your spelling and try again!</h4>"

    }
    }
    else{
        alert('You need to search for something!')
    }
}

// function used to capitalise first character of string (for names etc)
function jsUcfirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Sends login request to server, receiving account info if credentials are valid
async function login() {
    try {
        let username = document.getElementById('loginuname').value;
        let password = document.getElementById('loginpassword').value;
        let response = await fetch(domain + 'login',
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: "uname=" + username + "&fname=" + "&password=" + password
            });
        let data = await response.text();
        console.log(data);
        if (!response.ok) {
            throw new Error(data);
        } else {
            let details = JSON.parse(data);
            loggedIn = true;
            nowLoggedIn(details);
            try {
                let res = await fetch(domain + 'account');
                let body = await res.text();
                if (mobiledevice()){
                    document.getElementById('mobile_top').innerHTML = body
                }
                else{
                    document.getElementById('content_here').innerHTML = body;

                }
                await findfavourites(accountData['uname'],true)
            } catch (error) {
                console.log(error)
            }

        }
    } catch (error) {
        alert(error);
    }
}

// Sends contents of signup form to server
async function submitform() {
    if ($("#sign_up_form").form('is valid')) {
        try {
            let username = document.getElementById('username').value;
            let firstname = document.getElementById('firstname').value;
            let surname = document.getElementById('surname').value;
            let password = document.getElementById('password').value;
            let response = await fetch(domain + 'sign_up_submit',
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: "uname=" + username + "&fname=" + firstname + "&sname=" + surname + "&password=" + password

                });
            let data = await response.text();
            alert(data);
            if (!response.ok) {
                throw new Error("problem adding user" + response.code);
            } else {
                $('.modal').modal('hide');
            }
        } catch (error) {
            console.log("problem: " + error);
        }
    }
}

// Requests contents of webpage's left segment from server
async function leftside() {
    let res = await fetch(domain + 'rss');
    let responsetext = await res.text();
    document.getElementById('left').innerHTML = responsetext;
    document.getElementById('mobile_middle').innerHTML = responsetext;
}


//  function for initialising modal signup form
var aFunction = function () {
    $('.modal').modal({
        detachable: true,
        closable: false,
        transition: 'fade up',
        onApprove: function () {
            $('#sign_up_form').submit(function (e) {
                e.preventDefault()
            });
            validate();
            submitform();
            return false;
        },
    });
};

//  function for opening modal signup form
function openform() {
    //Resets form input fields
    $('#sign_up_form').trigger("reset");
    //Resets form error messages
    $('.ui.form .field.error').removeClass("error");
    $('.ui.form.error').removeClass("error");
    $('.modal').modal('show');
}
let formValidationRules = {
    fields: {
        name: {
            identifier: 'name',
            rules: [
                {
                    type: 'empty',
                    prompt: 'Please enter your name'
                }
            ]
        },
        username: {
            identifier: 'username',
            rules: [
                {
                    type: 'empty',
                    prompt: 'Please enter a username'
                }
            ]
        },
        password: {
            identifier: 'password',
            rules: [
                {
                    type: 'empty',
                    prompt: 'Please enter a password'
                },
                {
                    type: 'minLength[6]',
                    prompt: 'Your password must be at least {ruleValue} characters'
                }
            ]
        }
    }
};

// validates form values
function validate() {
    $('#sign_up_form').form(formValidationRules);
    $('#sign_up_form').form("validate form");

}

// Produces an html table showing a given user's favourite pokemon, the "del" argument determines if a buttons appear beside each favourite to remove it
async function findfavourites(uname, del = false){
    let favourites = await getfavs(uname);
    let output = '<div class="ui segment" >\n' +
        '<h2>'+uname+'\'s Favourites:</h2>\n' +
        '<table class="ui very basic collapsing table" style="overflow: auto">\n' +
        '<tbody>';
    if (favourites.length >0) {
        for (let i = 0; i < favourites.length; i++) {
            try {
                let res = await fetch(domain + "pokemon" + "?pokeID=" + favourites[i]);
                if (res.ok) {
                    let data = await res.text();
                    let pokemon = JSON.parse(data);
                    let name = '<label>' + pokemon.Name + '</label>';
                    let sprite = '<img src=' + pokemon.Sprite + ' style="width:75px;height:75px;" />';
                    let X = '';
                    if (del){
                         X = '<td>\n' +
                        '<div class="content"><i class="red large close icon" onclick="removefav('+pokemon.Pokedex_ID+')"></i>\n' +
                        '</div>\n' +
                        '</td>\n'}

                    output += '<tr>\n' +
                        '<td>\n' +
                        '<h4 class="ui image header" style="text-align: center;">\n' +
                        '<div class="content">\n' +
                        '(#' + favourites[i] + ')   ' + name + '\n' +
                        '</div>\n' +
                        '</h4></td>\n' +
                        '<td>\n' +
                        '<div class="content">\n' +
                        sprite + '\n' +
                        '</div>\n' +
                        '</td>\n' +
                        X +
                        '</tr>\n'

                } else {
                    throw new Error("Please check spelling");
                }
            } catch (err) {
                console.log(err)
            }


        }
    }
    else{
        output+='<h4> There are no favourites here yet - favourites are added through the Pokedex!</h4>'
    }
    output +='</tbody>\n' +
        '</table>\n' +
        '</div>';
    document.getElementById("inner_content").innerHTML = output
    // document.getElementById("inner_content").innerHTML = favourites[0]

}

// Sends a username to the server, which returns a list of that user's favourite pokemon
async function getfavs(uname) {
        try {
            let res = await fetch(domain + "fav?uname=" + uname);
            if (res.ok) {
                let data = await res.text();
                let favs = JSON.parse(data);
                // console.log(favs)
                return (favs)
            } else {
                throw new Error("Please check spelling");
            }
        } catch (error) {console.log(error)}
}

// sends a post request to remove a pokemon from the user's favourites (requires authentication)
async function removefav(pokeID){
    try {
        let response = await fetch(domain + 'api/delete_fav',
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: "pokeID=" +  pokeID
            });
        if (!response.ok) {
            let res = await response.text();
            console.log(res);
            let mess = JSON.parse(res);
            alert(mess.message)
        }
        else{
            let data = await response.text();
            let details =  JSON.parse(data);
            // console.log(details)
            accountData = details;
            alert('Favourite has been removed!')
        }
    }
    catch(err){
        console.log(err)
    }
}

// sends a post request to add a pokemon to the user's favourites (requires authentication)

async function addfav(pokeID){
    try {
        let response = await fetch(domain + 'api/add_fav',
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: "pokeID=" +  pokeID
            });
        if (!response.ok) {
            let res = await response.text();
            console.log(res);
            let mess = JSON.parse(res);
            alert(mess.message)
        }
        else{
            let data = await response.text();
            let details =  JSON.parse(data);
            // console.log(details)
            accountData = details;
            alert('Added!');
            pagechange('pokedex')
        }
    }
    catch(err){
        console.log('err',err)

    }
}