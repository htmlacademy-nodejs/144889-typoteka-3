'use strict';

const express = require(`express`);
const path = require(`path`);
const session = require(`express-session`);

const mainRoutes = require(`./routes/main-routes`);
const myRoutes = require(`./routes/my-routes`);
const articlesRoutes = require(`./routes/articles-routes`);
const categoriesRoutes = require(`./routes/categories-routes`);
const {HttpCode} = require(`../constants`);
const sequelize = require(`../service/lib/sequelize`);
const SequelizeStore = require(`connect-session-sequelize`)(session.Store);

const DEFAULT_PORT = 8080;
const {SESSION_SECRET} = process.env;

const Dir = {
  PUBLIC: `public`,
  UPLOAD: `upload`
};

if (!SESSION_SECRET) {
  throw new Error(`SESSION_SECRET environment variable is not defined`);
}

const app = express();
app.locals.moment = require(`moment`);

app.use(express.json());

const mySessionStore = new SequelizeStore({
  db: sequelize,
  expiration: 180000,
  checkExpirationInterval: 60000
});

sequelize.sync({force: false});

app.use(express.urlencoded({extended: true}));

app.use(session({
  secret: SESSION_SECRET,
  store: mySessionStore,
  resave: false,
  proxy: true,
  saveUninitialized: false,
}));

app.use(`/`, mainRoutes);
app.use(`/my`, myRoutes);
app.use(`/articles`, articlesRoutes);
app.use(`/categories`, categoriesRoutes);

app.use(express.static(path.resolve(__dirname, Dir.PUBLIC)));
app.use(express.static(path.resolve(__dirname, Dir.UPLOAD)));

app.use((req, res) => res.status(HttpCode.BAD_REQUEST).render(`errors/404`));
app.use((err, _req, res, _next) => {
  console.log(err.message);
  res.status(HttpCode.INTERNAL_SERVER_ERROR).render(`errors/500`);
});

app.set(`views`, path.resolve(__dirname, `templates`));
app.set(`view engine`, `pug`);

app.listen(process.env.PORT || DEFAULT_PORT);
