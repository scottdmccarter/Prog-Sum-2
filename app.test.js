'use strict';

const request = require('supertest');
const app = require('./app');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmFtZSI6InRlc3QxIiwiZm5hbWUiOiJUZXN0Iiwic25hbWUiOiJPbmUiLCJmdWxsbmFtZSI6IlRlc3QgT25lIiwiZmF2b3VyaXRlcyI6WzEsMiwzLDQsNV0sImlhdCI6MTU1Njc3NTQxMSwiZXhwIjoxNTU2Nzc2ODUxfQ.jxPuXZ1BRtNog-AQqdSCayrb07-s561i1R6YJXCyJnA'
// // mock the login so that it always says we are logged in
// jest.mock('./login', () => { return jest.fn(() => true)});
//
// const login = require('./login');

// thanks to Nico Tejera at https://stackoverflow.com/questions/1714786/query-string-encoding-of-a-javascript-object
// returns something like "access_token=concertina&username=bobthebuilder"
function serialise(obj){
    return Object.keys(obj).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`).join('&');
}

describe('Test the users service', () => {

    test('GET /all_users succeeds', () => {
        return request(app)
            .get('/all_users')
            .expect(200);
    });

    test('GET /all_users returns JSON', () => {
        return request(app)
            .get('/all_users')
            .expect('Content-type', /json/);
    });

    test('GET /all_users includes test1', () => {
        return request(app)
            .get('/all_users')
            .expect(/test1/);
    });

    test('POST /sign_up_submit works', () => {
        // create a randomly named user
        let num = Math.floor(Math.random() * 1001);
        let username = 'test'+ num;
        let firstname = 'Test';
        let surname =  'Number'+num;
        let password =  'password'+num;
        const params = {uname: username,
            fname: firstname, sname:surname,password:password};
        // add it to the list of existing users
        return request(app)
            .post('/sign_up_submit')
            .send(serialise(params)).expect(200);
    });

    test('POST /login works', () => {
        // create a randomly named user
        let username = 'test1';
        let password =  'password1';
        const params = {uname: username,password:password};
        return request(app)
            .post('/login')
            .send(serialise(params)).expect(200);
    });

    test('POST /login doesn\'t work with incorrect credentials', () => {
        // create a randomly named user
        let username = 'test1';
        let password =  'password404';
        const params = {uname: username,password:password};
        return request(app)
            .post('/login')
            .send(serialise(params)).expect(409);
    });

    // test('POST /login returns JSON', () => {
    //     // create a randomly named user
    //     let username = 'test1';
    //     let password =  'password1';
    //     const params = {uname: username,password:password};
    //     return request(app)
    //         .post('/login')
    //         .send(serialise(params)).expect('Content-type', /json/);
    // });
});

// describe('Test the favourites service', () => {
//     test('GET /fav succeeds', async (done) => {
//         let username = 'test1';
//         const params = {"uname": username};
//         return await request(app)
//             .get('/fav?uname=test1')
//             // .send(serialise(params))
//             .expect(200)
//             done();
//     });
//
//     test('GET /fav returns JSON',  async (done) => {
//         let username = 'test1';
//         const params = {uname: username};
//         return await request(app)
//             .get('/fav')
//             .send(serialise(params)).expect('Content-type', /json/);
//         done();
//     });
//
    test('POST /api/add_fav succeeds with correct auth', () => {
        let pokeID = '1';
        const params = {pokeID: pokeID,token:token};
        return request(app)
            .post('/api/add_fav')
            .send(serialise(params))
            .expect();
    });
//
//     test('POST /sign_up_submit works', () => {
//         // create a randomly named user
//         let num = Math.floor(Math.random() * 101);
//         let username = 'test'+ num
//         let firstname = 'Test'
//         let surname =  'Number'+num
//         let password =  'password'+num
//         const params = {uname: username,
//             fname: firstname, sname:surname,password:password};
//         // add it to the list of existing users
//         return request(app)
//             .post('/sign_up_submit')
//             .send(serialise(params)).expect(200);
//     });
// });

describe('Test the all_pokemon service', () => {
    test('GET /all_pokemon succeeds', () => {
        return request(app)
            .get('/all_pokemon')
            .expect(200);
    });

    test('GET /all_pokemon returns JSON', () => {
        return request(app)
            .get('/all_pokemon')
            .expect('Content-type', /json/);
    });

    test('GET /all_pokemon includes Pikachu', () => {
        return request(app)
            .get('/all_pokemon')
            .expect(/Pikachu/)
    });
});



//app.post('/login'
//app.post('/gsignin'
//app.get('/pokemon'
//app.get('/potd'
//app.get('/loginPage'
//app.get('/account'
//app.get('/pages'
//app.get('/rss'
//app.get('/cookie_check'
//app.get('/logout',


//app.get('/fav'
//apiRoutes.post('/add_fav'
//apiRoutes.post('/delete_fav