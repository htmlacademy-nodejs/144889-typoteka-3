"use strict";

const express = require(`express`);
const request = require(`supertest`);
const Sequelize = require(`sequelize`);

const article = require(`./article`);
const ArticleService = require(`../data-service/article`);
const CommentService = require(`../data-service/comment`);
const initDB = require(`../lib/init-db`);

const {HttpCode} = require(`../../constants`);
const mockData = require(`./_stubs/article.json`);
const mockCategories = [`Деревья`, `За жизнь`, `Без рамки`, `Разное`, `IT`, `Музыка`];

const createAPI = async () => {
  const mockDB = new Sequelize(`sqlite::memory:`, {logging: false});
  await initDB(mockDB, {categories: mockCategories, articles: mockData});
  const app = express();
  app.use(express.json());
  article(app, new ArticleService(mockDB), new CommentService(mockDB));
  return app;
};

describe(`Article API creates an article if data is valid`, () => {

  const newArticle = {
    title: `Как сделать из Raspberry Pi автомобильный навигатор за час.`,
    announce: `Чтобы сделать автомобильный навигатор из карманного компьютера Raspberry Pi не нужно ничего паять...`,
    fullText: `Нужно всего лишь зайти на Алиэкспресс и заказать необходимы компоненты. Однако самая большая сложность - ПО. Но OpenSource приходит к нам на помощь!`,
    categories: [1, 2, 3]
  };

  let response;
  let app;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
      .post(`/articles`)
      .send(newArticle);
  });


  test(`Status code 201`, () => expect(response.statusCode).toBe(HttpCode.CREATED));

  test(`Articles count is changed`, () => request(app)
    .get(`/articles`)
    .expect((res) => expect(res.body.length).toBe(6))
  );
});

describe(`Article API returns a list of all articles`, () => {

  let response;
  let app;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
      .get(`/articles`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`Returns a list of 5 articles`, () => expect(response.body.length).toBe(5));

  test(`First article's title equals "Как начать программировать"`, () => expect(response.body[0].title).toBe(`Как начать программировать`));
});

describe(`Article API returns an article with given id`, () => {

  let response;
  let app;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
      .get(`/articles/1`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`article's title is "Как начать программировать"`, () => expect(response.body.title).toBe(`Как начать программировать`));
});

describe(`Article API refuses to create an article if data is invalid`, () => {

  const newArticle = {
    title: `Как сделать из Raspberry Pi автомобильный навигатор за час.`,
    announce: `Чтобы сделать автомобильный навигатор из карманного компьютера Raspberry Pi не нужно ничего паять...`,
    fullText: `Нужно всего лишь зайти на Алиэкспресс и заказать необходимы компоненты. Однако самая большая сложность - ПО. Но OpenSource приходит к нам на помощь!`,
    category: [`Программирование`, `Железо`]
  };

  let app;

  beforeAll(async () => {
    app = await createAPI();
  });

  test(`Without any required property response code is 400`, async () => {
    for (const key of Object.keys(newArticle)) {
      const badArticle = {...newArticle};
      delete badArticle[key];
      await request(app)
        .post(`/articles`)
        .send(badArticle)
        .expect(HttpCode.BAD_REQUEST);
    }
  });
});

describe(`Article API changes existent article`, () => {

  const newArticle = {
    title: `Как сделать из Raspberry Pi автомобильный навигатор за час.`,
    announce: `Чтобы сделать автомобильный навигатор из карманного компьютера Raspberry Pi не нужно ничего паять...`,
    fullText: `Нужно всего лишь зайти на Алиэкспресс и заказать необходимы компоненты. Однако самая большая сложность - ПО. Но OpenSource приходит к нам на помощь!`,
    categories: [3, 4, 5]
  };

  let response;
  let app;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
      .put(`/articles/3`)
      .send(newArticle);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`Article is really changed`, () => request(app)
    .get(`/articles/3`)
    .expect((res) => expect(res.body.title).toBe(`Как сделать из Raspberry Pi автомобильный навигатор за час.`))
  );
});

