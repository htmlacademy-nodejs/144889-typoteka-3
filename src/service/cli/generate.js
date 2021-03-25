'use strict';
const {
  getRandomInt,
  shuffle,
  getRandomDate,
  getRandomArrayPart,
  generateComments
} = require(`../../utils`);
const fs = require(`fs`).promises;
const chalk = require(`chalk`);
const {nanoid} = require(`nanoid`);

const {maxPostsGenerate, MAX_ID_LENGTH, MAX_COMMENTS} = require(`../../constants`);

const DEFAULT_COUNT = 1;
const FILE_NAME = `mocks.json`;

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
    id: nanoid(MAX_ID_LENGTH),
    title: titles[getRandomInt(0, titles.length - 1)],
    createDate: getRandomDate(),
    announce: shuffle(sentences).slice(1, 5).join(` `),
    fullText: shuffle(sentences).slice(1, getRandomInt(6, (sentences.length - 1))).join(` `),
    category: getRandomArrayPart(categories),
    comments: generateComments(MAX_COMMENTS, comments),
  }))
);

module.exports = {
  name: `--generate`,
  async run(args) {
    const data = await Promise.all([readFile(FILE_SENTENCES_PATH), readFile(FILE_TITLES_PATH), readFile(FILE_CATEGORIES_PATH), readFile(FILE_COMMENTS_PATH)]);

    const [count] = args;
    const countPosts = Number.parseInt(count, 10) || DEFAULT_COUNT;
    if (countPosts > maxPostsGenerate) {
      console.error(chalk.red(`You can generate max 1000 posts!`));
      return;
    }
    const content = JSON.stringify(generatePosts(countPosts, data));
    try {
      await fs.writeFile(FILE_NAME, content);
      console.info(chalk.green(`Operation success. File created.`));
    } catch (err) {
      console.error(chalk.red(`Can't write data to file...`));
    }
  }
};
