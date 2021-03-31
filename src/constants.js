'use strict';

const DEFAULT_COMMAND = `--help`;

const USER_ARGV_INDEX = 2;

const maxPostsGenerate = 1000;

const MAX_ID_LENGTH = 6;

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

module.exports = {
  DEFAULT_COMMAND,
  USER_ARGV_INDEX,
  maxPostsGenerate,
  MAX_ID_LENGTH,
  MAX_COMMENTS,
  API_PREFIX,
  ExitCode,
  HttpCode,
};
