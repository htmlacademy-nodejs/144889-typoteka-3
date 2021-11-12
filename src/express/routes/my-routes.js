'use strict';

const api = require(`../api`).getApi();
const auth = require(`../middlewares/auth`);
const {Router} = require(`express`);

const myRoutes = new Router();
myRoutes.use(auth);

myRoutes.get(`/`, async (req, res) => {
  const {user} = req.session;
  const articles = await api.getArticles({comments: true});
  res.render(`my`, {articles, user});
});

myRoutes.get(`/comments`, async (req, res) => {
  const {user} = req.session;
  const articles = await api.getArticles({comments: true});
  res.render(`comments`, {articles, user});
});

module.exports = myRoutes;