describe(`Article API refuses when trying to change non-existent article`, () => {

  const validArticle = {
    title: `Как сделать из Raspberry Pi автомобильный навигатор за час.`,
    announce: `Чтобы сделать автомобильный навигатор из карманного компьютера Raspberry Pi не нужно ничего паять...`,
    fullText: `Нужно всего лишь зайти на Алиэкспресс и заказать необходимы компоненты. Однако самая большая сложность - ПО. Но OpenSource приходит к нам на помощь!`,
    categories: [1, 2, 3, 4]
  };

  let response;
  let app;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
      .put(`/articles/100`)
      .send(validArticle);
  });

  test(`Status code 404`, () => expect(response.statusCode).toBe(HttpCode.NOT_FOUND));
});

describe(`Article API refuses when trying to change an article with invalid data`, () => {

  const invalidArticle = {
    title: `Как сделать из Raspberry Pi автомобильный навигатор за час.`,
    announce: `Чтобы сделать автомобильный навигатор из карманного компьютера Raspberry Pi не нужно ничего паять...`,
    categories: [1, 2, 3, 4]
  };

  let response;
  let app;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
      .put(`/articles/4`)
      .send(invalidArticle);
  });

  test(`Status code 400`, () => expect(response.statusCode).toBe(HttpCode.BAD_REQUEST));
});

describe(`Article API correctly deletes an article`, () => {

  let response;
  let app;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
      .delete(`/articles/5`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`Article count is 4 now`, () => request(app)
    .get(`/articles`)
    .expect((res) => expect(res.body.length).toBe(4))
  );
});

describe(`Article API refuses to delete non-existent article`, () => {

  test(`Status code 404`, async () => {

    const app = await createAPI();

    return request(app)
      .delete(`/articles/200`)
      .expect(HttpCode.NOT_FOUND);
  });
});

describe(`Article API returns a list of comments to given article`, () => {

  let response;
  let app;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
      .get(`/articles/4/comments`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`Returns list of 4 comments`, () => expect(response.body.length).toBe(4));

  test(`First comment's text is "Согласен с автором! Планируете записать видосик на эту тему? Совсем немного... Плюсую, но слишком много буквы! Хочу такую же футболку :-)"`, () => expect(response.body[0].text).toBe(`Согласен с автором! Планируете записать видосик на эту тему? Совсем немного... Плюсую, но слишком много буквы! Хочу такую же футболку :-)`));
});

describe(`Article API creates a comment if data is valid`, () => {

  const newValidComment = {
    text: `текст валидного комментария`
  };

  let response;
  let app;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
      .post(`/articles/3/comments`)
      .send(newValidComment);
  });

  test(`Status code 201`, () => expect(response.statusCode).toBe(HttpCode.CREATED));

  test(`Returns created comment`, () => expect(response.body.text).toBe(`текст валидного комментария`));

  test(`Comments count is changed`, () => request(app)
    .get(`/articles/3/comments`)
    .expect((res) => expect(res.body.length).toBe(5))
  );
});

describe(`Article API refuses to create a comment to non-existent article`, () => {

  test(`Status code 404`, async () => {

    const app = await createAPI();

    return request(app)
      .post(`/articles/300/comments`)
      .send({
        text: `Неважно, этот комментарий все равно не добавится`
      })
      .expect(HttpCode.NOT_FOUND);
  });
});

describe(`Article API refuses to create a comment when data is invalid`, () => {

  test(`Status code 400`, async () => {

    const app = await createAPI();

    return request(app)
      .post(`/articles/1/comments`)
      .send({
        comment: `Невалидное название поля комментария`
      })
      .expect(HttpCode.BAD_REQUEST);
  });
});

describe(`Article API correctly deletes a comment`, () => {

  let response;
  let app;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app).delete(`/articles/1/comments/4`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`Comment count is 3 now`, () => request(app)
    .get(`/articles/1/comments`)
    .expect((res) => expect(res.body.length).toBe(3))
  );
});

describe(`Article API refuses to delete non-existent comment`, () => {

  test(`Status code 404`, async () => {

    const app = await createAPI();

    return request(app)
      .delete(`/articles/1/comments/100`)
      .expect(HttpCode.NOT_FOUND);
  });
});

describe(`Article API refuses to delete a comment to non-existent article`, () => {

  test(`Status code 404`, async () => {

    const app = await createAPI();

    return request(app)
      .delete(`/articles/200/comments/1`)
      .expect(HttpCode.NOT_FOUND);
  });
});
