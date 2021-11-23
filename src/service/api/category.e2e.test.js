'use strict';

const express = require(`express`);
const request = require(`supertest`);
const Sequelize = require(`sequelize`);

const category = require(`./category`);
const CategoryService = require(`../data-service/category`);
const initDB = require(`../lib/init-db`);
const passwordUtils = require(`../lib/password`);
const {HttpCode} = require(`../../constants`);
const mockData = require(`./_stubs/category.json`);
const mockCategories = [`Деревья`, `За жизнь`, `Без рамки`, `Разное`, `IT`, `Музыка`];
const mockUsers = [
  {
    name: `Иван Иванов`,
    email: `ivanov@example.com`,
    passwordHash: passwordUtils.hashSync(`ivanov`),
    avatar: `avatar-1.png`,
    isOwner: true
  },
  {
    name: `Пётр Петров`,
    email: `petrov@example.com`,
    passwordHash: passwordUtils.hashSync(`petrov`),
    avatar: `avatar-2.png`,
    isOwner: false
  }
];

const mockDB = new Sequelize(`sqlite::memory:`, {logging: false});

const app = express();
app.use(express.json());

beforeAll(async () => {
  await initDB(mockDB, {categories: mockCategories, articles: mockData, users: mockUsers});
  category(app, new CategoryService(mockDB));
});

describe(`Category API returns category list`, () => {

  let response;

  beforeAll(async () => {
    response = await request(app)
      .get(`/categories`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`Returns list of 6 categories`, () => expect(response.body.length).toBe(6));

  test(`Category names are "Музыка", "За жизнь", "Разное", "IT"`,
      () => expect(response.body.map((it) => it.name)).toEqual(
          expect.arrayContaining([`Деревья`, `За жизнь`, `Без рамки`, `Разное`, `IT`, `Музыка`])
      )
  );

});

describe(`Category API returns list of articles related to defined category`, () => {

  let response;

  beforeAll(async () => {
    response = await request(app)
      .get(`/categories/6`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`Returns list of 1 article`, () => expect(response.body.count).toBe(1));

  test(`Returns category name`, () => expect(response.body.category.name).toBe(`Музыка`));

  test(`Article's title equals "Как начать программировать"`,
      () => expect(response.body.articlesByCategory[0].title).toBe(`Как начать программировать`)
  );

});

describe(`Category API creates a category if data is valid`, () => {

  let response;

  beforeAll(async () => {
    response = await request(app)
      .post(`/categories`)
      .send({name: `Политика`});
  });

  test(`Status code 201`, () => expect(response.statusCode).toBe(HttpCode.CREATED));

  test(`Categories count is changed`, () => request(app)
    .get(`/categories`)
    .expect((res) => expect(res.body.length).toBe(7))
  );

  test(`Created category name is "Политика"`, () => expect(response.body.name).toBe(`Политика`));

});

describe(`Category API refuses to create a category if data is invalid`, () => {

  let response;

  beforeAll(async () => {
    response = await request(app)
      .post(`/categories`)
      .send({title: `Политика`});
  });

  test(`Status code 400`, () => expect(response.statusCode).toBe(HttpCode.BAD_REQUEST));

});

describe(`Category API changes existent category`, () => {

  let response;

  beforeAll(async () => {
    response = await request(app)
      .put(`/categories/5`)
      .send({name: `Информационные технологии`});
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`Changed category name is equal to "Информационные технологии"`, () => request(app)
    .get(`/categories/5`)
    .expect((res) => expect(res.body.category.name).toBe(`Информационные технологии`))
  );
});

describe(`Category API refuses to change category if data is invalid`, () => {

  let response;

  beforeAll(async () => {
    response = await request(app)
      .put(`/categories/5`)
      .send({title: `Информационные технологии`});
  });

  test(`Status code 400`, () => expect(response.statusCode).toBe(HttpCode.BAD_REQUEST));

});

describe(`Category API refuses to change non-existent category`, () => {

  let response;

  beforeAll(async () => {
    response = await request(app)
      .put(`/categories/50`)
      .send({name: `Информационные технологии`});
  });

  test(`Status code 404`, () => expect(response.statusCode).toBe(HttpCode.NOT_FOUND));

});

describe(`Category API correctly deletes a category`, () => {

  let response;

  beforeAll(async () => {
    response = await request(app)
      .delete(`/categories/7`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`Categories count is 6 now`, () => request(app)
    .get(`/categories`)
    .expect((res) => expect(res.body.length).toBe(6))
  );
});

describe(`Category API refuses to delete category with articles related`, () => {

  let response;

  beforeAll(async () => {
    response = await request(app)
      .delete(`/categories/6`);
  });

  test(`Status code 403`, () => expect(response.statusCode).toBe(HttpCode.FORBIDDEN));
});

describe(`Category API refuses to delete non-existent category`, () => {

  let response;

  beforeAll(async () => {
    response = await request(app)
      .delete(`/categories/60`);
  });

  test(`Status code 404`, () => expect(response.statusCode).toBe(HttpCode.NOT_FOUND));
});
