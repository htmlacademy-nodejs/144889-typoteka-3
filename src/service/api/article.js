'use strict';

const {Router} = require(`express`);
const {HttpCode, instances} = require(`../../constants`);
const articleExist = require(`../middlewares/articleExist`);
const instanceValidator = require(`../middlewares/instanceValidator`);

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

  // GET /api/articles/:articleId
  route.get(`/:articleId`, async (req, res) => {
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
  route.post(`/`, instanceValidator(instances.ARTICLE), async (req, res) => {
    const article = await articleService.create(req.body);
    return res.status(HttpCode.CREATED)
      .json(article);
  });

  // PUT /api/articles/:articleId
  route.put(`/:articleId`, instanceValidator(instances.ARTICLE), async (req, res) => {
    const {articleId} = req.params;
    const updatedArticle = await articleService.update(articleId, req.body);

    if (!updatedArticle) {
      return res.status(HttpCode.NOT_FOUND)
        .send(`Not found article with id ${articleId}`);
    }

    return res.status(HttpCode.OK).send(`Article successfully updated`);
  });

  // DELETE /api/articles/:articleId
  route.delete(`/:articleId`, async (req, res) => {
    const {articleId} = req.params;
    const deletedArticle = await articleService.delete(articleId);

    if (!deletedArticle) {
      return res.status(HttpCode.NOT_FOUND)
        .send(`Not found article with id ${articleId}`);
    }

    return res.status(HttpCode.OK).send(`Article successfully deleted`);
  });

  // GET /api/articles/:articleId/comments
  route.get(`/:articleId/comments`, articleExist(articleService), async (req, res) => {
    const {articleId} = req.params;
    const comments = await commentService.findAll(articleId);

    return res.status(HttpCode.OK)
        .json(comments);
  });

  // DELETE /api/articles/:articleId/comments/:commentId
  route.delete(`/:articleId/comments/:commentId`, articleExist(articleService), async (req, res) => {
    const {commentId} = req.params;
    const deletedComment = await commentService.delete(commentId);

    if (!deletedComment) {
      return res.status(HttpCode.NOT_FOUND)
        .send(`Not found comment with id ${commentId}`);
    }

    return res.status(HttpCode.OK).send(`Comment successfully deleted`);
  });

  // POST /api/articles/:articleId/comments
  route.post(`/:articleId/comments`, [articleExist(articleService), instanceValidator(instances.COMMENT)], async (req, res) => {
    const {articleId} = req.params;
    const createdComment = await commentService.create(articleId, req.body);

    return res.status(HttpCode.CREATED).json(createdComment);
  });
};
