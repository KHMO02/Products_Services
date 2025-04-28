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
    `);

    await sequelize.query(`
      CREATE TABLE ACCOUNT (
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        balance DECIMAL(10,2) NOT NULL,
        account_id INT,
        PRIMARY KEY (account_id)
      );
    `);

    await sequelize.query(`
      INSERT INTO ACCOUNT (name, email, balance, account_id, password_hash)
      VALUES ('User 1', 'user1@example.com', 199.72, 101, '$bcrypt$2b$10$examplehash');
    `);

    await sequelize.query(`
      DROP TABLE IF EXISTS PRODUCT;
    `);

    await sequelize.query(`
      CREATE TABLE PRODUCT (
        product_id INTEGER PRIMARY KEY AUTOINCREMENT,
        picture_url VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        on_sale BOOLEAN NOT NULL,
        creator_id INT NOT NULL,
        FOREIGN KEY (creator_id) REFERENCES ACCOUNT(account_id)
      );
    `);

    await sequelize.query(`
      INSERT INTO PRODUCT (product_id, name, description, price, on_sale, creator_id, picture_url)
      VALUES (992, 'Product 1', 'Some description 1', 10.00, true, 101, 'https://picsum.photos/200/300');
    `);

    await sequelize.query(`
      INSERT INTO PRODUCT (product_id, name, description, price, on_sale, creator_id, picture_url)
      VALUES (112, 'Product 2', 'Some description 2', 55.99, false, 101, 'https://picsum.photos/200/300');
    `);
});

afterEach(async () => {
    nock.cleanAll();
    await sequelize.truncate({ cascade: true });
})

afterAll(async () => {
    // Close DB connection
    await sequelize.close();
    await new Promise(async (resolve) => (await server).close(resolve));
});

describe('API Mutation Tests', () => {
    it('when create product expect to work (201)', async () => {
        nock('http://fake-auth-service:8080')
            .post('/auth/verify-token', {token: 'fake-token'})
            .reply(200, { valid: true, user: 101 });

        const res = await request(app)
            .post('/products/selling', {})
            .send({
                name: 'Product 3',
                description: 'Some description 3',
                price: 20.00,
                picture_url: 'https://picsum.photos/200/300',
            })
            .set('Authorization', 'Bearer fake-token')
            .expect(201);

        expect(res.body.id).toBeTruthy()

        // Check database
        const [results] = await sequelize.query(`
            SELECT * FROM PRODUCT WHERE product_id = ${res.body.id}
        `);

        expect(results.length).toBe(1);
        expect(results[0].name).toBe('Product 3');
        expect(results[0].description).toBe('Some description 3');
        expect(results[0].price).toBe(20.00);
        expect(results[0].creator_id).toBe(101);
    });
});
