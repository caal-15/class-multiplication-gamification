const amqpObj = require('amqplib');
const db = require('./database');

const scoreRepository = require('./repositories/scoreCards')(db);
const badgeRepository = require('./repositories/badgeCards')(db);
const multiplicationQueueService = require('./services/multiplicationQueueService')(
  amqpObj,
  scoreRepository,
  badgeRepository
);

multiplicationQueueService.start().then(stop => {
  process.on('exit', () => {
    stop();
    db.destroy();
  });
});
