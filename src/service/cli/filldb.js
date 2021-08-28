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
const initDatabase = require(`../lib/init-db`);

const {MAX_COMMENTS, ExitCode} = require(`../../constants`);

const DEFAULT_COUNT = 1;

const FILE_SENTENCES_PATH = `./data/sentences.txt`;
const FILE_TITLES_PATH = `./data/titles.txt`;
const FILE_CATEGORIES_PATH = `./data/categories.txt`;
const FILE_COMMENTS_PATH = `./data/comments.txt`;

const readFile = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, `utf8`);
    return content.split(`\n`);
  } catch (err) {
    console.error(chalk.red(err));
    return [];
  }
};

const generatePosts = (count, [sentences, titles, categories, comments]) => (
  Array(count).fill({}).map(() => ({
    title: titles[getRandomInt(0, titles.length - 1)],
    createDate: getRandomDate(),
    announce: shuffle(sentences).slice(1, 5).join(` `),
    fullText: shuffle(sentences).slice(1, getRandomInt(6, (sentences.length - 1))).join(` `),
    categories: getRandomSubarray(categories),
    comments: generateComments(MAX_COMMENTS, comments),
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

    const data = await Promise.all([readFile(FILE_SENTENCES_PATH), readFile(FILE_TITLES_PATH), readFile(FILE_CATEGORIES_PATH), readFile(FILE_COMMENTS_PATH)]);

    const [count] = args;
    const countPosts = Number.parseInt(count, 10) || DEFAULT_COUNT;
    const articles = generatePosts(countPosts, data);
    const categories = data[2];

    return initDatabase(sequelize, {articles, categories});
  }
};
