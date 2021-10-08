process.env.NODE_ENV = 'test';

const request = require('supertest');

const app = require('../app');
const db = require("../db");
const Book = require("../models/book");

let testBook;

beforeEach(async function () {
    await db.query("DELETE FROM books");

    let result = await Book.create({
    isbn: "0691161518",
    amazon_url: "http://a.co/eobPtX2",
    author: "Matthew Lane",
    language: "english",
    pages: 264,
    publisher: "Princeton University Press",
    title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
    year: 2017
    });

    testBook = result;
});

afterEach(async () => {
    await db.query(`
        DELETE FROM books
    `);
});

afterAll(async function () {
    await db.end();
});

describe("Test Book Routes", function () {
    
    test('GET /books', async function() {
        const res = await request(app).get(`/books`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({books: [{
                isbn: "0691161518",
                amazon_url: "http://a.co/eobPtX2",
                author: "Matthew Lane",
                language: "english",
                pages: 264,
                publisher: "Princeton University Press",
                title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
                year: 2017
            }]});
    }); 
    
    test('should return single book', async function() {
        const res = await request(app).get(`/books/${testBook.isbn}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({book: {
            isbn: "0691161518",
            amazon_url: "http://a.co/eobPtX2",
            author: "Matthew Lane",
            language: "english",
            pages: 264,
            publisher: "Princeton University Press",
            title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            year: 2017
        }});
    }); 

    test('should throw error when attempting to return single book with invalid isbn', async function() {
        const res = await request(app).get(`/books/invalid`);

        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({ error: {
            message: "There is no book with an isbn 'invalid'",
            status: 404},
            message: "There is no book with an isbn 'invalid'"
        });
    }); 

    test('should create new book', async function() {
        const res = await request(app)
            .post(`/books`)
            .send({
                isbn: "0691161519",
                amazon_url: "https://www.amazon.com/Ethan-Frome-Edith-Wharton/dp/1508474133/ref=asc_df_1508474133/?tag=hyprod-20&linkCode=df0&hvadid=312034012774&hvpos=&hvnetw=g&hvrand=3104999610547222310&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9026945&hvtargid=pla-569098270309&psc=1",
                author: "Edith Wharton",
                language: "english",
                pages: 195,
                publisher: "Scribner's",
                title: "Ethan Frome",
                year: 1911
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({book: {
                isbn: "0691161519",
                amazon_url: "https://www.amazon.com/Ethan-Frome-Edith-Wharton/dp/1508474133/ref=asc_df_1508474133/?tag=hyprod-20&linkCode=df0&hvadid=312034012774&hvpos=&hvnetw=g&hvrand=3104999610547222310&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9026945&hvtargid=pla-569098270309&psc=1",
                author: "Edith Wharton",
                language: "english",
                pages: 195,
                publisher: "Scribner's",
                title: "Ethan Frome",
                year: 1911
        }});
    }); 

    test('should throw error when missing required info while creating new book', async function() {
        const res = await request(app)
            .post(`/books`)
            .send({
                isbn: "0691161519",
                amazon_url: "https://www.amazon.com/Ethan-Frome-Edith-Wharton/dp/1508474133/ref=asc_df_1508474133/?tag=hyprod-20&linkCode=df0&hvadid=312034012774&hvpos=&hvnetw=g&hvrand=3104999610547222310&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9026945&hvtargid=pla-569098270309&psc=1",
                author: "Edith Wharton",
                language: "english",
                pages: 195,
                publisher: "Scribner's",
                title: "Ethan Frome"
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
            error: {
                message: [
                    "instance requires property \"year\""
                ],
                status: 400
                },
                message: [
                    "instance requires property \"year\""
                ]
            });
    }); 

    test('should update existing book', async function() {
        const res = await request(app)
            .put(`/books/${testBook.isbn}`)
            .send({
                amazon_url: "http://a.co/eobPtX2",
                author: "Matthew Lane",
                language: "chinese",
                pages: 264,
                publisher: "Princeton University Press",
                title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
                year: 2017
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({book: {
            isbn: "0691161518",
            amazon_url: "http://a.co/eobPtX2",
            author: "Matthew Lane",
            language: "chinese",
            pages: 264,
            publisher: "Princeton University Press",
            title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            year: 2017
        }});
    }); 

    test('should throw error when missing required info during update', async function() {
        const res = await request(app)
            .put(`/books/${testBook.isbn}`)
            .send({
                amazon_url: "http://a.co/eobPtX2",
                author: "Matthew Lane",
                language: "chinese",
                pages: 264,
                publisher: "Princeton University Press",
                title: "Power-Up: Unlocking the Hidden Mathematics in Video Games"
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({error: {
            message: ["instance requires property \"year\""],
            status: 400},
            message: ["instance requires property \"year\""]
        });
    }); 

    test('should throw error if isbn is included in req.body during update', async function() {
        const res = await request(app)
            .put(`/books/${testBook.isbn}`)
            .send({
                isbn: "0691161518",
                amazon_url: "http://a.co/eobPtX2",
                author: "Matthew Lane",
                language: "chinese",
                pages: 264,
                publisher: "Princeton University Press",
                title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
                year: 2017
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: {
            message: "Cannot edit isbn",
            status: 400},
            message: "Cannot edit isbn"
        });
    }); 

    test('should delete existing book', async function() {
        const res = await request(app).delete(`/books/${testBook.isbn}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: "Book deleted"});
    }); 

    test('should throw error when trying to delete with invalid isbn', async function() {
        const res = await request(app).delete(`/books/invalid`);

        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({ error: {
            message: "There is no book with an isbn 'invalid'",
            status: 404},
            message: "There is no book with an isbn 'invalid'"
        });
    }); 

});
