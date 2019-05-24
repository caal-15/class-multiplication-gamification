const db = require('../database');

const scoreCardRepository = require('../repositories/scoreCards')(db);
const badgeCardRepository = require('../repositories/badgeCards')(db);

const wrapTableCreation = createMethod =>
  createMethod()
    .then(({ alreadyExists, tableName }) => {
      if (alreadyExists) console.log(`Table ${tableName} Already Exists`);
      else console.log(`Table ${tableName} Created`);
      return;
    })
    .catch(tableName => console.log(`Error Creating Table ${tableName}`));

Promise.all([
  wrapTableCreation(scoreCardRepository.createTable),
  wrapTableCreation(badgeCardRepository.createTable)
]).then(() => {
  db.destroy();
  console.log('Done!');
});
