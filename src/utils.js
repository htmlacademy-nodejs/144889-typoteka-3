'use strict';

const {nanoid} = require(`nanoid`);

const {MAX_ID_LENGTH} = require(`./constants`);

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const shuffle = (someArray) => {
  for (let i = someArray.length - 1; i > 0; i--) {
    const randomPosition = Math.floor(Math.random() * i);
    [someArray[i], someArray[randomPosition]] = [someArray[randomPosition], someArray[i]];
  }

  return someArray;
};

const getRandomDate = () => {
  const today = Date.now();
  const threeMonthAgo = today - 1000 * 60 * 60 * 24 * 3;
  const randomDate = getRandomInt(threeMonthAgo, today);
  const randomDateObject = new Date(randomDate);
  const humanDateFormat = randomDateObject.toLocaleString();
  return humanDateFormat;
};

const getRandomArrayPart = (arr) => {
  return arr.slice(getRandomInt(0, (arr.length - 1) / 2), getRandomInt((arr.length - 1) / 2, arr.length - 1));
};

const generateComments = (count, comments) => {
  return (
    Array(count).fill({}).map(() => ({
      id: nanoid(MAX_ID_LENGTH),
      text: getRandomArrayPart(shuffle(comments)).join(` `),
    }))
  );
};

module.exports = {
  getRandomInt,
  shuffle,
  getRandomDate,
  getRandomArrayPart,
  generateComments
};
