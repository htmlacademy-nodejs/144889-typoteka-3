'use strict';

const Joi = require(`joi`);

const {Instances} = require(`../../constants`);

const ErrorCommentMessage = {
  TEXT_MIN: `Комментарий содержит меньше 20 символов`,
  TEXT_MAX: `Комментарий не может содержать более 500 символов`
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
};

const commentSchema = Joi.object({
  text: Joi.string().min(20).max(500).required().messages({
    'string.min': ErrorCommentMessage.TEXT_MIN,
    'string.max': ErrorCommentMessage.TEXT_MAX,
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
  photo: Joi.string().messages({
    'string.empty': ErrorArticleMessage.PHOTO
  })
});

const routeParamsSchema = Joi.object({
  offerId: Joi.number().integer().min(1),
  commentId: Joi.number().integer().min(1)
});

module.exports = {
  [Instances.COMMENT]: commentSchema,
  [Instances.ARTICLE]: articleSchema,
  routeParamsSchema
};
