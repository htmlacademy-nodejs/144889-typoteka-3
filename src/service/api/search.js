'use strict';

const {Router} = require(`express`);
const {HttpCode} = require(`../../constants`);

module.exports = (app, searchService) => {
  const route = new Router();
  app.use(`/search`, route);

  route.get(`/`, async (req, res) => {
    const {query = ``} = req.query;

    if (!query) {
      res.status(HttpCode.BAD_REQUEST)
      .send(`Search query should not be empty`);
      return;
    }

    const searchResults = await searchService.findAll(query);

    res.status(HttpCode.OK)
      .json(searchResults);
  });
};
