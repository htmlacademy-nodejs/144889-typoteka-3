'use strict';

const api = require(`../api`).getApi();
const upload = require(`../middlewares/upload`);
const {prepareErrors} = require(`../../utils`);

const {Router} = require(`express`);

const ARTICLES_PER_PAGE = 8;
const MAX_ELEMENTS_PER_BLOCK = 4;

const mainRoutes = new Router();

mainRoutes.get(`/`, async (req, res) => {
  const {user} = req.session;
  let {page = 1} = req.query;
  page = +page;
  const limit = ARTICLES_PER_PAGE;
  const offset = (page - 1) * ARTICLES_PER_PAGE;
  const [{count, articles}, categories, comments] = await Promise.all([
    api.getArticles({offset, limit, comments: true}),
    api.getCategories(true),
    api.getAllComments()
  ]);
  const totalPages = Math.ceil(count / ARTICLES_PER_PAGE);
  const allArticles = articles.filter((item) => item.comments.length > 0);
  allArticles.sort((a, b) => b.comments.length - a.comments.length);
  const bestCommentedArticles = allArticles.slice(0, MAX_ELEMENTS_PER_BLOCK);
  const lastComments = comments.slice(0, MAX_ELEMENTS_PER_BLOCK);
  res.render(`main`, {articles, page, totalPages, categories, user, bestCommentedArticles, lastComments});
});

mainRoutes.get(`/register`, (req, res) => {
  const {user} = req.session;
  res.render(`sign-up`, {user});
});

mainRoutes.post(`/register`, upload.single(`avatar`), async (req, res) => {
  const {body, file} = req;
  const userData = {
    name: body[`name`],
    email: body[`email`],
    password: body[`password`],
    passwordRepeated: body[`repeat-password`]
  };
  if (file) {
    userData.avatar = file.filename;
  }
  try {
    await api.createUser(userData);
    res.redirect(`/login`);
  } catch (errors) {
    const validationMessages = prepareErrors(errors);
    const {user} = req.session;
    res.render(`sign-up`, {validationMessages, user, userData});
  }
});

mainRoutes.get(`/login`, (req, res) => {
  const {user} = req.session;
  res.render(`login`, {user});
});

mainRoutes.post(`/login`, async (req, res) => {
  try {
    const user = await api.auth(req.body[`email`], req.body[`password`]);
    req.session.user = user;
    req.session.save(() => {
      res.redirect(`/`);
    });
  } catch (errors) {
    const validationMessages = prepareErrors(errors);
    const {user} = req.session;
    res.render(`login`, {user, validationMessages});
  }
});

mainRoutes.get(`/logout`, (req, res) => {
  delete req.session.user;
  res.redirect(`/`);
});

mainRoutes.get(`/search`, async (req, res) => {
  const {user} = req.session;
  const {search} = req.query;
  try {
    const results = await api.search(search);
    res.render(`search`, {results, search, user});
  } catch (error) {
    res.render(`search`, {results: [], search, user});
  }
});

module.exports = mainRoutes;
