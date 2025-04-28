const request = require('supertest');
const { server, app } = require('./server.js');
const { sequelize } = require('./models');
const {beforeAll, beforeEach, afterAll, describe, it, expect, afterEach} = require("@jest/globals");
const nock = require('nock');

beforeAll(async () => {
    // Make sure DB schema is ready
    await sequelize.sync({ force: true });

    // force auth service host and port
    process.env.AUTH_HOST = 'fake-auth-service';
    process.env.AUTH_PORT = '8080';

    // Wait for the server to be ready
    await server;
    console.info('Server is ready');
    // nock('http://fake-auth-service:8080')
    //     .post('/auth/verify-token', {token: 'fake-token'})
    //     .reply(200, { valid: true, user: 101 });
});

beforeEach(async () => {
    // Clean and re-seed DB before each test
    // await sequelize.truncate({ cascade: true });
    // await sequelize.sync({ force: true });

    await sequelize.query(`
        DROP TABLE IF EXISTS ACCOUNT;
        CREATE TABLE ACCOUNT
        (
            password_hash VARCHAR(255) NOT NULL,  -- Storing hashed passwords as strings
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,         -- Email addresses are text
            balance DECIMAL(10,2) NOT NULL,      -- Monetary value should be decimal
            account_id INT,
            PRIMARY KEY (account_id)
        );
        INSERT INTO ACCOUNT (name, email, balance, account_id, password_hash)
        VALUES ('User 1', 'user1@example.com', 199.72, 101, '$bcrypt$2b$10$examplehash');
        INSERT INTO ACCOUNT (name, email, balance, account_id, password_hash)
        VALUES ('User 2', 'user2@example.com', 100.22, 102, '$bcrypt$2b$10$examplehash');

        DROP TABLE IF EXISTS PRODUCT;
        CREATE TABLE PRODUCT
        (
            product_id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,          -- Product names are text
            description TEXT NOT NULL,           -- Descriptions can be longer text
            price DECIMAL(10,2) NOT NULL,        -- Prices should be decimal for accuracy
            on_sale BOOLEAN NOT NULL,            -- Sale status is true/false
            creator_id INT NOT NULL,
            FOREIGN KEY (creator_id) REFERENCES ACCOUNT(account_id)
        );
        INSERT INTO PRODUCT (product_id, name, description, price, on_sale, creator_id)
        VALUES (992, 'Product 1', 'Some description 1', 10.00, true, 101);
        INSERT INTO PRODUCT (product_id, name, description, price, on_sale, creator_id)
        VALUES (112, 'Product 2', 'Some description 2', 55.99, false, 101);

        DROP TABLE IF EXISTS PRODUCT_TRANSFER;
        CREATE TABLE PRODUCT_TRANSFER
        (
            date_time TIMESTAMP NOT NULL,        -- Date/time should be timestamp type
            buyer_id INT NOT NULL,
            product_id INT NOT NULL,
            PRIMARY KEY (buyer_id, product_id),
            FOREIGN KEY (buyer_id) REFERENCES ACCOUNT(account_id),
            FOREIGN KEY (product_id) REFERENCES PRODUCT(product_id)
        );

        INSERT INTO PRODUCT_TRANSFER (date_time, buyer_id, product_id)
        VALUES (unixepoch(), 102, 992);
    `)
});

afterEach(async () => {
    nock.cleanAll();
})

afterAll(async () => {
    // Close DB connection
    await sequelize.close();
    await new Promise(async (resolve) => (await server).close(resolve));
});

describe('API Fetch List Tests', () => {
    it('when getting selling products, should reject when no token', async () => {
        const res = await request(app)
            .get('/products/selling')
            .expect(401);
    });

    it('when getting selling products, should reject bad token (401)', async () => {
        nock('http://fake-auth-service:8080')
            .post('/auth/verify-token', {token: 'fake-token'})
            .reply(200, { valid: false, error: 'bad token' });

        const res = await request(app)
            .get('/products/selling')
            .set('Authorization', 'Bearer fake-token')
            .expect(401);
    });

    it('getting selling products, should show user owned (200)', async () => {
        nock('http://fake-auth-service:8080')
            .post('/auth/verify-token', {token: 'fake-token'})
            .reply(200, { valid: true, user: 101 });

        const res = await request(app)
            .get('/products/selling')
            .set('Authorization', 'Bearer fake-token')
            .expect(200);

        expect(res.body.user).toBeTruthy();
    });
});
