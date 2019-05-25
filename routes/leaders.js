const express = require('express');

module.exports = scoreRepo => {
  const router = express.Router();

  router.get('/', (_, res) =>
    scoreRepo.getLeaderboard().then(leaderboard => res.json(leaderboard))
  );

  return router;
};
