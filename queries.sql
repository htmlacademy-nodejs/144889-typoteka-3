/*Список всех категорий*/
SELECT * FROM categories;

/*Список непустых категорий*/
SELECT id, name
FROM categories
  JOIN articles_categories ON id = category_id
  GROUP BY id;

/*Категории с количеством публикаций*/
SELECT id, name, count(article_id)
FROM categories
  JOIN articles_categories ON id = category_id
  GROUP BY id
  ORDER BY count(article_id) DESC;

/*Список публикаций, сначала свежие*/
SELECT
  articles.id,
  articles.title,
  articles.announce,
  articles.created_at,
  concat(users.first_name, ' ', users.last_name) AS author_name,
  users.email AS author_email,
  count(comments.id) AS comments_count,
  string_agg(DISTINCT categories.name, ', ') AS article_categories
FROM articles
  JOIN users ON articles.user_id = users.id
  LEFT JOIN comments ON articles.id = comments.article_id
  LEFT JOIN articles_categories ON articles.id = articles_categories.article_id
  LEFT JOIN categories ON articles_categories.category_id = categories.id
  GROUP BY articles.id, users.id
  ORDER BY articles.created_at DESC;

/*Детальная информация по публикации*/
SELECT
  articles.id,
  articles.title,
  articles.announce,
  articles.fullText,
  articles.created_at,
  concat(users.first_name, ' ', users.last_name) AS author_name,
  users.email AS author_email,
  count(comments.id) AS comments_count,
  string_agg(DISTINCT categories.name, ', ') AS article_categories
FROM articles
  JOIN users ON articles.user_id = users.id
  LEFT JOIN comments ON articles.id = comments.article_id
  LEFT JOIN articles_categories ON articles.id = articles_categories.article_id
  LEFT JOIN categories ON articles_categories.category_id = categories.id
WHERE articles.id = 1
  GROUP BY articles.id, users.id;

/*Пять свежих комментариев*/
SELECT
  comments.id,
  comments.article_id,
  concat(users.first_name, ' ', users.last_name) AS author,
  comments.text
FROM comments
  JOIN users ON comments.user_id = users.id
  ORDER BY comments.created_at DESC
  LIMIT 5;

/*Комментарии к публикации*/
SELECT
  comments.id,
  comments.article_id,
  concat(users.first_name, ' ', users.last_name) AS author,
  comments.text
FROM comments
  JOIN users ON comments.user_id = users.id
WHERE comments.article_id = 1
  ORDER BY comments.created_at DESC;

/*Обновить заголовок публикации*/
UPDATE articles
  set title = 'Ёлки. История деревьев'
WHERE id = 1;
