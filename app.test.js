'use strict';

const request = require('supertest');
const app = require('./app');


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
        let a = request(app)
            .post('/login')
            .send(serialise(params)).expect(200);
        console.log(a)
        return a
    });

    test('POST /login doesn\'t work with incorrect credentials', () => {
        let username = 'test1';
        let password =  'password404';
        const params = {uname: username,password:password};
        return request(app)
            .post('/login')
            .send(serialise(params)).expect(409);
    });

    test('POST /login returns JSON', () => {
        let username = 'test1';
        let password =  'password1';
        const params = {uname: username,password:password};
        return request(app)
            .post('/login')
            .send(serialise(params)).expect('Content-type', /json/);
    });

    test('GET /logout succeeds', () => {
        return request(app)
            .get('/logout')
            .expect(200);
    });
});

describe('Test the pokemon services', () => {
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

describe('Test the page services', () => {

    test('GET /pages succeeds', () => {
        return request(app)
            .get('/pages')
            .expect(200);
    });

    test('GET /pages returns JSON', () => {
        return request(app)
            .get('/pages')
            .expect('Content-type', /json/);
    });

    test('GET /pages contains pokedex', () => {
        return request(app)
            .get('/pages')
            .expect(/pokedex/);
    });

    test('GET /potd succeeds', () => {
        return request(app)
            .get('/potd')
            .expect(200);
    });

    test('GET /potd returns JSON', () => {
        return request(app)
            .get('/potd')
            .expect('Content-type', /json/);
    });

    test('GET /potd returns JSON', () => {
        return request(app)
            .get('/potd')
            .expect(/Sprite/);
    });

    test('GET /loginPage succeeds', () => {
        return request(app)
            .get('/loginPage')
            .expect(200);
    });


    test('GET /loginPage returns HTML', () => {
        return request(app)
            .get('/loginPage')
            .expect('Content-type', /html/);
    });

    test('GET /loginPage contains login', () => {
        return request(app)
            .get('/loginPage')
            .expect(/login/);
    });

    test('GET /rss succeeds', () => {
        return request(app)
            .get('/rss')
            .expect(200);
    });

    test('GET /rss returns HTML', () => {
        return request(app)
            .get('/rss')
            .expect('Content-type', /html/);
    });

    test('GET /rss contains pokemon', () => {
        return request(app)
            .get('/rss')
            .expect(/pokemon/);
    });
});


