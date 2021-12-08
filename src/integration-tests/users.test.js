const chai = require('chai');
const sinon = require('sinon');
const chaiHttp = require('chai-http');
const { expect } = require('chai');
const { MongoClient } = require('mongodb');
const connection = require('./connectionMock');

const server = require('../api/app');

chai.use(chaiHttp);

const DB_NAME = 'Cookmaster';

describe('1 - POST /users', () => {
  const INVALID_ENTRIES = { message: "Invalid entries. Try again." };
  const EMAIL_REGISTERED = { message: "Email already registered" };

  let connectionMock;
  let db;

  before(async () => {
    connectionMock = await connection();

    sinon.stub(MongoClient, 'connect').resolves(connectionMock);

    db = connectionMock.db(DB_NAME);
  });

  after(async () => {
    MongoClient.connect.restore();
  });

  describe(('Quando o campo "name" não é enviado'), () => {
    let response = {};
    
    before(async () => {
      response = await chai.request(server)
        .post('/users')
        .send({})
    });

    it('Retorna status 400', () => {
      expect(response).to.have.status(400);
    });

    it('Retorna objeto com mensagem de erro "Invalid entries. Try again."', () => {
      expect(response.body).to.be.deep.equal(INVALID_ENTRIES);
    });
  });

  describe(('Quando o campo "email" não é enviado'), () => {
    let response = {};
    
    before(async () => {
      response = await chai.request(server)
        .post('/users')
        .send({
          name: "Kevin"
        })
    });

    it('Retorna status 400', () => {
      expect(response).to.have.status(400);
    });

    it('Retorna objeto com mensagem de erro "Invalid entries. Try again."', () => {
      expect(response.body).to.be.deep.equal(INVALID_ENTRIES);
    });
  });

  describe(('Quando o campo "password" não é enviado'), () => {
    let response = {};
    
    before(async () => {
      response = await chai.request(server)
        .post('/users')
        .send({
          name: "Kevin",
          email: "email@email.com"
        })
    });

    it('Retorna status 400', () => {
      expect(response).to.have.status(400);
    });

    it('Retorna objeto com mensagem de erro "Invalid entries. Try again."', () => {
      expect(response.body).to.be.deep.equal(INVALID_ENTRIES);
    });
  });

  describe(('Quando o email enviado já está cadastrado'), () => {
    let response = {};

    before(async () => {
      await db.collection('users').insertOne({
        name: "Kevin",
        email: "email@email.com",
        password: "12345678"
      })

      response = await chai.request(server)
        .post('/users')
        .send({
          name: "Pedro",
          email: "email@email.com",
          password: "12345678"
        })
    });

    after(async () => {
      await db.collection('users').deleteMany({});
    });

    it('Retorna status 409', () => {
      expect(response).to.have.status(409);
    });

    it('Retorna objeto com mensagem de erro "Email already registered"', async () => {
      expect(response.body).to.be.deep.equal(EMAIL_REGISTERED);
    });
  });

  describe(('Caso os dados sejam válidos'), () => {
    let response = {};
  
    before(async () => {
      response = await chai.request(server)
        .post('/users')
        .send({
          name: "Kevin",
          email: "email@email.com",
          password: "12345678"
        })
    });

    after(async () => {
      await db.collection('users').deleteMany({});
    });

    it('Retorna status 201', async () => {
      expect(response).to.have.status(201);
    });

    it('Retorna usuário criado juntamente com a role."', async () => {
      const { _id } = await db.collection('users')
        .findOne({ email: "email@email.com" });

      const user = {
        _id: _id.toString(),
        name: "Kevin",
        email: "email@email.com",
        role: "user"
      }

      expect(response.body).to.be.deep.equal({ user });
    });
  });
});

