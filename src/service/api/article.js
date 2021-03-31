'use strict';

const {Router} = require(`express`);
const {HttpCode} = require(`../../constants`);
const articleExist = require(`../middlewares/articleExist`);
const instanceValidator = require(`../middlewares/instanceValidator`);

const articleKeys = [`title`, `announce`, `fullText`, `category`];
const commentKeys = [`text`];

module.exports = (app, articleService, commentService) => {
  const route = new Router();
  app.use(`/articles`, route);

  // GET /api/articles
  route.get(`/`, (req, res) => {
    const articles = articleService.findAll();
    res.status(HttpCode.OK).json(articles);
  });

  // GET /api/articles/:articleId
  route.get(`/:articleId`, (req, res) => {
    const {articleId} = req.params;
    const article = articleService.findOne(articleId);

    if (!article) {
      return res.status(HttpCode.NOT_FOUND)
        .send(`Not found article with id ${articleId}`);
    }

    return res.status(HttpCode.OK)
        .json(article);
  });

  // POST /api/articles
  route.post(`/`, instanceValidator(articleKeys), (req, res) => {
    const article = articleService.create(req.body);

    return res.status(HttpCode.CREATED)
      .json(article);
  });

  // PUT /api/articles/:articleId
  route.put(`/:articleId`, instanceValidator(articleKeys), (req, res) => {
    const {articleId} = req.params;
    const existArticle = articleService.findOne(articleId);

    if (!existArticle) {
      return res.status(HttpCode.NOT_FOUND)
        .send(`Not found article with id ${articleId}`);
    }

    const updatedArticle = articleService.update(articleId, req.body);

    return res.status(HttpCode.OK)
      .json(updatedArticle);
  });

  // DELETE /api/articles/:articleId
  route.delete(`/:articleId`, (req, res) => {
    const {articleId} = req.params;
    const deletedArticle = articleService.delete(articleId);

    if (!deletedArticle) {
      return res.status(HttpCode.NOT_FOUND)
        .send(`Not found article with id ${articleId}`);
    }

    return res.status(HttpCode.OK)
      .json(deletedArticle);
  });

  // GET /api/articles/:articleId/comments
  route.get(`/:articleId/comments`, articleExist(articleService), (req, res) => {
    const {article} = res.locals;
    const comments = commentService.findAll(article);

    return res.status(HttpCode.OK)
        .json(comments);
  });

  // DELETE /api/articles/:articleId/comments/:commentId
  route.delete(`/:articleId/comments/:commentId`, articleExist(articleService), (req, res) => {
    const {article} = res.locals;
    const {commentId} = req.params;
    const deletedComment = commentService.delete(article, commentId);

    if (!deletedComment) {
      return res.status(HttpCode.NOT_FOUND)
        .send(`Not found comment with id ${commentId}`);
    }

    return res.status(HttpCode.OK)
      .json(deletedComment);
  });

  // POST /api/articles/:articleId/comments
  route.post(`/:articleId/comments`, [articleExist(articleService), instanceValidator(commentKeys)], (req, res) => {
    const {article} = res.locals;
    const createdComment = commentService.create(article, req.body);

    return res.status(HttpCode.CREATED)
      .json(createdComment);
  });
};
