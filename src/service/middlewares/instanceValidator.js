'use strict';

const {HttpCode} = require(`../../constants`);

module.exports = (keysToCheck) => (req, res, next) => {
  const newInstance = req.body;
  const keys = Object.keys(newInstance);
  const keysExists = keysToCheck.every((key) => keys.includes(key));

  if (!keysExists) {
    res.status(HttpCode.BAD_REQUEST)
      .send(`Bad request`);
    return;
  }

  next();
};
