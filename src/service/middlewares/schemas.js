'use strict';

const Joi = require(`joi`);

const {Instances} = require(`../../constants`);

const ErrorCommentMessage = {
  TEXT_MIN: `Комментарий содержит меньше 20 символов`,
  TEXT_MAX: `Комментарий не может содержать более 500 символов`,
  USER_ID: `Некорректный идентификатор пользователя`
};

const ErrorArticleMessage = {
  CATEGORIES: `Не выбрана ни одна категория объявления`,
  TITLE_MIN: `Заголовок содержит меньше 10 символов`,
  TITLE_MAX: `Заголовок не может содержать более 70 символов`,
  ANNOUNCE_MIN: `Краткое описание содержит меньше 100 символов`,
  ANNOUNCE_MAX: `Краткое описание не может содержать более 300 символов`,
  FULLTEXT_MIN: `Текст статьи содержит меньше 100 символов`,
  FULLTEXT_MAX: `Текст статьи не может содержать более 1000 символов`,
  PHOTO: `Изображение не выбрано или тип изображения не поддерживается`,
  USER_ID: `Некорректный идентификатор пользователя`
};

const ErrorUserMessage = {
  NAME: `Имя содержит некорректные символы`,
  EMAIL: `Некорректный электронный адрес`,
  PASSWORD: `Пароль содержит меньше 6-ти символов`,
  PASSWORD_REPEATED: `Пароли не совпадают`,
  AVATAR: `Изображение не выбрано или тип изображения не поддерживается`
};

const commentSchema = Joi.object({
  text: Joi.string().min(20).max(500).required().messages({
    'string.min': ErrorCommentMessage.TEXT_MIN,
    'string.max': ErrorCommentMessage.TEXT_MAX,
  }),
  userId: Joi.number().integer().positive().required().messages({
    'number.base': ErrorCommentMessage.USER_ID
  })
});

const articleSchema = Joi.object({
  categories: Joi.array().items(
      Joi.number().integer().positive().messages({
        'number.base': ErrorArticleMessage.CATEGORIES
      })
  ).min(1).required(),
  title: Joi.string().min(10).max(70).required().messages({
    'string.min': ErrorArticleMessage.TITLE_MIN,
    'string.max': ErrorArticleMessage.TITLE_MAX
  }),
  announce: Joi.string().min(100).max(300).required().messages({
    'string.min': ErrorArticleMessage.ANNOUNCE_MIN,
    'string.max': ErrorArticleMessage.ANNOUNCE_MAX
  }),
  fullText: Joi.string().min(100).max(1000).required().messages({
    'string.min': ErrorArticleMessage.FULLTEXT_MIN,
    'string.max': ErrorArticleMessage.FULLTEXT_MAX
  }),
  photo: Joi.string().required().messages({
    'string.empty': ErrorArticleMessage.PHOTO
  }),
  userId: Joi.number().integer().positive().required().messages({
    'number.base': ErrorArticleMessage.USER_ID
  })
});

const userSchema = Joi.object({
  name: Joi.string().pattern(/[^0-9$&+,:;=?@#|'<>.^*()%!]+$/).required().messages({
    'string.pattern.base': ErrorUserMessage.NAME
  }),
  email: Joi.string().email().required().messages({
    'string.email': ErrorUserMessage.EMAIL
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': ErrorUserMessage.PASSWORD
  }),
  passwordRepeated: Joi.string().required().valid(Joi.ref(`password`)).required().messages({
    'any.only': ErrorUserMessage.PASSWORD_REPEATED
  }),
  avatar: Joi.string().required().messages({
    'string.empty': ErrorUserMessage.AVATAR
  })
});

const routeParamsSchema = Joi.object({
  articleId: Joi.number().integer().min(1),
  commentId: Joi.number().integer().min(1)
});

module.exports = {
  [Instances.COMMENT]: commentSchema,
  [Instances.ARTICLE]: articleSchema,
  userSchema,
  routeParamsSchema
};
