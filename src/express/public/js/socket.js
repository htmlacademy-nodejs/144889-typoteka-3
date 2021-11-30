'use strict';

(() => {
  const SERVER_URL = `http://localhost:3000`;

  const createNewCommentElement = (comment) => {
    const commentTemplate = document.querySelector('#last-comment-template');
    const newCommentElement = commentTemplate.cloneNode(true).content;

    newCommentElement.querySelector('.last__list-image').src = `/img/${comment.users.avatar || `avatar-sample.png`}`;
    newCommentElement.querySelector('.last__list-image').alt = 'Аватар пользователя';
    newCommentElement.querySelector('.last__list-image').width = '20';
    newCommentElement.querySelector('.last__list-image').height = '20';
    newCommentElement.querySelector('.last__list-name').textContent = comment.users.name;
    newCommentElement.querySelector('.last__list-link').href = `/articles/${comment.articleId}`;
    newCommentElement.querySelector('.last__list-link').textContent = comment.length > 100 ? comment.text.slice(0, 100).concat('...') : comment.text;

    return newCommentElement;
  };

  const createNewCommentedArticleElement = (article) => {
    const articleTemplate = document.querySelector('#best-commented-articles-template');
    const newArticleElement = articleTemplate.cloneNode(true).content;

    newArticleElement.querySelector('.hot__list-link').href = `/articles/${article.id}`;
    const count = `<sup class="hot__link-sup">${article.comments.length}</sup>`;
    const announce = article.announce.length > 100 ? article.announce.slice(0, 100).concat('...') : article.announce;
    newArticleElement.querySelector('.hot__list-link').innerHTML = announce + count;

    return newArticleElement;
  };

  const updateLastCommentsElements = (comment) => {
    const lastCommentsBlock = document.querySelector('.main-page__last');
    const lastCommentsElements = lastCommentsBlock.querySelector('ul');
    const commentsElements = lastCommentsElements.querySelectorAll('li');

    commentsElements[commentsElements.length - 1].remove();
    lastCommentsElements.prepend(createNewCommentElement(comment));
  };

  const updateBestCommentedArticlesElements = (articles) => {
    const articlesBlock = document.querySelector('.main-page__hot');
    const articlesBlockElements = articlesBlock.querySelector('ul');
    const articlesElements = articlesBlockElements.querySelectorAll('li');
    articles.forEach((article, index) => {
      articlesElements[index].remove();
      articlesBlockElements.append(createNewCommentedArticleElement(article))
    });
  };

  const socket = io(SERVER_URL);
  socket.addEventListener('comment:create', (comment, articles) => {
    updateLastCommentsElements(comment);
    updateBestCommentedArticlesElements(articles);
  });
})();
