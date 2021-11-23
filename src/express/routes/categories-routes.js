'use strict';

const api = require(`../api`).getApi();
const {Router} = require(`express`);
const csrf = require(`csurf`);

const {prepareErrors} = require(`../../utils`);
const auth = require(`../middlewares/auth`);

const categoriesRoutes = new Router();
const csrfProtection = csrf();

categoriesRoutes.get(`/`, auth, csrfProtection, async (req, res) => {
  const {user} = req.session;
  const categories = await api.getCategories(true);

  res.render(`all-categories`, {user, categories, csrfToken: req.csrfToken()});
});

categoriesRoutes.post(`/add`, csrfProtection, async (req, res) => {
  const {user} = req.session;

  try {
    await api.createCategory({name: req.body.newCategory});
    res.redirect(`/categories`);
  } catch (errors) {
    const validationMessages = prepareErrors(errors);
    const categories = await api.getCategories(true);
    res.render(`all-categories`, {user, categories, validationMessages, csrfToken: req.csrfToken()});
  }
});

categoriesRoutes.post(`/edit/:id`, csrfProtection, async (req, res) => {
  const {user} = req.session;
  const {id} = req.params;

  try {
    await api.updateCategory({name: req.body.name}, id);
    res.redirect(`/categories`);
  } catch (errors) {
    const validationMessages = prepareErrors(errors);
    const categories = await api.getCategories();
    res.render(`all-categories`, {user, categories, validationMessages, csrfToken: req.csrfToken()});
  }
});

categoriesRoutes.get(`/delete/:id`, csrfProtection, async (req, res) => {
  const {user} = req.session;
  const {id} = req.params;

  try {
    await api.removeCategory(id);
    res.redirect(`/categories`);
  } catch (errors) {
    const categories = await api.getCategories(true);
    const validationMessages = prepareErrors(errors);
    res.render(`all-categories`, {user, categories, validationMessages, csrfToken: req.csrfToken()});
  }
});

module.exports = categoriesRoutes;
