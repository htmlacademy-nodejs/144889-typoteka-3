'use strict';

const api = require(`../api`).getApi();
const {Router} = require(`express`);
const mainRoutes = new Router();

const ARTICLES_PER_PAGE = 8;

mainRoutes.get(`/`, async (req, res) => {
  let {page = 1} = req.query;
  page = +page;
  const limit = ARTICLES_PER_PAGE;
  const offset = (page - 1) * ARTICLES_PER_PAGE;
  const [{count, articles}, categories] = await Promise.all([
    api.getArticles({offset, limit, comments: true}),
    api.getCategories(true)
  ]);
  const totalPages = Math.ceil(count / ARTICLES_PER_PAGE);
  res.render(`main`, {articles, page, totalPages, categories});
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
