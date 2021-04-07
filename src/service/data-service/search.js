'use strict';

class SearchService {
  constructor(articles) {
    this._articles = articles;
  }

  findAll(searchText) {
    return this._articles.filter((item) => item.title.toLowerCase().includes(searchText.toLowerCase()));
  }
}

module.exports = SearchService;
