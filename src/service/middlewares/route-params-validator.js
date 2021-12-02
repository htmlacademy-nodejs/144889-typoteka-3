'use strict';

const {HttpCode} = require(`../../constants`);
const {routeParamsSchema} = require(`./schemas`);

module.exports = (req, res, next) => {
  const params = req.params;
  const {error} = routeParamsSchema.validate(params);

  if (error) {
    return res.status(HttpCode.BAD_REQUEST)
      .send(error.details.map((err) => err.message).join(`\n`));
  }
  return next();
};
