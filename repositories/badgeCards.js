const moment = require('moment');
const TABLE_NAME = 'BADGE_CARDS';

module.exports = db => {
  const createTable = () =>
    db.schema.hasTable(TABLE_NAME).then(badgeCardTableExists => {
      if (badgeCardTableExists) {
        return { alreadyExists: true, tableName: TABLE_NAME };
      }
      return db.schema
        .createTable(TABLE_NAME, table => {
          table.increments('badgeId');
          table.string('userAlias').notNullable();
          table.datetime('badgeTimestamp').notNullable();
          table.string('badge').notNullable();
        })
        .then(() => ({ alreadyExists: false, tableName: TABLE_NAME }))
        .catch(() => Promise.reject(TABLE_NAME));
    });

  const createBadge = badge =>
    db(TABLE_NAME).insert({ badgeTimestamp: moment().format(), ...badge });

  const getUserBadges = (
    userAlias,
    orderBy = 'badgeTimestamp',
    order = 'desc'
  ) =>
    db(TABLE_NAME)
      .where({ userAlias })
      .orderBy(orderBy, order);

  return {
    TABLE_NAME,
    createTable,
    getUserBadges,
    createBadge
  };
};
