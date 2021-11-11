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
    avatar: `avatar-1.png`
  },
  {
    name: `Пётр Петров`,
    email: `petrov@example.com`,
    passwordHash: passwordUtils.hashSync(`petrov`),
    avatar: `avatar-2.png`
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
