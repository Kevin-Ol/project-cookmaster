# Projeto Cookmaster

Projeto feito como critério avaliativo na escola de programação **Trybe**.

O projeto é uma API criada utilizando Node.JS juntamente com o pacote Express.JS para a criação das rotas, a biblioteca Joi para validação dos dados enviados, a
biblioteca JWT para autenticação de usuários, e a biblioteca Multer para envio de arquivos. Trata-se de uma API de receitas, capaz de criar, visualizar, 
alterar ou deletar receitas mediante ao cadastro e login de usuários e administradores, onde também é possível cadastrar imagens para estas receitas. Os dados 
são armazenados no banco de dados MongoDB. A API foi desenvolvida com a prática de TDD e testes de integração.

Neste projeto aprendi como criar uma API RESTful em arquitetura MSC, uso de tokens JWT, upload de arquivos com Multer e como escrever seus testes de integração 
utilizando as bibliotecas Mocha, Chain e Sinon.

## Instruções para reproduzir o projeto

1. Inicie o servidor do `mongodb`

2. Clone o repositório
  * `git clone git@github.com:Kevin-Ol/project-cookmaster.git`.
  * Entre na pasta do repositório que você acabou de clonar:
    * `cd project-cookmaster`

3. Instale as dependências
  * `npm install`

---

## Instruções para testar a API

1. Inicie o projeto
  * `npm start`
  
2. Para executar os testes de integração
  * `npm run dev:test`

---

## Rotas

### Endpoint POST `/users`

- O corpo da requisição deve ter o seguinte formato:

```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

- `password` deve ser uma string com pelo menos 8 caracteres;

- `email` deve ser um único;

- Caso haja falha na validação a requisição será respondida com o `status 400` e uma mensagem de erro como o exemplo abaixo:

```json
{
  "message": "Invalid entries. Try again."
}
```

- Caso o email já esteja em uso a requisição será respondida com o `status 409` e uma mensagem de erro como o exemplo abaixo:

```json
{
  "message": "Email already registered"
}
```

- Caso haja sucesso na validação a requisição será respondida com o `status 201` com o seguinte corpo:

```json
{
  "user": {
    "_id": "string"
    "name": "string",
    "email": "string",
    "role": "user"
  }
}
```

### Endpoint POST `/login`

- O corpo da requisição deve ter o seguinte formato:

```json
{
  "email": "string",
  "password": "string"
}
```
- Caso haja falha na validação a requisição será respondida com o `status 401` e uma mensagem de erro como o exemplo abaixo:

```json
{
  "message": "All fields must be filled"
}
```

- Caso haja falha no login a requisição será respondida com o `status 401` e uma mensagem de erro como o exemplo abaixo:

```json
{
  "message": "Incorrect username or password"
}
```

- Caso haja sucesso na validação a requisição será respondida com o `status 200` com o seguinte corpo:

```json
{
  "token": "string"
}
```

### Endpoint POST `/users/admin`

- A rota deve ser autenticada enviando o token como header `authorization` da requisição, que é obtido na rota de login 

- Para registrar um usuário admin, outro usuário admin deve estar logado

- Existe uma query mongo no arquivo `seed.js` para a inserção do primeiro usuário admin

- O corpo da requisição deve ter o seguinte formato:

```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

- `password` deve ser uma string com pelo menos 8 caracteres;

- `email` deve ser um único;

- Caso o token não seja enviado a requisição será respondida com o `status 401` e uma mensagem de erro como o exemplo abaixo:

```json
{
  "message": "missing auth token"
}
```

- Caso o token não seja válido a requisição será respondida com o `status 401` e uma mensagem de erro como o exemplo abaixo:

```json
{
  "message": "jwt malformed"
}
```

- Caso haja falha na validação a requisição será respondida com o `status 400` e uma mensagem de erro como o exemplo abaixo:

```json
{
  "message": "Invalid entries. Try again."
}
```

- Caso o email já esteja em uso a requisição será respondida com o `status 409` e uma mensagem de erro como o exemplo abaixo:

```json
{
  "message": "Email already registered"
}
```

- Caso um usuário não admin tente cadastrar um novo admin a requisição será respondida com o `status 403` e uma mensagem de erro como o exemplo abaixo:

```json
{
  "message": "Only admins can register new admins"
}
```

- Caso haja sucesso na validação a requisição será respondida com o `status 201` com o seguinte corpo:

```json
{
  "user": {
    "_id": "string"
    "name": "string",
    "email": "string",
    "role": "admin"
  }
}
```

### Endpoint POST `/recipes`

- A rota deve ser autenticada enviando o token como header `authorization` da requisição, que é obtido na rota de login 

- O corpo da requisição deve ter o seguinte formato:

```json
{
  "name": "string",
  "ingredients": "string",
  "preparation": "string"
}
```

- Caso o token não seja enviado a requisição será respondida com o `status 401` e uma mensagem de erro como o exemplo abaixo:

```json
{
  "message": "missing auth token"
}
```

- Caso o token não seja válido a requisição será respondida com o `status 401` e uma mensagem de erro como o exemplo abaixo:

```json
{
  "message": "jwt malformed"
}
```

- Caso haja falha na validação a requisição será respondida com o `status 400` e uma mensagem de erro como o exemplo abaixo:

```json
{
  "message": "Invalid entries. Try again."
}
```

