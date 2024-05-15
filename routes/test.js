process.env.NODE_ENV ='test';
const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testCompany;

beforeEach(async function(){
    let result = await db.query(
        `INSERT INTO companies (code, name)
            VALUES ('tst', 'TestCo')
            RETURNING id, code, name`
    );
    console.log('after first query')
    testCompany = result.rows[0];
});

afterEach(async function(){
    await db.query('DELETE FROM companies');
});

afterAll(async function(){
    await db.end();
});

describe('GET /companies', function(){
    test('gets a list of 1 company', async function(){
        const response = await request(app).get('/ccompany');
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            companies: [testCompany]
        });
    });
});