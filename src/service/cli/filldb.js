'use strict';
const {
  getRandomInt,
  shuffle,
  getRandomDate,
  generateComments,
  getRandomSubarray
} = require(`../../utils`);
const fs = require(`fs`).promises;
const chalk = require(`chalk`);
const {getLogger} = require(`../lib/logger`);
const sequelize = require(`../lib/sequelize`);
const passwordUtils = require(`../lib/password`);
const initDatabase = require(`../lib/init-db`);

const {MAX_COMMENTS, ExitCode} = require(`../../constants`);

const DEFAULT_COUNT = 1;

const FilePath = {
  SENTENCES: `./data/sentences.txt`,
  TITLES: `./data/titles.txt`,
  CATEGORIES: `./data/categories.txt`,
  COMMENTS: `./data/comments.txt`
};

const readFile = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, `utf8`);
    return content.split(`\n`);
  } catch (err) {
    console.error(chalk.red(err));
    return [];
  }
};

const generatePosts = (count, [sentences, titles, categories, comments], users) => (
  Array(count).fill({}).map(() => ({
    title: titles[getRandomInt(0, titles.length - 1)],
    createDate: getRandomDate(),
    announce: shuffle(sentences).slice(1, 5).join(` `),
    fullText: shuffle(sentences).slice(1, getRandomInt(6, (sentences.length - 1))).join(` `),
    categories: getRandomSubarray(categories),
    comments: generateComments(MAX_COMMENTS, comments, users),
    user: users[getRandomInt(0, users.length - 1)].email,
    photo: `sea-fullsize@1x.jpg`
  }))
);

const logger = getLogger();

module.exports = {
  name: `--filldb`,
  async run(args) {
    try {
      logger.info(`Trying to connect to database...`);
      await sequelize.authenticate();
    } catch (err) {
      logger.error(`An error occurred: ${err.message}`);
      process.exit(ExitCode.ERROR);
    }
    logger.info(`The connection to database is established`);

    const data = await Promise.all([readFile(FilePath.SENTENCES), readFile(FilePath.TITLES), readFile(FilePath.CATEGORIES), readFile(FilePath.COMMENTS)]);
    const users = [
      {
        name: `Иван Иванов`,
        email: `ivanov@example.com`,
        passwordHash: await passwordUtils.hash(`ivanov`),
        avatar: `avatar-1.png`,
        isOwner: true
      },
      {
        name: `Пётр Петров`,
        email: `petrov@example.com`,
        passwordHash: await passwordUtils.hash(`petrov`),
        isOwner: false
      }
    ];

    const [count] = args;
    const countPosts = Number.parseInt(count, 10) || DEFAULT_COUNT;
    const articles = generatePosts(countPosts, data, users);
    const categories = data[2];

    return initDatabase(sequelize, {articles, categories, users});
  }
};
