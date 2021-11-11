'use strict';

const ArticleService = require(`./article`);
const CommentService = require(`./comment`);
const CategoryService = require(`./category`);
const SearchService = require(`./search`);
const UserService = require(`./user`);

module.exports = {
  ArticleService,
  CommentService,
  CategoryService,
  SearchService,
  UserService
};
