const chai = require('chai');
const sinon = require('sinon');
const chaiHttp = require('chai-http');
const { expect } = require('chai');
const { MongoClient } = require('mongodb');
const connection = require('./connectionMock');

const server = require('../api/app');

chai.use(chaiHttp);

const DB_NAME = 'Cookmaster';

describe('2 - POST /login', () => {
  const FIELS_MUST_BE__FILLED = { message: "All fields must be filled" };
  const INCORRECT_FIELDS = { message: "Incorrect username or password" };

  let connectionMock;
  let db;

  before(async () => {
    connectionMock = await connection();

    sinon.stub(MongoClient, 'connect').resolves(connectionMock);

    db = connectionMock.db(DB_NAME);
  });

  after(async () => {
    MongoClient.connect.restore();
    await db.collection('users').deleteMany({});
  });

  describe(('Quando o campo "email" não é enviado'), () => {
    let response = {};
    
    before(async () => {
      response = await chai.request(server)
        .post('/login')
        .send({})
    });

    it('Retorna status 401', () => {
      expect(response).to.have.status(401);
    });

    it('Retorna objeto com mensagem de erro "All fields must be filled"', () => {
      expect(response.body).to.be.deep.equal(FIELS_MUST_BE__FILLED);
    });
  });

  describe(('Quando o campo "password" não é enviado'), () => {
    let response = {};
    
    before(async () => {
      response = await chai.request(server)
        .post('/login')
        .send({
          email: "email@email.com"
        })
    });

    it('Retorna status 401', () => {
      expect(response).to.have.status(401);
    });

    it('Retorna objeto com mensagem de erro "All fields must be filled"', () => {
      expect(response.body).to.be.deep.equal(FIELS_MUST_BE__FILLED);
    });
  });

  describe(('Quando o campo "email" é inválido'), () => {
    let response = {};
    
    before(async () => {
      response = await chai.request(server)
        .post('/login')
        .send({
          email: "emailemail.com"
        })
    });

    it('Retorna status 401', () => {
      expect(response).to.have.status(401);
    });

    it('Retorna objeto com mensagem de erro "Incorrect username or password"', () => {
      expect(response.body).to.be.deep.equal(INCORRECT_FIELDS);
    });
  });

  describe(('Quando o campo "password" é inválido'), () => {
    let response = {};
    
    before(async () => {
      response = await chai.request(server)
        .post('/login')
        .send({
          email: "email@email.com",
          password: "123"
        })
    });

    it('Retorna status 401', () => {
      expect(response).to.have.status(401);
    });

    it('Retorna objeto com mensagem de erro "Incorrect username or password"', () => {
      expect(response.body).to.be.deep.equal(INCORRECT_FIELDS);
    });
  });

  describe(('Quando o email não está cadastrado'), () => {
    let response = {};
    
    before(async () => {
      response = await chai.request(server)
        .post('/login')
        .send({
          email: "email@email.com",
          password: "12345678"
        })
    });

    it('Retorna status 401', () => {
      expect(response).to.have.status(401);
    });

    it('Retorna objeto com mensagem de erro "Incorrect username or password"', () => {
      expect(response.body).to.be.deep.equal(INCORRECT_FIELDS);
    });
  });

  describe(('Quando o password não é o cadastrado'), () => {
    let response = {};
    
    before(async () => {
      await connectionMock.db(DB_NAME).collection('users').insertOne({
        name: "Kevin",
        email: "email@email.com",
        password: "12345678"
      })

      response = await chai.request(server)
        .post('/login')
        .send({
          email: "email@email.com",
          password: "1234567890"
        })
    });

    after(async () => {
      await db.collection('users').deleteMany({});
    });

    it('Retorna status 401', () => {
      expect(response).to.have.status(401);
    });

    it('Retorna objeto com mensagem de erro "Incorrect username or password"', () => {
      expect(response.body).to.be.deep.equal(INCORRECT_FIELDS);
    });
  });

  describe(('Quando os dados são válidos'), () => {
    let response = {};
    
    before(async () => {
      await connectionMock.db(DB_NAME).collection('users').insertOne({
        name: "Kevin",
        email: "email@email.com",
        password: "12345678"
      })

      response = await chai.request(server)
        .post('/login')
        .send({
          email: "email@email.com",
          password: "12345678"
        })
    });

    after(async () => {
      await db.collection('users').deleteMany({});
    });

    it('Retorna status 200', () => {
      expect(response).to.have.status(200);
    });

    it('Retorna objeto com a chave token', () => {
      expect(response.body).to.be.a('object');
      expect(response.body).to.have.property('token');
      expect(response.body.token).to.be.a('string');
    });
  });
});
