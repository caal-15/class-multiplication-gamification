const moment = require('moment');

const TABLE_NAME = 'SCORE_CARDS';
const DEFAULT_SCORE = 100;

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
      .sum('score as totalScore')
      .then(scores => {
        return scores[0].totalScore || 0;
      });

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
      .then(scoreCards =>
        Promise.all(
          scoreCards.map(scoreCard =>
            getTotalScoreForUser(scoreCard.userAlias).then(totalScore => ({
              totalScore,
              userAlias: scoreCard.userAlias
            }))
          )
        )
      )
      .then(totalScores =>
        totalScores.sort((a, b) => -(a.totalScore - b.totalScore))
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
