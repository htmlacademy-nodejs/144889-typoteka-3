'use strict';

const {Router} = require(`express`);
const article = require(`../api/article`);
const category = require(`../api/category`);
const search = require(`../api/search`);

const sequelize = require(`../lib/sequelize`);
const defineModels = require(`../models`);

const {
  ArticleService,
  CommentService,
  CategoryService,
  SearchService
} = require(`../data-service`);

const app = new Router();

defineModels(sequelize);

(async () => {
  article(app, new ArticleService(sequelize), new CommentService(sequelize));
  category(app, new CategoryService(sequelize));
  search(app, new SearchService(sequelize));
})();

module.exports = app;
