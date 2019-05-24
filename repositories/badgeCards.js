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

  const getUserBadges = (userId, orderBy = 'badgeTimestamp', order = 'desc') =>
    db(TABLE_NAME)
      .where({ userId })
      .orderBy(orderBy, order);

  return {
    TABLE_NAME,
    createTable,
    getUserBadges
  };
};
