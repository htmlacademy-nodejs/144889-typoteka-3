'use strict';

const {Router} = require(`express`);
const article = require(`../api/article`);
const category = require(`../api/category`);
const search = require(`../api/search`);

const getMockData = require(`../lib/getMockData`);

const {
  ArticleService,
  CommentService,
  CategoryService,
  SearchService
} = require(`../data-service`);

const app = new Router();

(async () => {
  const mockData = await getMockData();

  article(app, new ArticleService(mockData), new CommentService(mockData));
  category(app, new CategoryService(mockData));
  search(app, new SearchService(mockData));
})();

module.exports = app;
