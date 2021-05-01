'use strict';
const {
  getRandomInt,
  shuffle,
  getRandomArrayPart
} = require(`../../utils`);
const fs = require(`fs`).promises;
const chalk = require(`chalk`);

const {MAX_COMMENTS} = require(`../../constants`);

const DEFAULT_COUNT = 1;
const FILE_NAME = `fill-db.sql`;

const SOURCES = {
  SENTENCES: `./data/sentences.txt`,
  TITLES: `./data/titles.txt`,
  CATEGORIES: `./data/categories.txt`,
  COMMENTS: `./data/comments.txt`
};

const users = [
  {
    email: `ivanov@example.com`,
    passwordHash: `5f4dcc3b5aa765d61d8327deb882cf99`,
    firstName: `Иван`,
    lastName: `Иванов`,
    avatar: `avatar1.jpg`
  },
  {
    email: `petrov@example.com`,
    passwordHash: `5f4dcc3b5aa765d61d8327deb882cf99`,
    firstName: `Пётр`,
    lastName: `Петров`,
    avatar: `avatar2.jpg`
  }
];

const readFile = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, `utf8`);
    return content.split(`\n`);
  } catch (err) {
    console.error(chalk.red(err));
    return [];
  }
};

const generateComments = (count, articleId, userCount, comments) => (
  Array(count).fill({}).map(() => ({
    userId: getRandomInt(1, userCount),
    articleId,
    text: shuffle(comments)
      .slice(0, getRandomInt(1, 3))
      .join(` `),
  }))
);

const generateArticles = (count, titles, categories, userCount, sentences, comments) => (
  Array(count).fill({}).map((_, index) => ({
    title: titles[getRandomInt(0, titles.length - 1)],
    announce: shuffle(sentences).slice(1, 5).join(` `),
    fullText: shuffle(sentences).slice(1, getRandomInt(6, (sentences.length - 1))).join(` `),
    category: getRandomArrayPart(categories),
    comments: generateComments(getRandomInt(2, MAX_COMMENTS), index + 1, userCount, comments),
    userId: getRandomInt(1, userCount)
  }))
);

module.exports = {
  name: `--fill`,
  async run(args) {
    const data = await Promise.all(Object.values(SOURCES).map((path) => readFile(path)));
    const [sentences, titles, categories, commentSentences] = data;
    const [count] = args;
    const countArticles = Number.parseInt(count, 10) || DEFAULT_COUNT;

    const articles = generateArticles(countArticles, titles, categories, users.length, sentences, commentSentences);
    const comments = articles.flatMap((article) => article.comments);
    const articlesCategories = [];
    articles.forEach((article, index) => {
      return article.category.forEach((category) => (
        articlesCategories.push({articleId: index + 1, categoryId: categories.indexOf(category) + 1})
      ));
    });

    const userValues = users.map(
        ({email, passwordHash, firstName, lastName, avatar}) =>
          `('${email}', '${passwordHash}', '${firstName}', '${lastName}', '${avatar}')`
    ).join(`,\n`);

    const categoryValues = categories.map((name) => `('${name}')`).join(`,\n`);

    const articleValues = articles.map(
        ({title, announce, fullText, userId}) =>
          `('${title}', '${announce}', '${fullText}', ${userId})`
    ).join(`,\n`);

    const articleCategoryValues = articlesCategories.map(
        ({articleId, categoryId}) =>
          `(${articleId}, ${categoryId})`
    ).join(`,\n`);

    const commentValues = comments.map(
        ({text, userId, articleId}) =>
          `('${text}', ${userId}, ${articleId})`
    ).join(`,\n`);

    const content = `
/* fills users table */
INSERT INTO users(email, password_hash, first_name, last_name, avatar) VALUES
${userValues};

/* fills categories table */
INSERT INTO categories(name) VALUES
${categoryValues};

/* fills articles table */
ALTER TABLE articles DISABLE TRIGGER ALL;
INSERT INTO articles(title, announce, fullText, user_id) VALUES
${articleValues};
ALTER TABLE articles ENABLE TRIGGER ALL;

/* fills articles_categories table */
ALTER TABLE articles_categories DISABLE TRIGGER ALL;
INSERT INTO articles_categories(article_id, category_id) VALUES
${articleCategoryValues};
ALTER TABLE articles_categories ENABLE TRIGGER ALL;

/* fills comments table */
ALTER TABLE comments DISABLE TRIGGER ALL;
INSERT INTO comments(text, user_id, article_id) VALUES
${commentValues};
ALTER TABLE comments ENABLE TRIGGER ALL;`;

    try {
      await fs.writeFile(FILE_NAME, content);
      console.info(chalk.green(`Operation success. File created.`));
    } catch (err) {
      console.error(chalk.red(`Can't write data to file...`));
    }
  }
};
