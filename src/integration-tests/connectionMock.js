const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient } = require('mongodb');

const OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

let DBServer;
let URLMock;

const connection = async () => {
  if (DBServer) {
    return MongoClient.connect(URLMock, OPTIONS);
  }

  DBServer = new MongoMemoryServer;
  URLMock = await DBServer.getUri();

  return MongoClient.connect(URLMock, OPTIONS);
};

module.exports = connection; 

//connectionMock feito com a ajuda de Roberval T12
//https://github.com/tryber/sd-012-cookmaster/blob/47e962b75615d6d348bc4007a0123715e87bb191/src/integration-tests/connectionMock.js
