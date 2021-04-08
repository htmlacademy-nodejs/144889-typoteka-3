'use strict';

const api = require(`../api`).getApi();
const {Router} = require(`express`);
const mainRoutes = new Router();

mainRoutes.get(`/`, async (req, res) => {
  const articles = await api.getArticles();
  res.render(`main`, {articles});
});
mainRoutes.get(`/register`, (req, res) => res.render(`sign-up`));
mainRoutes.get(`/login`, (req, res) => res.render(`login`));
mainRoutes.get(`/search`, async (req, res) => {
  const {search} = req.query;
  try {
    const results = await api.search(search);

    res.render(`search`, {results, search});
  } catch (error) {
    res.render(`search`, {results: [], search});
  }
});
mainRoutes.get(`/categories`, (req, res) => res.render(`all-categories`));

module.exports = mainRoutes;
