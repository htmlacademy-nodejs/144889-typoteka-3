'use strict';

const api = require(`../api`).getApi();
const {Router} = require(`express`);

const upload = require(`../middlewares/upload`);
const {prepareErrors} = require(`../../utils`);

const articlesRoutes = new Router();

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

articlesRoutes.get(`/category/:id`, (req, res) => res.render(`articles-by-category`));

articlesRoutes.get(`/add`, async (req, res) => {
  const categories = await getArticleCategories();
  res.render(`new-post`, {categories});
});

articlesRoutes.post(`/add`, upload.single(`upload`), async (req, res) => {
  const {body, file} = req;
  const articleData = {
    title: body.title,
    announce: body.announcement,
    fullText: body.fullText,
    categories: Array.isArray(body.categories) ? body.categories : [body.categories]
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
    res.render(`new-post`, {categories, validationMessages});
  }
});

articlesRoutes.get(`/edit/:id`, async (req, res) => {
  const {id} = req.params;
  const [article, categories] = await getEditArticleData(id);
  res.render(`edit-post`, {article, categories});
});

articlesRoutes.post(`/edit/:id`, upload.single(`upload`), async (req, res) => {
  const {body, file} = req;
  const {id} = req.params;
  const currentArticle = await api.getArticle(id);

  const updateArticle = {
    title: body.title,
    announce: body.announcement,
    fullText: body.fullText,
    categories: Array.isArray(body.categories) ? body.categories : [body.categories]
  };

  if (file) {
    updateArticle.picture = file.filename;
  }

  const articleData = Object.assign(currentArticle, updateArticle);

  try {
    await api.updateArticle(articleData, id);
    res.redirect(`/my`);
  } catch (errors) {
    const validationMessages = prepareErrors(errors);
    const [article, categories] = await getEditArticleData(id);
    res.render(`edit-post`, {article, categories, validationMessages});
  }
});

articlesRoutes.get(`/:id`, async (req, res) => {
  const {id} = req.params;
  const article = await getViewArticleData(id, true);

  res.render(`post`, {article});
});

articlesRoutes.post(`/:id/comments`, async (req, res) => {
  const {id} = req.params;
  const {comment} = req.body;

  try {
    await api.createComment(id, {text: comment});
    res.redirect(`/articles/${id}`);
  } catch (errors) {
    const validationMessages = prepareErrors(errors);
    const article = await getViewArticleData(id, true);
    res.render(`post`, {article, comment, validationMessages});
  }
});

module.exports = articlesRoutes;
