'use strict';

const {HttpCode} = require(`../../constants`);
const schemas = require(`./schemas`);

module.exports = (instanceType) => (req, res, next) => {
  const newInstance = req.body;

  const schema = schemas[instanceType];
  const {error} = schema.validate(newInstance, {abortEarly: false});

  if (error) {
    res.status(HttpCode.BAD_REQUEST)
      .send(error.details.map((err) => err.message).join(`\n`));
    return;
  }

  next();
};
