'use strict';

const express = require(`express`);
const request = require(`supertest`);
const Sequelize = require(`sequelize`);

const user = require(`./user`);
const UserService = require(`../data-service/user`);
const initDB = require(`../lib/init-db`);
const passwordUtils = require(`../lib/password`);
const {HttpCode} = require(`../../constants`);
const mockData = require(`./_stubs/article.json`);
const mockCategories = [`Деревья`, `За жизнь`, `Без рамки`, `Разное`, `IT`, `Музыка`];
const mockUsers = [
  {
    name: `Иван Иванов`,
    email: `ivanov@example.com`,
    passwordHash: passwordUtils.hashSync(`ivanov`),
    avatar: `avatar-1.png`
  },
  {
    name: `Пётр Петров`,
    email: `petrov@example.com`,
    passwordHash: passwordUtils.hashSync(`petrov`),
    avatar: `avatar-2.png`
  }
];

const createAPI = async () => {
  const mockDB = new Sequelize(`sqlite::memory:`, {logging: false});
  await initDB(mockDB, {categories: mockCategories, articles: mockData, users: mockUsers});
  const app = express();
  app.use(express.json());
  user(app, new UserService(mockDB));
  return app;
};

describe(`Users API creates user if data is valid`, () => {
  const validUserData = {
    name: `Сидор Сидоров`,
    email: `sidorov@example.com`,
    password: `sidorov`,
    passwordRepeated: `sidorov`,
    avatar: `sidorov.jpg`
  };

  let response;

  beforeAll(async () => {
    let app = await createAPI();
    response = await request(app)
      .post(`/user`)
      .send(validUserData);
  });

  test(`Status code 201`, () => expect(response.statusCode).toBe(HttpCode.CREATED));
});

describe(`Users API refuses to create user if data is invalid`, () => {
  const validUserData = {
    name: `Сидор Сидоров`,
    email: `sidorov@example.com`,
    password: `sidorov`,
    passwordRepeated: `sidorov`,
    avatar: `sidorov.jpg`
  };

  let app;

  beforeAll(async () => {
    app = await createAPI();
  });

  test(`Without any required property response code is 400`, async () => {
    for (const key of Object.keys(validUserData)) {
      const badUserData = {...validUserData};
      delete badUserData[key];
      await request(app)
        .post(`/user`)
        .send(badUserData)
        .expect(HttpCode.BAD_REQUEST);
    }
  });

  test(`When field type is wrong response code is 400`, async () => {
    const badUsers = [
      {...validUserData, firstName: true},
      {...validUserData, email: 1}
    ];
    for (const badUserData of badUsers) {
      await request(app)
        .post(`/user`)
        .send(badUserData)
        .expect(HttpCode.BAD_REQUEST);
    }
  });

  test(`When field value is wrong response code is 400`, async () => {
    const badUsers = [
      {...validUserData, password: `short`, passwordRepeated: `short`},
      {...validUserData, email: `invalid`}
    ];
    for (const badUserData of badUsers) {
      await request(app)
        .post(`/user`)
        .send(badUserData)
        .expect(HttpCode.BAD_REQUEST);
    }
  });

  test(`When password and passwordRepeated are not equal, code is 400`, async () => {
    const badUserData = {...validUserData, passwordRepeated: `not sidorov`};
    await request(app)
      .post(`/user`)
      .send(badUserData)
      .expect(HttpCode.BAD_REQUEST);
  });

  test(`When email is already in use status code is 400`, async () => {
    const badUserData = {...validUserData, email: `ivanov@example.com`};
    await request(app)
      .post(`/user`)
      .send(badUserData)
      .expect(HttpCode.BAD_REQUEST);
  });
});

describe(`Users API authenticate user if data is valid`, () => {
  const validAuthData = {
    email: `ivanov@example.com`,
    password: `ivanov`
  };

  let response;

  beforeAll(async () => {
    const app = await createAPI();
    response = await request(app)
      .post(`/user/auth`)
      .send(validAuthData);
  });

  test(`Status code is 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`User name is Иван Иванов`, () => expect(response.body.name).toBe(`Иван Иванов`));
});

describe(`Users API refuses to authenticate user if data is invalid`, () => {
  let app;

  beforeAll(async () => {
    app = await createAPI();
  });

  test(`If email is incorrect status is 401`, async () => {
    const badAuthData = {
      email: `not-exist@example.com`,
      password: `petrov`
    };
    await request(app)
      .post(`/user/auth`)
      .send(badAuthData)
      .expect(HttpCode.UNAUTHORIZED);
  });

  test(`If password doesn't match status is 401`, async () => {
    const badAuthData = {
      email: `petrov@example.com`,
      password: `ivanov`
    };
    await request(app)
      .post(`/user/auth`)
      .send(badAuthData)
      .expect(HttpCode.UNAUTHORIZED);
  });
});