describe('12 - POST /users/admin', () => {
  const INVALID_ENTRIES = { message: "Invalid entries. Try again." };
  const EMAIL_REGISTERED = { message: "Email already registered" };
  const INVALID_JWT = { message: "jwt malformed" };
  const MISSING_JWT = { message: "missing auth token" };
  const ONLY_ADMIN = { message: "Only admins can register new admins" };

  const users = [
    { name: 'admin', email: 'root@email.com', password: 'admin', role: 'admin' },
    {
      name: "Kevin",
      email: "email@email.com",
      password: "12345678",
      role: "user"
    }
  ]

  let connectionMock;
  let db;

  before(async () => {
    connectionMock = await connection();

    sinon.stub(MongoClient, 'connect').resolves(connectionMock);

    db = connectionMock.db(DB_NAME);

    await db.collection('users').insertMany(users);

  });

  after(async () => {
    await db.collection('users').deleteMany({});
    MongoClient.connect.restore();
  });

  describe(('Quando o token não é enviado'), () => {
    let response = {};
    
    before(async () => {
      response = await chai.request(server)
        .post('/users/admin')
        .send({})
    });

    it('Retorna status 401', () => {
      expect(response).to.have.status(401);
    });

    it('Retorna objeto com mensagem de erro "missing auth token"', () => {
      expect(response.body).to.be.deep.equal(MISSING_JWT);
    });
  });

  describe(('Quando o token enviado é inválido'), () => {
    let response = {};
    
    before(async () => {
      response = await chai.request(server)
        .post('/users/admin')
        .send({})
        .set('authorization', 'token')
    });

    it('Retorna status 401', () => {
      expect(response).to.have.status(401);
    });

    it('Retorna objeto com mensagem de erro "jwt malformed"', () => {
      expect(response.body).to.be.deep.equal(INVALID_JWT);
    });
  });

  describe(('Quando o campo "name" não é enviado'), () => {
    let response = {};
    
    before(async () => {
      const token = await chai.request(server)
      .post('/login')
      .send({
        email: "email@email.com",
        password: "12345678",
      })
      .then((res) => res.body.token)

      response = await chai.request(server)
        .post('/users/admin')
        .send({})
        .set('authorization', token)
    });

    it('Retorna status 400', () => {
      expect(response).to.have.status(400);
    });

    it('Retorna objeto com mensagem de erro "Invalid entries. Try again."', () => {
      expect(response.body).to.be.deep.equal(INVALID_ENTRIES);
    });
  });

  describe(('Quando o campo "email" não é enviado'), () => {
    let response = {};
    
    before(async () => {
      const token = await chai.request(server)
      .post('/login')
      .send({
        email: "email@email.com",
        password: "12345678",
      })
      .then((res) => res.body.token)

      response = await chai.request(server)
        .post('/users/admin')
        .send({
          name: 'Kevin',
        })
        .set('authorization', token)
    });

    it('Retorna status 400', () => {
      expect(response).to.have.status(400);
    });

    it('Retorna objeto com mensagem de erro "Invalid entries. Try again."', () => {
      expect(response.body).to.be.deep.equal(INVALID_ENTRIES);
    });
  });

  describe(('Quando o campo "password" não é enviado'), () => {
    let response = {};
    
    before(async () => {
      const token = await chai.request(server)
      .post('/login')
      .send({
        email: "email@email.com",
        password: "12345678",
      })
      .then((res) => res.body.token)

      response = await chai.request(server)
        .post('/users/admin')
        .send({
          name: 'Kevin',
          email: 'email@email.com',
        })
        .set('authorization', token)
    });

    it('Retorna status 400', () => {
      expect(response).to.have.status(400);
    });

    it('Retorna objeto com mensagem de erro "Invalid entries. Try again."', () => {
      expect(response.body).to.be.deep.equal(INVALID_ENTRIES);
    });
  });

  describe(('Quando o usuário autenticado não é admin'), () => {
    let response = {};
    
    before(async () => {
      const token = await chai.request(server)
      .post('/login')
      .send({
        email: 'email@email.com',
        password: "12345678",
      })
      .then((res) => res.body.token)

      response = await chai.request(server)
        .post('/users/admin')
        .send({
          name: 'Kevin',
          email: 'email@email.com',
          password: 'admin123'
        })
        .set('authorization', token)
    });

    it('Retorna status 403', () => {
      expect(response).to.have.status(403);
    });

    it('Retorna objeto com mensagem de erro "Only admins can register new admins"', () => {
      expect(response.body).to.be.deep.equal(ONLY_ADMIN);
    });
  });

  describe(('Quando o email enviado já está cadastrado'), () => {
    let response = {};

    before(async () => {
      const token = await chai.request(server)
      .post('/login')
      .send({
        email: "root@email.com",
        password: "admin",
      })
      .then((res) => res.body.token)

      response = await chai.request(server)
        .post('/users/admin')
        .send({
          name: 'Kevin',
          email: 'email@email.com',
          password: 'admin123'
        })
        .set('authorization', token)
    });

    it('Retorna status 409', () => {
      expect(response).to.have.status(409);
    });

    it('Retorna objeto com mensagem de erro "Email already registered"', async () => {
      expect(response.body).to.be.deep.equal(EMAIL_REGISTERED);
    });
  });

  describe(('Caso os dados sejam válidos e um admin esteja logado'), () => {
    let response = {};
  
    before(async () => {
      const token = await chai.request(server)
      .post('/login')
      .send({
        email: "root@email.com",
        password: "admin",
      })
      .then((res) => res.body.token)

      response = await chai.request(server)
        .post('/users/admin')
        .send({
          name: 'Kevin',
          email: 'kevin@admin.com',
          password: 'admin123'
        })
        .set('authorization', token)
    });

    after(async () => {
      await db.collection('users').deleteMany({});
    });

    it('Retorna status 201', async () => {
      expect(response).to.have.status(201);
    });

    it('Retorna usuário criado juntamente com a role."', async () => {
      const { _id } = await db.collection('users')
        .findOne({ email: "kevin@admin.com" });

      const user = {
        _id: _id.toString(),
        name: "Kevin",
        email: "kevin@admin.com",
        role: "admin"
      }

      expect(response.body).to.be.deep.equal({ user });
    });
  });
});
