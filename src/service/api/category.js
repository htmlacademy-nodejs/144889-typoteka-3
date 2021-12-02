'use strict';

const {Router} = require(`express`);
const {HttpCode, Instance} = require(`../../constants`);
const instanceValidator = require(`../middlewares/instance-validator`);

module.exports = (app, categoryService) => {
  const route = new Router();
  app.use(`/categories`, route);

  // GET /api/categories
  route.get(`/`, async (req, res) => {
    const {count} = req.query;
    const categories = await categoryService.findAll(count);

    res.status(HttpCode.OK)
      .json(categories);
  });

  // GET /api/categories/:categoryId
  route.get(`/:categoryId`, async (req, res) => {
    const {categoryId} = req.params;
    const {limit, offset} = req.query;

    const category = await categoryService.findOne(categoryId);
    const {count, articlesByCategory} = await categoryService.findPage(categoryId, limit, offset);

    res.status(HttpCode.OK)
      .json({category, count, articlesByCategory});
  });

  // POST /api/categories/
  route.post(`/`, instanceValidator(Instance.CATEGORY), async (req, res) => {
    const createdCategory = await categoryService.create(req.body);

    return res.status(HttpCode.CREATED).json(createdCategory);
  });

  // PUT /api/categories/:categoryId
  route.put(`/:categoryId`, instanceValidator(Instance.CATEGORY), async (req, res) => {
    const {categoryId} = req.params;
    const updatedCategory = await categoryService.update(categoryId, req.body);

    if (!updatedCategory) {
      return res.status(HttpCode.NOT_FOUND)
        .send(`Not found article with id ${categoryId}`);
    }

    return res.status(HttpCode.OK).send(`Category successfully updated`);
  });

  // DELETE /api/categories/:categoryId
  route.delete(`/:categoryId`, async (req, res) => {
    const {categoryId} = req.params;
    const categories = await categoryService.findAll(true);
    const categoryToRemove = categories.find((category) => category.id === +categoryId);

    if (!categoryToRemove) {
      return res.status(HttpCode.NOT_FOUND)
        .send(`Not found category with id ${categoryId}`);
    }

    if (+categoryToRemove.count) {
      return res.status(HttpCode.FORBIDDEN)
        .send(`Can not remove category with articles related!`);
    }

    const deletedCategory = await categoryService.delete(categoryId);
    if (!deletedCategory) {
      return res.status(HttpCode.NOT_FOUND)
        .send(`Not found category with id ${categoryId}`);
    }

    return res.status(HttpCode.OK).send(`Category successfully deleted`);
  });
};
