'use strict';

const express = require(`express`);
const path = require(`path`);
const mainRoutes = require(`./routes/main-routes`);
const myRoutes = require(`./routes/my-routes`);
const articlesRoutes = require(`./routes/articles-routes`);
const {HttpCode} = require(`../constants`);

const DIR = {
  PUBLIC: `public`,
  UPLOAD: `upload`
};

const DEFAULT_PORT = 8080;

const app = express();

app.use(`/`, mainRoutes);
app.use(`/my`, myRoutes);
app.use(`/articles`, articlesRoutes);

app.use(express.static(path.resolve(__dirname, DIR.PUBLIC)));
app.use(express.static(path.resolve(__dirname, DIR.UPLOAD)));

app.use((req, res) => res.status(HttpCode.BAD_REQUEST).render(`errors/404`));
app.use((err, _req, res, _next) => {
  console.log(err.message);
  res.status(HttpCode.INTERNAL_SERVER_ERROR).render(`errors/500`);
});

app.set(`views`, path.resolve(__dirname, `templates`));
app.set(`view engine`, `pug`);

app.listen(process.env.PORT || DEFAULT_PORT);
