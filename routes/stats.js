const express = require('express');

module.exports = statsService => {
  const router = express.Router();

  router.get('/', (req, res) =>
    statsService
      .getUserStats(req.query.userAlias)
      .then(stats => res.json(stats))
  );

  return router;
};
