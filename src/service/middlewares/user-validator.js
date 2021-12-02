'use strict';

const {HttpCode} = require(`../../constants`);
const {userSchema} = require(`./schemas`);

module.exports = (service) => async (req, res, next) => {
  const newUser = req.body;
  const {error} = userSchema.validate(newUser, {abortEarly: false});

  if (error) {
    return res.status(HttpCode.BAD_REQUEST)
      .send(error.details.map((err) => err.message).join(`\n`));
  }

  const userByEmail = await service.findByEmail(req.body.email);

  if (userByEmail) {
    return res.status(HttpCode.BAD_REQUEST)
      .send(`Электронный адрес уже используется`);
  }

  return next();
};
