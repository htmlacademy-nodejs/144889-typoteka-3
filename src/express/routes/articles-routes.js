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

const ARTICLES_PER_PAGE = 8;

articlesRoutes.get(`/category/:categoryId`, async (req, res) => {
  const {user} = req.session;
  const {categoryId} = req.params;
  let {page = 1} = req.query;
  page = +page;
  const limit = ARTICLES_PER_PAGE;
  const offset = (page - 1) * ARTICLES_PER_PAGE;

  const [{category, count, articlesByCategory}, categories] = await Promise.all([
    api.getCategory({categoryId, offset, limit}),
    api.getCategories(true)
  ]);
  const totalPages = Math.ceil(count / ARTICLES_PER_PAGE);

  res.render(`articles-by-category`, {user, articles: articlesByCategory, category, categories, count, page, totalPages});
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
    announce: body.announce,
    fullText: body.fullText,
    categories: Array.isArray(body.categories) ? body.categories : [body.categories],
    userId: user.id,
    createDate: new Date(body.createDate),
    photo: file.filename
  };

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

  const updateArticle = {
    title: body.title,
    announce: body.announcement,
    fullText: body.fullText,
    categories: Array.isArray(body.categories) ? body.categories : [body.categories],
    photo: file ? file.filename : body[`photo`],
    userId: user.id,
    createDate: new Date(body.createDate)
  };

  try {
    await api.updateArticle(updateArticle, id);
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

articlesRoutes.get(`/delete/:id`, async (req, res) => {
  const {user} = req.session;
  const {id} = req.params;

  try {
    await api.removeArticle(id);
    res.redirect(`/my`);
  } catch (errors) {
    const allArticles = await api.getArticles({comments: true});
    const validationMessages = prepareErrors(errors);
    res.render(`my`, {articles: allArticles, user, validationMessages});
  }
});

articlesRoutes.get(`/delete/:articleId/comments/:commentId`, async (req, res) => {
  const {user} = req.session;
  const {articleId, commentId} = req.params;

  try {
    await api.removeComment(articleId, commentId);
    res.redirect(`/my/comments`);
  } catch (errors) {
    const comments = await api.getAllComments(user.id);
    const validationMessages = prepareErrors(errors);
    res.render(`comments`, {comments, user, validationMessages});
  }
});

module.exports = articlesRoutes;
