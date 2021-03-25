'use strict';

const {nanoid} = require(`nanoid`);
const {MAX_ID_LENGTH} = require(`../../constants`);

class CommentService {
  create(article, comment) {
    const newComment = Object
      .assign({id: nanoid(MAX_ID_LENGTH)}, comment);

    article.comments.push(newComment);
    return newComment;
  }

  delete(article, commentId) {
    const deleteComment = article.comments.find((item) => item.id === commentId);

    if (!deleteComment) {
      return null;
    }

    article.comments = article.comments.filter((item) => item.id !== commentId);
    return deleteComment;
  }

  findAll(article) {
    return article.comments;
  }
}

module.exports = CommentService;
