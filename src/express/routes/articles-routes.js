'use strict';

const {Router} = require(`express`);
const articlesRoutes = new Router();

articlesRoutes.get(`/category/:id`, (req, res) => res.render(`articles-by-category`));
articlesRoutes.get(`/add`, (req, res) => res.render(`new-post`));
articlesRoutes.get(`/edit/:id`, (req, res) => res.render(`new-post`)); // нет шаблона
articlesRoutes.get(`/:id`, (req, res) => res.render(`post`));

module.exports = articlesRoutes;
