'use strict';

const DEFAULT_COMMAND = `--help`;

const USER_ARGV_INDEX = 2;

const ExitCode = {
  ERROR: 1,
  SUCCESS: 0,
};

const HttpCode = {
  OK: 200,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  FORBIDDEN: 403,
  UNAUTHORIZED: 401,
};

const maxPostsGenerate = 1000;

module.exports = {
  DEFAULT_COMMAND,
  USER_ARGV_INDEX,
  ExitCode,
  maxPostsGenerate,
  HttpCode
};
