const badge = require('../domain/badge');
const QUEUE_NAME = 'multiplications';
const LUCKY_NUMBER = 432;

module.exports = (amqpObj, scoreRepository, badgeRepository) => {
  const processMultiplication = multiplication => {
    if (multiplication.correct) {
      const scoreCard = {
        userAlias: multiplication.userAlias,
        multiplicationId: multiplication.id
      };
      return scoreRepository
        .createScoreCard(scoreCard)
        .then(() => scoreRepository.getUserScoreCards(multiplication.userAlias))
        .then(userScoreCards => {
          if (userScoreCards.length === 1) {
            return [
              { userAlias: multiplication.userAlias, badge: badge.FIRST_WON }
            ];
          }
          return [];
        })
        .then(currentBadges => {
          return scoreRepository
            .getTotalScoreForUser(multiplication.userAlias)
            .then(score => {
              return badgeRepository
                .getUserBadges(multiplication.userAlias)
                .then(userBadges => {
                  let finalBadges = currentBadges;
                  const bronzeBadge = userBadges.find(
                    userBadge => userBadge.badge === badge.BRONZE_MULTIPLICATOR
                  );
                  if (!bronzeBadge && score >= 100)
                    finalBadges = [
                      ...finalBadges,
                      {
                        userAlias: multiplication.userAlias,
                        badge: badge.BRONZE_MULTIPLICATOR
                      }
                    ];
                  const silverBadge = userBadges.find(
                    userBadge => userBadge.badge === badge.SILVER_MULTIPLICATOR
                  );
                  if (!silverBadge && score >= 500)
                    finalBadges = [
                      ...finalBadges,
                      {
                        userAlias: multiplication.userAlias,
                        badge: badge.SILVER_MULTIPLICATOR
                      }
                    ];
                  const goldenBadge = userBadges.find(
                    userBadge => userBadge.badge === badge.GOLD_MULTIPLICATOR
                  );
                  if (!goldenBadge && score >= 999)
                    finalBadges = [
                      ...finalBadges,
                      {
                        userAlias: multiplication.userAlias,
                        badge: badge.GOLD_MULTIPLICATOR
                      }
                    ];
                  const luckyBadge = userBadges.find(
                    userBadge => userBadge.badge === badge.LUCKY_NUMBER
                  );
                  if (
                    !luckyBadge &&
                    (multiplication.factorA === LUCKY_NUMBER ||
                      multiplication.factorB === LUCKY_NUMBER)
                  )
                    finalBadges = [
                      ...finalBadges,
                      {
                        userAlias: multiplication.userAlias,
                        badge: badge.LUCKY_NUMBER
                      }
                    ];
                  return finalBadges;
                });
            });
        })
        .then(currentBadges =>
          Promise.all(
            currentBadges.map(curBadge => badgeRepository.createBadge(curBadge))
          )
        );
    }
    return Promise.resolve();
  };

  return {
    start: () =>
      amqpObj.connect('amqp://localhost').then(conn => {
        const stop = () => conn.close();
        return conn.createChannel().then(ch => {
          return ch.assertQueue(QUEUE_NAME).then(() => {
            return ch
              .consume(QUEUE_NAME, msg => {
                const parsedMsg = JSON.parse(msg.content.toString());
                processMultiplication(parsedMsg).then(() => ch.ack(msg));
              })
              .then(() => stop);
          });
        });
      })
  };
};
