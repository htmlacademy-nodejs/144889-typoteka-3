'use strict';

const {Router} = require(`express`);
const {HttpCode, Instance} = require(`../../constants`);
const articleExist = require(`../middlewares/article-exist`);
const instanceValidator = require(`../middlewares/instance-validator`);
const routeParamsValidator = require(`../middlewares/route-params-validator`);

module.exports = (app, articleService, commentService) => {
  const route = new Router();
  app.use(`/articles`, route);

  // GET /api/articles
  route.get(`/`, async (req, res) => {
    const {offset, limit, comments} = req.query;
    let result;
    if (limit || offset) {
      result = await articleService.findPage({limit, offset, comments});
    } else {
      result = await articleService.findAll(comments);
    }
    res.status(HttpCode.OK).json(result);
  });

  // GET /api/articles/comments
  route.get(`/comments`, async (req, res) => {
    const result = await commentService.findAllComments();
    res.status(HttpCode.OK).json(result);
  });

  // GET /api/articles/:articleId
  route.get(`/:articleId`, routeParamsValidator, async (req, res) => {
    const {articleId} = req.params;
    const {comments} = req.query;
    const article = await articleService.findOne(articleId, comments);

    if (!article) {
      return res.status(HttpCode.NOT_FOUND)
        .send(`Not found article with id ${articleId}`);
    }

    return res.status(HttpCode.OK)
        .json(article);
  });

  // POST /api/articles
  route.post(`/`, instanceValidator(Instance.ARTICLE), async (req, res) => {
    const article = await articleService.create(req.body);
    return res.status(HttpCode.CREATED)
      .json(article);
  });

  // PUT /api/articles/:articleId
  route.put(`/:articleId`, [routeParamsValidator, instanceValidator(Instance.ARTICLE)], async (req, res) => {
    const {articleId} = req.params;
    const updatedArticle = await articleService.update(articleId, req.body);

    if (!updatedArticle) {
      return res.status(HttpCode.NOT_FOUND)
        .send(`Not found article with id ${articleId}`);
    }

    return res.status(HttpCode.OK).send(`Article successfully updated`);
  });

  // DELETE /api/articles/:articleId
  route.delete(`/:articleId`, [routeParamsValidator, articleExist(articleService)], async (req, res) => {
    const {articleId} = req.params;
    const article = await articleService.findOne(articleId, {comments: true});
    const comments = article.comments.map((item) => item.id);
    const deletedArticle = await articleService.delete(articleId);
    const deletedComments = await Promise.all(comments.map((commentId) => commentService.delete(commentId)));

    if (!deletedArticle) {
      return res.status(HttpCode.NOT_FOUND)
        .send(`Not found article with id ${articleId}`);
    }

    const allCommentsDeleted = deletedComments.every((item) => item);
    if (!allCommentsDeleted) {
      return res.status(HttpCode.NOT_FOUND)
        .send(`Some comments not found`);
    }

    return res.status(HttpCode.OK).send(`Article and comments successfully deleted`);
  });

  // GET /api/articles/:articleId/comments
  route.get(`/:articleId/comments`, [routeParamsValidator, articleExist(articleService)], async (req, res) => {
    const {articleId} = req.params;
    const comments = await commentService.findAll(articleId);

    return res.status(HttpCode.OK)
        .json(comments);
  });

  // DELETE /api/articles/:articleId/comments/:commentId
  route.delete(`/:articleId/comments/:commentId`, [routeParamsValidator, articleExist(articleService)], async (req, res) => {
    const {commentId} = req.params;
    const deletedComment = await commentService.delete(commentId);

    if (!deletedComment) {
      return res.status(HttpCode.NOT_FOUND)
        .send(`Not found comment with id ${commentId}`);
    }

    return res.status(HttpCode.OK).send(`Comment successfully deleted`);
  });

  // POST /api/articles/:articleId/comments
  route.post(`/:articleId/comments`, [routeParamsValidator, articleExist(articleService), instanceValidator(Instance.COMMENT)], async (req, res) => {
    const {articleId} = req.params;
    const createdComment = await commentService.create(articleId, req.body);
    const allArticles = await articleService.findAll(true);

    const articlesWithComments = allArticles.filter((item) => item.comments.length > 0);
    articlesWithComments.sort((a, b) => b.comments.length - a.comments.length);
    const bestCommentedArticles = articlesWithComments.slice(0, 4);

    const io = req.app.locals.socketio;
    if (io) {
      io.emit(`comment:create`, createdComment, bestCommentedArticles);
    }

    return res.status(HttpCode.CREATED).json(createdComment);
  });
};
