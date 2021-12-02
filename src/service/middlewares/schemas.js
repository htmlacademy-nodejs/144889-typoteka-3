'use strict';

const Joi = require(`joi`);

const {Instance} = require(`../../constants`);

const ErrorCommentMessage = {
  TEXT_MIN: `Комментарий содержит меньше 20 символов`,
  TEXT_MAX: `Комментарий не может содержать более 500 символов`,
  USER_ID: `Некорректный идентификатор пользователя`
};

const ErrorArticleMessage = {
  CATEGORIES: `Не выбрана ни одна категория объявления`,
  TITLE_MIN: `Заголовок содержит меньше 30 символов`,
  TITLE_MAX: `Заголовок не может содержать более 70 символов`,
  ANNOUNCE_MIN: `Краткое описание содержит меньше 30 символов`,
  ANNOUNCE_MAX: `Краткое описание не может содержать более 250 символов`,
  FULLTEXT_MAX: `Текст статьи не может содержать более 1000 символов`,
  PHOTO: `Тип изображения не поддерживается`,
  USER_ID: `Некорректный идентификатор пользователя`
};

const ErrorUserMessage = {
  NAME: `Имя содержит некорректные символы`,
  EMAIL: `Некорректный электронный адрес`,
  PASSWORD: `Пароль содержит меньше 6-ти символов`,
  PASSWORD_REPEATED: `Пароли не совпадают`
};

const ErrorCategoryMessage = {
  NAME_MIN: `Название категории содержит меньше 5 символов`,
  NAME_MAX: `Название категории не может содержать более 30 символов`,
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
  title: Joi.string().min(30).max(250).required().messages({
    'string.min': ErrorArticleMessage.TITLE_MIN,
    'string.max': ErrorArticleMessage.TITLE_MAX
  }),
  announce: Joi.string().min(30).max(250).required().messages({
    'string.min': ErrorArticleMessage.ANNOUNCE_MIN,
    'string.max': ErrorArticleMessage.ANNOUNCE_MAX
  }),
  fullText: Joi.string().max(1000).messages({
    'string.max': ErrorArticleMessage.FULLTEXT_MAX
  }),
  photo: Joi.string().allow(null).messages({
    'string.empty': ErrorArticleMessage.PHOTO
  }),
  userId: Joi.number().integer().positive().required().messages({
    'number.base': ErrorArticleMessage.USER_ID
  }),
  createDate: Joi.date().required(),
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
  avatar: Joi.string(),
  isOwner: Joi.boolean(),
});

const routeParamsSchema = Joi.object({
  articleId: Joi.number().integer().min(1),
  commentId: Joi.number().integer().min(1)
});

const categorySchema = Joi.object({
  name: Joi.string().min(5).max(30).required().messages({
    'string.min': ErrorCategoryMessage.NAME_MIN,
    'string.max': ErrorCategoryMessage.NAME_MAX,
  })
});

module.exports = {
  [Instance.COMMENT]: commentSchema,
  [Instance.ARTICLE]: articleSchema,
  [Instance.CATEGORY]: categorySchema,
  userSchema,
  routeParamsSchema
};
