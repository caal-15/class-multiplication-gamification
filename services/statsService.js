module.exports = (scoreRepository, badgeRepository) => {
  const getUserStats = userAlias =>
    scoreRepository.getTotalScoreForUser(userAlias).then(score => {
      return badgeRepository.getUserBadges(userAlias).then(userBadges => {
        const badgeNames = userBadges.map(badge => badge.badge);
        return { userAlias, score, badges: badgeNames };
      });
    });

  return {
    getUserStats
  };
};
