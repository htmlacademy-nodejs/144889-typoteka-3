'use strict';

const DEFAULT_COMMAND = `--help`;

const USER_ARGV_INDEX = 2;

const MAX_COMMENTS = 4;

const API_PREFIX = `/api`;

const ExitCode = {
  ERROR: 1,
  SUCCESS: 0,
};

const HttpCode = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  FORBIDDEN: 403,
  UNAUTHORIZED: 401,
};

const Env = {
  DEVELOPMENT: `development`,
  PRODUCTION: `production`
};

const HttpMethod = {
  GET: `GET`,
  POST: `POST`,
  PUT: `PUT`,
  DELETE: `DELETE`
};

const Instances = {
  COMMENT: `comment`,
  ARTICLE: `article`,
  CATEGORY: `category`
};

const FILE_TYPES = [`image/png`, `image/jpg`, `image/jpeg`];

module.exports = {
  DEFAULT_COMMAND,
  USER_ARGV_INDEX,
  MAX_COMMENTS,
  API_PREFIX,
  ExitCode,
  HttpCode,
  Env,
  HttpMethod,
  Instances,
  FILE_TYPES
};
