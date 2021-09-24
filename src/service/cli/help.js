'use strict';

const chalk = require(`chalk`);

module.exports = {
  name: `--help`,
  run() {
    const text = `
    Программа запускает http-сервер и формирует файл с данными для API.
    Гайд:
      service.js <command>
      Команды:
      --version:            выводит номер версии
      --help:               печатает этот текст
      --filldb <count>      наполняет БД данными
      --server <port>       запускает сервер
      --fill <count>        генерирует fill-db.sql
    `;

    console.log(chalk.gray(text));
  }
};