- Caso haja sucesso na validação a requisição será respondida com o `status 201` com o seguinte corpo:

```json
{
  "recipe": {
    "name": "string",
    "ingredients": "string",
    "preparation": "string",
    "_id": "string"
    "userId": "string"
  }
}
```

### Endpoint GET `/recipes`

- A rota retorna com o `status 200` um array com todas receitas cadastradas: 

```json
[
  {
    "name": "string",
    "ingredients": "string",
    "preparation": "string",
    "_id": "string",
    "userId": "string"
  },
  {
    "name": "string",
    "ingredients": "string",
    "preparation": "string",
    "_id": "string",
    "userId": "string"
  },
]
```

### Endpoint GET `/recipes/:id`

- A rota retorna com o `status 200` um array com a receita cadastrada correspondente ao id na url : 

```json
{
  "name": "string",
  "ingredients": "string",
  "preparation": "string",
  "_id": "string",
  "userId": "string"
}
```
- Caso a receita não exista a requisição será respondida com o `status 404` e uma mensagem de erro como o exemplo abaixo:

```json
{
  "message": "recipe not found"
}
```

### Endpoint PUT `/recipes/:id`

- A rota deve ser autenticada enviando o token como header `authorization` da requisição, que é obtido na rota de login 

- A receita só pode ser alterada por quem a criou ou por um usuário admin

- O corpo da requisição deve ter o seguinte formato:

```json
{
  "name": "string",
  "ingredients": "string",
  "preparation": "string"
}
```

- Caso o token não seja enviado a requisição será respondida com o `status 401` e uma mensagem de erro como o exemplo abaixo:

```json
{
  "message": "missing auth token"
}
```

- Caso o token não seja válido a requisição será respondida com o `status 401` e uma mensagem de erro como o exemplo abaixo:

```json
{
  "message": "jwt malformed"
}
```

- Caso haja falha na validação a requisição será respondida com o `status 400` e uma mensagem de erro como o exemplo abaixo:

```json
{
  "message": "Invalid entries. Try again."
}
```

- Caso a receita não exista a requisição será respondida com o `status 404` e uma mensagem de erro como o exemplo abaixo:

```json
{
  "message": "recipe not found"
}
```

- Caso o usuário não seja dono da receita nem admin a requisição será respondida com o `status 401` e uma mensagem de erro como o exemplo abaixo:

```json
{
  "message": "you can only update your recipes"
}
```

- Caso haja sucesso na validação a requisição será respondida com o `status 200` com o seguinte corpo:

```json
{
  "name": "string",
  "ingredients": "string",
  "preparation": "string",
  "_id": "string"
  "userId": "string"
}
```

### Endpoint DELETE `/recipes/:id`

- A rota deve ser autenticada enviando o token como header `authorization` da requisição, que é obtido na rota de login 

- A receita só pode ser deletada por quem a criou ou por um usuário admin

- Caso o token não seja enviado a requisição será respondida com o `status 401` e uma mensagem de erro como o exemplo abaixo:

```json
{
  "message": "missing auth token"
}
```

- Caso o token não seja válido a requisição será respondida com o `status 401` e uma mensagem de erro como o exemplo abaixo:

```json
{
  "message": "jwt malformed"
}
```

- Caso a receita não exista a requisição será respondida com o `status 404` e uma mensagem de erro como o exemplo abaixo:

```json
{
  "message": "recipe not found"
}
```

- Caso o usuário não seja dono da receita nem admin a requisição será respondida com o `status 401` e uma mensagem de erro como o exemplo abaixo:

```json
{
  "message": "you can only delete your recipes"
}
```

- Caso haja sucesso na validação a requisição será respondida com o `status 204` e sem conteúdo

### Endpoint PUT `/recipes/:id/image`

- A rota deve ser autenticada enviando o token como header `authorization` da requisição, que é obtido na rota de login 

- A imagem só pode ser inserida por quem criou a receita ou por um usuário admin

- O corpo da requisição deve ter o formato `multipart/form-data` e a imagem deve ser enviada no campo `image`

- O nome da imagem será salvo como `idDaReceita.jpeg`

- Caso o token não seja enviado a requisição será respondida com o `status 401` e uma mensagem de erro como o exemplo abaixo:

```json
{
  "message": "missing auth token"
}
```

- Caso o token não seja válido a requisição será respondida com o `status 401` e uma mensagem de erro como o exemplo abaixo:

```json
{
  "message": "jwt malformed"
}
```

- Caso haja falha na validação a requisição será respondida com o `status 400` e uma mensagem de erro como o exemplo abaixo:

```json
{
  "message": "Invalid entries. Try again."
}
```

- Caso a receita não exista a requisição será respondida com o `status 404` e uma mensagem de erro como o exemplo abaixo:

```json
{
  "message": "recipe not found"
}
```

- Caso o usuário não seja dono da receita nem admin a requisição será respondida com o `status 401` e uma mensagem de erro como o exemplo abaixo:

```json
{
  "message": "you can only update your recipes"
}
```

- Caso haja sucesso na validação a requisição será respondida com o `status 200` com o seguinte corpo:

```json
{
  "name": "string",
  "ingredients": "string",
  "preparation": "string",
  "_id": "string",
  "userId": "string",
  "image": "string"
}
```

### Endpoint GET `/recipes/<id-da-receita>.jpeg`

- A rota retorna com o `status 200` a imagem da receita cadastrada correspondente ao id na url
