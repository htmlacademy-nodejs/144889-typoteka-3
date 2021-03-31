'use strict';

const express = require(`express`);
const request = require(`supertest`);

const category = require(`./category`);
const CategoryService = require(`../data-service/category`);

const {HttpCode} = require(`../../constants`);
const mockData = require(`./_stubs/category.json`);

const app = express();
app.use(express.json());
category(app, new CategoryService(mockData));

describe(`Category API returns category list`, () => {

  let response;

  beforeAll(async () => {
    response = await request(app)
      .get(`/categories`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`Returns list of 4 categories`, () => expect(response.body.length).toBe(4));

  test(`Category names are "Музыка", "За жизнь", "Разное", "IT"`,
      () => expect(response.body).toEqual(
          expect.arrayContaining([`Музыка`, `За жизнь`, `Разное`, `IT`])
      )
  );

});
