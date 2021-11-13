'use strict';

const api = require(`../api`).getApi();
const {Router} = require(`express`);
const csrf = require(`csurf`);

const upload = require(`../middlewares/upload`);
const {prepareErrors} = require(`../../utils`);
const auth = require(`../middlewares/auth`);

const articlesRoutes = new Router();
const csrfProtection = csrf();

const getArticleCategories = async () => {
  return await api.getCategories();
};

const getEditArticleData = async (articleId) => {
  const [article, categories] = await Promise.all([
    api.getArticle(articleId),
    api.getCategories()
  ]);
  return [article, categories];
};

const getViewArticleData = async (articleId, comments) => {
  return await api.getArticle(articleId, comments);
};

articlesRoutes.get(`/category/:id`, (req, res) => {
  const {user} = req.session;
  res.render(`articles-by-category`, {user});
});

articlesRoutes.get(`/add`, auth, csrfProtection, async (req, res) => {
  const {user} = req.session;
  const categories = await getArticleCategories();
  res.render(`new-post`, {categories, user, csrfToken: req.csrfToken()});
});

articlesRoutes.post(`/add`, auth, upload.single(`upload`), csrfProtection, async (req, res) => {
  const {user} = req.session;
  const {body, file} = req;
  const articleData = {
    title: body.title,
    announce: body.announcement,
    fullText: body.fullText,
    categories: Array.isArray(body.categories) ? body.categories : [body.categories],
    userId: user.id
  };

  if (file) {
    articleData.photo = file.filename;
  }

  try {
    await api.createArticle(articleData);
    res.redirect(`/my`);
  } catch (errors) {
    const validationMessages = prepareErrors(errors);
    const categories = await getArticleCategories();
    res.render(`new-post`, {categories, validationMessages, user, csrfToken: req.csrfToken()});
  }
});

articlesRoutes.get(`/edit/:id`, auth, csrfProtection, async (req, res) => {
  const {user} = req.session;
  const {id} = req.params;
  const [article, categories] = await getEditArticleData(id);
  res.render(`edit-post`, {article, categories, user, csrfToken: req.csrfToken()});
});

articlesRoutes.post(`/edit/:id`, auth, upload.single(`upload`), csrfProtection, async (req, res) => {
  const {user} = req.session;
  const {body, file} = req;
  const {id} = req.params;
  const currentArticle = await api.getArticle(id);

  const updateArticle = {
    title: body.title,
    announce: body.announcement,
    fullText: body.fullText,
    categories: Array.isArray(body.categories) ? body.categories : [body.categories],
    photo: file ? file.filename : body[`photo`],
    userId: user.id
  };

  const articleData = Object.assign(currentArticle, updateArticle);

  try {
    await api.updateArticle(articleData, id);
    res.redirect(`/my`);
  } catch (errors) {
    const validationMessages = prepareErrors(errors);
    const [article, categories] = await getEditArticleData(id);
    res.render(`edit-post`, {article, categories, validationMessages, user, csrfToken: req.csrfToken()});
  }
});

articlesRoutes.get(`/:id`, csrfProtection, async (req, res) => {
  const {user} = req.session;
  const {id} = req.params;
  const article = await getViewArticleData(id, true);

  res.render(`post`, {article, user, csrfToken: req.csrfToken()});
});

articlesRoutes.post(`/:id/comments`, csrfProtection, async (req, res) => {
  const {user} = req.session;
  const {id} = req.params;
  const {comment} = req.body;

  try {
    await api.createComment(id, {text: comment, userId: user.id});
    res.redirect(`/articles/${id}`);
  } catch (errors) {
    const validationMessages = prepareErrors(errors);
    const article = await getViewArticleData(id, true);
    res.render(`post`, {article, comment, validationMessages, user, csrfToken: req.csrfToken()});
  }
});

module.exports = articlesRoutes;
