const TABLE_NAME = 'SCORE_CARDS';

module.exports = db => {
  const createTable = () =>
    db.schema.hasTable(TABLE_NAME).then(scoreCardsTableExists => {
      if (scoreCardsTableExists) {
        return { alreadyExists: true, tableName: TABLE_NAME };
      }
      return db.schema
        .createTable(TABLE_NAME, table => {
          table.increments('cardId').primary();
          table.string('userAlias').notNullable();
          table.integer('multiplicationId').notNullable();
          table.datetime('scoreTimestamp').notNullable();
          table.integer('score').notNullable();
        })
        .then(() => ({ alreadyExists: false, tableName: TABLE_NAME }))
        .catch(err => Promise.reject(TABLE_NAME));
    });

  const getTotalScoreForUser = userId =>
    db(TABLE_NAME)
      .where({ userId })
      .sum('score');

  const getLeaderboard = () =>
    db(TABLE_NAME)
      .select('userId')
      .distinct('userId')
      .then(userIds => {});

  return {
    TABLE_NAME,
    createTable,
    getTotalScoreForUser,
    getLeaderboard
  };
};
