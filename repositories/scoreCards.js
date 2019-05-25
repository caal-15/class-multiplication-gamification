const moment = require('moment');

const TABLE_NAME = 'SCORE_CARDS';
const DEFAULT_SCORE = 10;

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
        .catch(() => Promise.reject(TABLE_NAME));
    });

  const createScoreCard = scoreCard =>
    db(TABLE_NAME).insert({
      score: DEFAULT_SCORE,
      scoreTimestamp: moment().format(),
      ...scoreCard
    });

  const getTotalScoreForUser = userAlias =>
    db(TABLE_NAME)
      .where({ userAlias })
      .sum('score');

  const getUserScoreCards = (
    userAlias,
    orderBy = 'scoreTimestamp',
    order = 'desc'
  ) =>
    db(TABLE_NAME)
      .where({ userAlias })
      .orderBy(orderBy, order);

  const getLeaderboard = () =>
    db(TABLE_NAME)
      .select('userAlias')
      .distinct('userAlias')
      .then(userAliases =>
        Promise.all(
          userAliases.map(userAlias =>
            getTotalScoreForUser(userAlias).then(userScore => ({
              userScore,
              userAlias
            }))
          )
        )
      );

  return {
    TABLE_NAME,
    createTable,
    getTotalScoreForUser,
    getLeaderboard,
    createScoreCard,
    getUserScoreCards
  };
};
