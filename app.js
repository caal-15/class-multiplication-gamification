const amqpObj = require('amqplib');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const db = require('./database');
const scoreRepository = require('./repositories/scoreCards')(db);
const badgeRepository = require('./repositories/badgeCards')(db);
const multiplicationQueueService = require('./services/multiplicationQueueService')(
  amqpObj,
  scoreRepository,
  badgeRepository
);
const statsService = require('./services/statsService')(
  scoreRepository,
  badgeRepository
);
const statsRouter = require('./routes/stats')(statsService);
const leaderRouter = require('./routes/leaders')(scoreRepository);

multiplicationQueueService.start().then(stop => {
  process.on('exit', () => {
    stop();
    db.destroy();
  });

  const server = express();
  server.use(cors());
  server.use(morgan('dev'));
  server.use(express.json());

  server.use('/stats', statsRouter);
  server.use('/leaders', leaderRouter);

  server.listen(8082, () => {
    console.log('Gamification server listening on 8082');
  });
});
