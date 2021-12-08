const chai = require('chai');
const sinon = require('sinon');
const chaiHttp = require('chai-http');
const { expect } = require('chai');
const { MongoClient } = require('mongodb');
const path = require('path');
const fs = require('fs/promises');

const connection = require('./connectionMock');
const server = require('../api/app');

chai.use(chaiHttp);

const DB_NAME = 'Cookmaster';

describe('3 - POST /recipes', () => {
  const INVALID_ENTRIES = { message: "Invalid entries. Try again." };
  const INVALID_JWT = { message: "jwt malformed" };
  const MISSING_JWT = { message: "missing auth token" };

  let connectionMock;
  let db;

  before(async () => {
    connectionMock = await connection();

    sinon.stub(MongoClient, 'connect').resolves(connectionMock);

    db = connectionMock.db(DB_NAME);

    await db.collection('users').insertOne({
      name: "Kevin",
      email: "email@email.com",
      password: "12345678",
      role: "user"
    });
  });

  after(async () => {
    MongoClient.connect.restore();
    await db.collection('users').deleteMany({});
    await db.collection('recipes').deleteMany({});
  });

  describe(('Quando o token não é enviado'), () => {
    let response = {};
    
    before(async () => {
      response = await chai.request(server)
        .post('/recipes')
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
        .post('/recipes')
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
        .post('/recipes')
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

  describe(('Quando o campo "ingredients" não é enviado'), () => {
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
        .post('/recipes')
        .send({
          name: 'Frango',
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

  describe(('Quando o campo "preparation" não é enviado'), () => {
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
        .post('/recipes')
        .send({
          name: "Frango",
          ingredients: "Frango, sazon",
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

  describe(('Quando os campos são válidos'), () => {
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
        .post('/recipes')
        .send({
          name: "Frango",
          ingredients: "Frango, sazon",
          preparation: "10 minutos no forno"
        })
        .set('authorization', token)
    });

    it('Retorna status 201', () => {
      expect(response).to.have.status(201);
    });

    it('Retorna objeto com mensagem de erro "Invalid entries. Try again."', async () => {
      const dbRecipe = await db.collection('recipes').findOne({ name: "Frango" });
      const recipe = { ...dbRecipe, _id: dbRecipe._id.toString() }
      expect(response.body).to.be.deep.equal({ recipe });
    });
  });
});

describe('4 - GET /recipes', () => {
  let connectionMock;
  let db;
  let insertedIds = {};

  const fakeRecipe1 = {
    name: "Frango",
    ingredients: "Frango, sazon",
    preparation: "10 minutos no forno",
    userId: "61a69ab8544044df09f66bc9"
  }

  const fakeRecipe2 = {
    name: "Peixe",
    ingredients: "Peixe, sazon",
    preparation: "10 minutos no forno",
    userId: "61a69ab8544044df09f66bc9",
  }

  before(async () => {
    connectionMock = await connection();

    sinon.stub(MongoClient, 'connect').resolves(connectionMock);

    db = connectionMock.db(DB_NAME);

    await db.collection('users').insertOne({
      name: "Kevin",
      email: "email@email.com",
      password: "12345678",
      role: "user"
    });

    const insertedRecipes = await db.collection('recipes').insertMany([fakeRecipe1, fakeRecipe2])
    insertedIds = insertedRecipes.insertedIds
  });

  after(async () => {
    MongoClient.connect.restore();
    await db.collection('users').deleteMany({});
    await db.collection('recipes').deleteMany({});
  });

  describe(('Lista receitas para usuário não autenticado'), () => {
    let response = {};
    
    before(async () => {
      response = await chai.request(server)
        .get('/recipes')
    });

    it('Retorna status 200', () => {
      expect(response).to.have.status(200);
    });

    it('Retorna array com todas receitas receitas', () => {
      expect(response.body).to.be.deep.equal([
        {...fakeRecipe1, _id: insertedIds[0].toString()},
        {...fakeRecipe2, _id: insertedIds[1].toString()},
      ]);
    });
  });

  describe(('Lista receitas para usuário autenticado'), () => {
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
      .get('/recipes')
      .set('authorization', token)

      response = await chai.request(server)
        .get('/recipes')
    });

    it('Retorna status 200', () => {
      expect(response).to.have.status(200);
    });

    it('Retorna array com todas receitas receitas', () => {
      expect(response.body).to.be.deep.equal([
        {...fakeRecipe1, _id: insertedIds[0].toString()},
        {...fakeRecipe2, _id: insertedIds[1].toString()},
      ]);
    });
  });
});

describe('5 - GET /recipes/:id', () => {
  let connectionMock;
  let db;
  let insertedIds = {};

  const RECIPE_NOT_FOUND = { message: "recipe not found" };

  const fakeRecipe1 = {
    name: "Frango",
    ingredients: "Frango, sazon",
    preparation: "10 minutos no forno",
    userId: "61a69ab8544044df09f66bc9"
  }

  const fakeRecipe2 = {
    name: "Peixe",
    ingredients: "Peixe, sazon",
    preparation: "10 minutos no forno",
    userId: "61a69ab8544044df09f66bc9",
  }

  before(async () => {
    connectionMock = await connection();

    sinon.stub(MongoClient, 'connect').resolves(connectionMock);

    db = connectionMock.db(DB_NAME);

    await db.collection('users').insertOne({
      name: "Kevin",
      email: "email@email.com",
      password: "12345678",
      role: "user"
    });

    const insertedRecipes = await db.collection('recipes').insertMany([fakeRecipe1, fakeRecipe2])
    insertedIds = insertedRecipes.insertedIds
  });

  after(async () => {
    MongoClient.connect.restore();
    await db.collection('users').deleteMany({});
    await db.collection('recipes').deleteMany({});
  });

  describe(('Caso o id da receita seja inválido'), () => {
    let response = {};
    
    before(async () => {
      response = await chai.request(server)
        .get('/recipes/idaleatorio123')
    });

    it('Retorna status 404', () => {
      expect(response).to.have.status(404);
    });

    it('Retorna objeto com mensagem de erro "recipe not found"', () => {
      expect(response.body).to.be.deep.equal(RECIPE_NOT_FOUND);
    });
  });
  
  describe(('Caso o id da receita não exista'), () => {
    let response = {};
    
    before(async () => {
      response = await chai.request(server)
        .get('/recipes/61a69ab8544044df09f66ba7')
    });

    it('Retorna status 404', () => {
      expect(response).to.have.status(404);
    });

    it('Retorna objeto com mensagem de erro "recipe not found"', () => {
      expect(response.body).to.be.deep.equal(RECIPE_NOT_FOUND);
    });
  });
  

  describe(('Lista receita para usuário não autenticado'), () => {
    let response = {};
    
    before(async () => {
      response = await chai.request(server)
        .get(`/recipes/${insertedIds[0]}`)
    });

    it('Retorna status 200', () => {
      expect(response).to.have.status(200);
    });

    it('Retorna objeto contendo a receita', () => {
      expect(response.body).to.be.deep.equal(
        {...fakeRecipe1, _id: insertedIds[0].toString()},
      );
    });
  });

  describe(('Lista receita para usuário autenticado'), () => {
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
      .get('/recipes')
      .set('authorization', token)

      response = await chai.request(server)
      .get(`/recipes/${insertedIds[1]}`)
    });

    it('Retorna status 200', () => {
      expect(response).to.have.status(200);
    });

    it('Retorna objeto contendo a receita', () => {
      expect(response.body).to.be.deep.equal(
        {...fakeRecipe2, _id: insertedIds[1].toString()},
      );
    });
  });
});

describe('7 - PUT /recipes/:id', () => {
  const INVALID_ENTRIES = { message: "Invalid entries. Try again." };
  const INVALID_JWT = { message: "jwt malformed" };
  const MISSING_JWT = { message: "missing auth token" };
  const UNAUTHORIZED = { message: "you can only update your recipes" };
  const RECIPE_NOT_FOUND = { message: "recipe not found" };


  const fakeRecipe1 = {
    name: "Frango",
    ingredients: "Frango, sazon",
    preparation: "10 minutos no forno",
  }

  const fakeRecipe2 = {
    name: "Peixe",
    ingredients: "Peixe, sazon",
    preparation: "10 minutos no forno",
    userId: "61a69ab8544044df09f66bc9",
  }

  const editedRecipe = {
    name: "Editado",
    ingredients: "Editado, sazon",
    preparation: "20 minutos no forno"
  }

  let connectionMock;
  let db;
  let recipeCorrrectUserId;
  let recipeWrongUserId;
  let userId;

  before(async () => {
    connectionMock = await connection();

    sinon.stub(MongoClient, 'connect').resolves(connectionMock);

    db = connectionMock.db(DB_NAME);

    const { insertedId: user } = await db.collection('users').insertOne({
      name: "Kevin",
      email: "email@email.com",
      password: "12345678",
      role: "user"
    });

    userId = user.toString();

    await db.collection('users').insertOne({
      name: "admin",
      email: "root@admin.com",
      password: "admin",
      role: "admin"
    });

    const { insertedId: id1 } = await db.collection('recipes').insertOne({...fakeRecipe1, userId: userId.toString()});
    const { insertedId: id2 } = await db.collection('recipes').insertOne(fakeRecipe2);
    recipeCorrrectUserId = id1.toString();
    recipeWrongUserId = id2.toString();
  });

  after(async () => {
    MongoClient.connect.restore();
    await db.collection('users').deleteMany({});
    await db.collection('recipes').deleteMany({});
  });

  describe(('Quando o token não é enviado'), () => {
    let response = {};
    
    before(async () => {
      response = await chai.request(server)
        .put('/recipes/61a69ab8544044df09f66ba7')
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
        .put('/recipes/61a69ab8544044df09f66ba7')
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
        .put('/recipes/61a69ab8544044df09f66ba7')
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

  describe(('Quando o campo "ingredients" não é enviado'), () => {
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
        .put('/recipes/61a69ab8544044df09f66ba7')
        .send({
          name: 'Frango',
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

  describe(('Quando o campo "preparation" não é enviado'), () => {
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
        .put('/recipes/61a69ab8544044df09f66ba7')
        .send({
          name: "Frango",
          ingredients: "Frango, sazon",
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

  describe(('Caso o id da receita não exista'), () => {
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
        .put(`/recipes/61a69ab8544044df09f66ba7`)
        .send(editedRecipe)
        .set('authorization', token)
    });

    it('Retorna status 404', () => {
      expect(response).to.have.status(404);
    });

    it('Retorna objeto com mensagem de erro "recipe not found"', () => {
      expect(response.body).to.be.deep.equal(RECIPE_NOT_FOUND);
    });
  });

  describe(('Quando os campos são válidos e o usuário não é o criador da receita'), () => {
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
        .put(`/recipes/${recipeWrongUserId}`)
        .send(editedRecipe)
        .set('authorization', token)
    });

    it('Retorna status 401', () => {
      expect(response).to.have.status(401);
    });

    it('Retorna objeto com mensagem de erro "you can only update your recipes"', async () => {
      expect(response.body).to.be.deep.equal(UNAUTHORIZED);
    });
  });

  describe(('Quando os campos são válidos e o usuário é o criador da receita'), () => {
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
        .put(`/recipes/${recipeCorrrectUserId}`)
        .send(editedRecipe)
        .set('authorization', token)
    });

    it('Retorna status 200', () => {
      expect(response).to.have.status(200);
    });

    it('Retorna objeto contendo a receita atualizada', async () => {
      expect(response.body).to.be.deep.equal(
        {...fakeRecipe1, userId, _id: recipeCorrrectUserId, ...editedRecipe}
      );
    });
  });

  describe(('Quando os campos são válidos e o usuário é admin'), () => {
    let response = {};
    
    before(async () => {
      const token = await chai.request(server)
        .post('/login')
        .send({
          email: "root@admin.com",
          password: "admin",
        })
        .then((res) => res.body.token)

      response = await chai.request(server)
        .put(`/recipes/${recipeWrongUserId}`)
        .send(editedRecipe)
        .set('authorization', token)
    });

    it('Retorna status 200', () => {
      expect(response).to.have.status(200);
    });

    it('Retorna objeto contendo a receita atualizada', async () => {
      expect(response.body).to.be.deep.equal(
        {...fakeRecipe2, _id: recipeWrongUserId, ...editedRecipe}
      );
    });
  });
});

describe('8 - DELETE /recipes/:id', () => {
  const INVALID_JWT = { message: "jwt malformed" };
  const MISSING_JWT = { message: "missing auth token" };
  const UNAUTHORIZED = { message: "you can only delete your recipes" };
  const RECIPE_NOT_FOUND = { message: "recipe not found" };


  const fakeRecipe1 = {
    name: "Frango",
    ingredients: "Frango, sazon",
    preparation: "10 minutos no forno",
  }

  const fakeRecipe2 = {
    name: "Peixe",
    ingredients: "Peixe, sazon",
    preparation: "10 minutos no forno",
    userId: "61a69ab8544044df09f66bc9",
  }

  const editedRecipe = {
    name: "Editado",
    ingredients: "Editado, sazon",
    preparation: "20 minutos no forno"
  }

  let connectionMock;
  let db;
  let recipeCorrrectUserId;
  let recipeWrongUserId;
  let userId;

  before(async () => {
    connectionMock = await connection();

    sinon.stub(MongoClient, 'connect').resolves(connectionMock);

    db = connectionMock.db(DB_NAME);

    const { insertedId: user } = await db.collection('users').insertOne({
      name: "Kevin",
      email: "email@email.com",
      password: "12345678",
      role: "user"
    });

    userId = user.toString();

    await db.collection('users').insertOne({
      name: "admin",
      email: "root@admin.com",
      password: "admin",
      role: "admin"
    });

    const { insertedId: id1 } = await db.collection('recipes').insertOne({...fakeRecipe1, userId: userId.toString()});
    const { insertedId: id2 } = await db.collection('recipes').insertOne(fakeRecipe2);
    recipeCorrrectUserId = id1.toString();
    recipeWrongUserId = id2.toString();
  });

  after(async () => {
    MongoClient.connect.restore();
    await db.collection('users').deleteMany({});
    await db.collection('recipes').deleteMany({});
  });

  describe(('Quando o token não é enviado'), () => {
    let response = {};
    
    before(async () => {
      response = await chai.request(server)
        .delete('/recipes/61a69ab8544044df09f66ba7')
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
        .delete('/recipes/61a69ab8544044df09f66ba7')
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

  describe(('Caso o id da receita não exista'), () => {
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
        .delete(`/recipes/61a69ab8544044df09f66ba7`)
        .send(editedRecipe)
        .set('authorization', token)
    });

    it('Retorna status 404', () => {
      expect(response).to.have.status(404);
    });

    it('Retorna objeto com mensagem de erro "recipe not found"', () => {
      expect(response.body).to.be.deep.equal(RECIPE_NOT_FOUND);
    });
  });


  describe(('Quando o usuário não é o criador da receita'), () => {
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
        .delete(`/recipes/${recipeWrongUserId}`)
        .send(editedRecipe)
        .set('authorization', token)
    });

    it('Retorna status 401', () => {
      expect(response).to.have.status(401);
    });

    it('Retorna objeto com mensagem de erro "you can only delete your recipes"', async () => {
      expect(response.body).to.be.deep.equal(UNAUTHORIZED);
    });
  });

  describe(('Quando o usuário é o criador da receita'), () => {
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
        .delete(`/recipes/${recipeCorrrectUserId}`)
        .send(editedRecipe)
        .set('authorization', token)
    });

    it('Retorna status 204', () => {
      expect(response).to.have.status(204);
    });

    it('Não retorna conteúdo', async () => {
      const recipes = await db.collection('recipes').find().toArray();
      expect(response.body).to.be.deep.equal({});
    });

    it('A receita é removida do banco', async () => {
      const recipes = await db.collection('recipes').find().toArray();
      expect(recipes.length).to.be.equal(1);
    });
  });

  describe(('Quando o usuário é admin'), () => {
    let response = {};
    
    before(async () => {
      const token = await chai.request(server)
        .post('/login')
        .send({
          email: "root@admin.com",
          password: "admin",
        })
        .then((res) => res.body.token)

      response = await chai.request(server)
        .delete(`/recipes/${recipeWrongUserId}`)
        .send(editedRecipe)
        .set('authorization', token)
    });

    it('Retorna status 204', () => {
      expect(response).to.have.status(204);
    });

    it('Não retorna conteúdo', async () => {
      expect(response.body).to.be.deep.equal({});
    });

    it('A receita é removida do banco', async () => {
      const recipes = await db.collection('recipes').find().toArray();
      expect(recipes.length).to.be.equal(0);
    });
  });
});

describe('9 - PUT /recipes/:id/image', () => {
  const INVALID_JWT = { message: "jwt malformed" };
  const MISSING_JWT = { message: "missing auth token" };
  const UNAUTHORIZED = { message: "you can only update your recipes" };
  const RECIPE_NOT_FOUND = { message: "recipe not found" };
  const photoFile = path.resolve(__dirname, '../uploads/ratinho.jpg');

  const fakeRecipe1 = {
    name: "Frango",
    ingredients: "Frango, sazon",
    preparation: "10 minutos no forno",
  }

  const fakeRecipe2 = {
    name: "Peixe",
    ingredients: "Peixe, sazon",
    preparation: "10 minutos no forno",
    userId: "61a69ab8544044df09f66bc9",
  }

  let connectionMock;
  let db;
  let recipeCorrrectUserId;
  let recipeWrongUserId;
  let userId;

  before(async () => {
    connectionMock = await connection();

    sinon.stub(MongoClient, 'connect').resolves(connectionMock);

    db = connectionMock.db(DB_NAME);

    const { insertedId: user } = await db.collection('users').insertOne({
      name: "Kevin",
      email: "email@email.com",
      password: "12345678",
      role: "user"
    });

    userId = user.toString();

    await db.collection('users').insertOne({
      name: "admin",
      email: "root@admin.com",
      password: "admin",
      role: "admin"
    });

    const { insertedId: id1 } = await db.collection('recipes').insertOne({...fakeRecipe1, userId: userId.toString()});
    const { insertedId: id2 } = await db.collection('recipes').insertOne(fakeRecipe2);
    recipeCorrrectUserId = id1.toString();
    recipeWrongUserId = id2.toString();
  });

  after(async () => {
    MongoClient.connect.restore();
    await db.collection('users').deleteMany({});
    await db.collection('recipes').deleteMany({});
  });

  describe(('Quando o token não é enviado'), () => {
    let response = {};
    
    before(async () => {
      response = await chai.request(server)
        .put('/recipes/61a69ab8544044df09f66ba7/image')
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
        .put('/recipes/61a69ab8544044df09f66ba7/image')
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

  describe(('Caso o id da receita não exista'), () => {
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
        .put(`/recipes/61a69ab8544044df09f66ba7/image`)
        .attach('image', photoFile)
        .set('authorization', token)
    });

    it('Retorna status 404', () => {
      expect(response).to.have.status(404);
    });

    it('Retorna objeto com mensagem de erro "recipe not found"', () => {
      expect(response.body).to.be.deep.equal(RECIPE_NOT_FOUND);
    });
  });

  describe(('Quando o usuário não é o criador da receita'), () => {
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
        .put(`/recipes/${recipeWrongUserId}/image`)
        .attach('image', photoFile)
        .set('authorization', token)
    });

    it('Retorna status 401', () => {
      expect(response).to.have.status(401);
    });

    it('Retorna objeto com mensagem de erro "you can only update your recipes"', async () => {
      expect(response.body).to.be.deep.equal(UNAUTHORIZED);
    });
  });

  describe(('Quando o usuário é o criador da receita'), () => {
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
        .put(`/recipes/${recipeCorrrectUserId}/image`)
        .attach('image', photoFile)
        .set('authorization', token)
    });

    it('Retorna status 200', () => {
      expect(response).to.have.status(200);
    });

    it('Retorna objeto contendo a receita atualizada com o campo image', async () => {
      expect(response.body).to.be.deep.equal(
        {
          ...fakeRecipe1,
          userId,
          _id: recipeCorrrectUserId,
          image: `localhost:3000/src/uploads/${recipeCorrrectUserId}.jpeg`
        }
      );
    });
  });

  describe(('Quando o usuário é admin'), () => {
    let response = {};
    
    before(async () => {
      const token = await chai.request(server)
        .post('/login')
        .send({
          email: "root@admin.com",
          password: "admin",
        })
        .then((res) => res.body.token)

      response = await chai.request(server)
        .put(`/recipes/${recipeWrongUserId}/image`)
        .attach('image', photoFile)
        .set('authorization', token)
    });

    it('Retorna status 200', () => {
      expect(response).to.have.status(200);
    });

    it('Retorna objeto contendo a receita atualizadacom o campo image', async () => {
      expect(response.body).to.be.deep.equal(
        {
          ...fakeRecipe2,
          _id: recipeWrongUserId,
          image: `localhost:3000/src/uploads/${recipeWrongUserId}.jpeg`
        }
      );
    });
  });
});

describe('10 - GET /images/:id.jpeg', () => {
  const photoFile = path.resolve(__dirname, '../uploads/ratinho.jpg');

  const fakeRecipe1 = {
    name: "Frango",
    ingredients: "Frango, sazon",
    preparation: "10 minutos no forno",
  }

  let connectionMock;
  let db;
  let recipeCorrrectUserId;
  let userId;

  before(async () => {
    connectionMock = await connection();

    sinon.stub(MongoClient, 'connect').resolves(connectionMock);

    db = connectionMock.db(DB_NAME);

    const { insertedId: user } = await db.collection('users').insertOne({
      name: "Kevin",
      email: "email@email.com",
      password: "12345678",
      role: "user"
    });

    userId = user.toString();

    const { insertedId: id1 } = await db.collection('recipes').insertOne({...fakeRecipe1, userId: userId.toString()});
    recipeCorrrectUserId = id1.toString();
  });

  after(async () => {
    MongoClient.connect.restore();
    await db.collection('users').deleteMany({});
    await db.collection('recipes').deleteMany({});
  });

  
  describe(('Quando a rota é acessada'), () => {
    let response = {};
    
    before(async () => {
      const token = await chai.request(server)
        .post('/login')
        .send({
          email: "email@email.com",
          password: "12345678",
        })
        .then((res) => res.body.token)

        await chai.request(server)
        .put(`/recipes/${recipeCorrrectUserId}/image`)
        .attach('image', photoFile)
        .set('authorization', token)

      response = await chai.request(server)
        .get(`/images/${recipeCorrrectUserId}.jpeg`)
    });

    it('Retorna status 200', () => {
      expect(response).to.have.status(200);
    });

    it('Retorna imagem da receita', async () => {
      const image = await fs.readFile(photoFile)
      expect(response.body).to.be.deep.equal(image);
    });
  });
});
