"use strict";

const express = require(`express`);
const request = require(`supertest`);

const article = require(`./article`);
const ArticleService = require(`../data-service/article`);
const CommentService = require(`../data-service/comment`);

const {HttpCode} = require(`../../constants`);
const mockData = require(`./_stubs/article.json`);

const createAPI = () => {
  const app = express();
  const cloneData = JSON.parse(JSON.stringify(mockData));
  app.use(express.json());
  article(app, new ArticleService(cloneData), new CommentService());
  return app;
};

describe(`Article API returns a list of all articles`, () => {

  const app = createAPI();

  let response;

  beforeAll(async () => {
    response = await request(app)
      .get(`/articles`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`Returns a list of 5 articles`, () => expect(response.body.length).toBe(5));

  test(`First article's id equals "EhSfj5"`, () => expect(response.body[0].id).toBe(`EhSfj5`));
});

describe(`Article API returns an article with given id`, () => {

  const app = createAPI();

  let response;

  beforeAll(async () => {
    response = await request(app)
      .get(`/articles/z2EOSl`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`article's title is "Лучшие рок-музыканты 20-века"`, () => expect(response.body.title).toBe(`Лучшие рок-музыканты 20-века`));
});

describe(`Article API creates an article if data is valid`, () => {

  const newArticle = {
    title: `Как сделать из Raspberry Pi автомобильный навигатор за час.`,
    announce: `Чтобы сделать автомобильный навигатор из карманного компьютера Raspberry Pi не нужно ничего паять...`,
    fullText: `Нужно всего лишь зайти на Алиэкспресс и заказать необходимы компоненты. Однако самая большая сложность - ПО. Но OpenSource приходит к нам на помощь!`,
    category: [`Программирование`, `Железо`]
  };
  const app = createAPI();
  let response;

  beforeAll(async () => {
    response = await request(app)
      .post(`/articles`)
      .send(newArticle);
  });


  test(`Status code 201`, () => expect(response.statusCode).toBe(HttpCode.CREATED));

  test(`Returns article created`, () => expect(response.body).toEqual(expect.objectContaining(newArticle)));

  test(`Articles count is changed`, () => request(app)
    .get(`/articles`)
    .expect((res) => expect(res.body.length).toBe(6))
  );
});

describe(`Article API refuses to create an article if data is invalid`, () => {

  const newArticle = {
    title: `Как сделать из Raspberry Pi автомобильный навигатор за час.`,
    announce: `Чтобы сделать автомобильный навигатор из карманного компьютера Raspberry Pi не нужно ничего паять...`,
    fullText: `Нужно всего лишь зайти на Алиэкспресс и заказать необходимы компоненты. Однако самая большая сложность - ПО. Но OpenSource приходит к нам на помощь!`,
    category: [`Программирование`, `Железо`]
  };
  const app = createAPI();

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
    category: [`Программирование`, `Железо`]
  };
  const app = createAPI();
  let response;

  beforeAll(async () => {
    response = await request(app)
      .put(`/articles/E0DGtY`)
      .send(newArticle);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`Returns changed article`, () => expect(response.body).toEqual(expect.objectContaining(newArticle)));

  test(`Article is really changed`, () => request(app)
    .get(`/articles/E0DGtY`)
    .expect((res) => expect(res.body.title).toBe(`Как сделать из Raspberry Pi автомобильный навигатор за час.`))
  );
});

describe(`Article API refuses when trying to change non-existent article`, () => {

  const validArticle = {
    title: `Как сделать из Raspberry Pi автомобильный навигатор за час.`,
    announce: `Чтобы сделать автомобильный навигатор из карманного компьютера Raspberry Pi не нужно ничего паять...`,
    fullText: `Нужно всего лишь зайти на Алиэкспресс и заказать необходимы компоненты. Однако самая большая сложность - ПО. Но OpenSource приходит к нам на помощь!`,
    category: [`Программирование`, `Железо`]
  };

  const app = createAPI();
  let response;

  beforeAll(async () => {
    response = await request(app)
      .put(`/articles/NOEXST`)
      .send(validArticle);
  });

  test(`Status code 404`, () => expect(response.statusCode).toBe(HttpCode.NOT_FOUND));
});

describe(`Article API refuses when trying to change an article with invalid data`, () => {

  const invalidArticle = {
    title: `Как сделать из Raspberry Pi автомобильный навигатор за час.`,
    announce: `Чтобы сделать автомобильный навигатор из карманного компьютера Raspberry Pi не нужно ничего паять...`,
    fullText: `Нужно всего лишь зайти на Алиэкспресс и заказать необходимы компоненты. Однако самая большая сложность - ПО. Но OpenSource приходит к нам на помощь!`,
    categories: [`Программирование`, `Железо`]
  };

  const app = createAPI();
  let response;

  beforeAll(async () => {
    response = await request(app)
      .put(`/articles/x-4NU6`)
      .send(invalidArticle);
  });

  test(`Status code 400`, () => expect(response.statusCode).toBe(HttpCode.BAD_REQUEST));
});

describe(`Article API correctly deletes an article`, () => {

  const app = createAPI();

  let response;

  beforeAll(async () => {
    response = await request(app)
      .delete(`/articles/Hl3Uak`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`Returns deleted article`, () => expect(response.body.title).toBe(`Как начать программировать`));

  test(`Article count is 4 now`, () => request(app)
    .get(`/articles`)
    .expect((res) => expect(res.body.length).toBe(4))
  );
});

describe(`Article API refuses to delete non-existent article`, () => {

  test(`Status code 404`, () => {

    const app = createAPI();

    return request(app)
      .delete(`/articles/NOEXST`)
      .expect(HttpCode.NOT_FOUND);
  });
});

describe(`Article API returns a list of comments to given article`, () => {

  const app = createAPI();

  let response;

  beforeAll(async () => {
    response = await request(app)
      .get(`/articles/Hl3Uak/comments`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`Returns list of 4 comments`, () => expect(response.body.length).toBe(4));

  test(`First comment's id is "T0VL_G"`, () => expect(response.body[0].id).toBe(`T0VL_G`));
});

describe(`Article API creates a comment if data is valid`, () => {

  const newValidComment = {
    text: `текст валидного комментария`
  };

  const app = createAPI();

  let response;

  beforeAll(async () => {
    response = await request(app)
      .post(`/articles/Hl3Uak/comments`)
      .send(newValidComment);
  });

  test(`Status code 201`, () => expect(response.statusCode).toBe(HttpCode.CREATED));

  test(`Returns created comment`, () => expect(response.body.text).toBe(`текст валидного комментария`));

  test(`Comments count is changed`, () => request(app)
    .get(`/articles/Hl3Uak/comments`)
    .expect((res) => expect(res.body.length).toBe(5))
  );
});

describe(`Article API refuses to create a comment to non-existent article`, () => {

  test(`Status code 404`, () => {

    const app = createAPI();

    return request(app)
      .post(`/articles/NOEXST/comments`)
      .send({
        text: `Неважно, этот комментарий все равно не добавится`
      })
      .expect(HttpCode.NOT_FOUND);
  });
});

describe(`Article API refuses to create a comment when data is invalid`, () => {

  test(`Status code 400`, () => {

    const app = createAPI();

    return request(app)
      .post(`/articles/Hl3Uak/comments`)
      .send({
        comment: `Невалидное название поля комментария`
      })
      .expect(HttpCode.BAD_REQUEST);
  });
});

describe(`Article API correctly deletes a comment`, () => {

  const app = createAPI();

  let response;

  beforeAll(async () => {
    response = await request(app)
      .delete(`/articles/EhSfj5/comments/YDCOHd`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`Returns deleted comment`, () => expect(response.body.id).toBe(`YDCOHd`));

  test(`Comment count is 3 now`, () => request(app)
    .get(`/articles/EhSfj5/comments`)
    .expect((res) => expect(res.body.length).toBe(3))
  );
});

describe(`Article API refuses to delete non-existent comment`, () => {

  test(`Status code 404`, () => {

    const app = createAPI();

    return request(app)
      .delete(`/articles/z2EOSl/comments/ld07x5`)
      .expect(HttpCode.NOT_FOUND);
  });
});

describe(`Article API refuses to delete a comment to non-existent article`, () => {

  test(`Status code 404`, () => {

    const app = createAPI();

    return request(app)
      .delete(`/articles/z2EOE4/comments/k3HWdj`)
      .expect(HttpCode.NOT_FOUND);
  });
});
