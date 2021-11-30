'use strict';

const Aliase = require(`../models/aliase`);

class CommentService {
  constructor(sequelize) {
    this._Article = sequelize.models.Article;
    this._Comment = sequelize.models.Comment;
    this._User = sequelize.models.User;
  }

  async create(articleId, comment) {
    const createdComment = await this._Comment.create({articleId, ...comment});
    const newComment = await this._Comment.findOne({
      where: {id: createdComment.id},
      include: [
        {
          model: this._User,
          as: Aliase.USERS,
          attributes: {
            exclude: [`passwordHash`]
          }
        }
      ]
    });
    return newComment;
  }

  async delete(id) {
    const deletedRows = await this._Comment.destroy({
      where: {id}
    });

    return !!deletedRows;
  }

  async findAll(articleId) {
    const comments = await this._Comment.findAll({
      where: {articleId},
      raw: true
    });
    return comments;
  }

  async findAllComments() {
    const queryParams = {
      include: [
        {
          model: this._User,
          as: Aliase.USERS,
          attributes: {
            exclude: [`passwordHash`]
          }
        },
        {
          model: this._Article,
          as: Aliase.ARTICLES,
          attributes: {
            exclude: [`announce`, `fullText`, `photo`, `userId`, `createdAt`, `updatedAt`]
          }
        }
      ],
      order: [
        [`createdAt`, `DESC`]
      ]
    };

    const comments = await this._Comment.findAll(queryParams);
    return comments;
  }
}

module.exports = CommentService;
