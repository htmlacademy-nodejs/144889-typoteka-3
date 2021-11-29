'use strict';

const axios = require(`axios`);

const {HttpMethod} = require(`../constants`);
const TIMEOUT = 1000;
const port = process.env.API_PORT || 3000;
const defaultUrl = `http://localhost:${port}/api/`;

class API {

  constructor(baseURL, timeout) {
    this._http = axios.create({
      baseURL,
      timeout
    });
  }

  async _load(url, options) {
    const response = await this._http.request({url, ...options});
    return response.data;
  }

  getArticles({offset, limit, comments}) {
    return this._load(`/articles`, {params: {offset, limit, comments}});
  }

  getArticle(id, comments) {
    return this._load(`/articles/${id}`, {params: {comments}});
  }

  getAllComments() {
    return this._load(`/articles/comments`);
  }

  search(query) {
    return this._load(`/search`, {params: {query}});
  }

  getCategories(count) {
    return this._load(`/categories`, {params: {count}});
  }

  getCategory({categoryId, offset, limit}) {
    return this._load(`/categories/${categoryId}`, {params: {limit, offset}});
  }

  createCategory(data) {
    return this._load(`/categories`, {
      method: HttpMethod.POST,
      data
    });
  }

  updateCategory(data, id) {
    return this._load(`/categories/${id}`, {
      method: HttpMethod.PUT,
      data
    });
  }

  removeCategory(id) {
    return this._load(`/categories/${id}`, {
      method: HttpMethod.DELETE
    });
  }

  createArticle(data) {
    return this._load(`/articles`, {
      method: HttpMethod.POST,
      data
    });
  }

  updateArticle(data, id) {
    return this._load(`/articles/${id}`, {
      method: HttpMethod.PUT,
      data
    });
  }

  removeArticle(id) {
    return this._load(`/articles/${id}`, {
      method: HttpMethod.DELETE
    });
  }

  createComment(id, data) {
    return this._load(`/articles/${id}/comments`, {
      method: HttpMethod.POST,
      data
    });
  }

  removeComment(articleId, commentId) {
    return this._load(`/articles/${articleId}/comments/${commentId}`, {
      method: HttpMethod.DELETE
    });
  }

  createUser(data) {
    return this._load(`/user`, {
      method: HttpMethod.POST,
      data
    });
  }

  auth(email, password) {
    return this._load(`/user/auth`, {
      method: HttpMethod.POST,
      data: {email, password}
    });
  }
}

const defaultAPI = new API(defaultUrl, TIMEOUT);

module.exports = {
  API,
  getApi: () => defaultAPI
};
