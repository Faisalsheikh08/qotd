export const scoringUtils = {
  calculatePoints(question, timeTaken, isCorrect) {
    if (!isCorrect) return 0;

    let basePoints = question.points || 10;

    // Time bonus (faster answers get bonus)
    if (timeTaken && question.timeLimit) {
      const timeRatio = timeTaken / question.timeLimit;
      if (timeRatio < 0.5) {
        basePoints += 5; // Speed bonus
      }
    }

    // Difficulty multiplier
    const difficultyMultiplier = {
      easy: 1,
      medium: 1.5,
      hard: 2,
      uncategorised: 1,
    };

    return Math.round(
      basePoints * (difficultyMultiplier[question.difficulty] || 1)
    );
  },

  calculateLevel(totalPoints) {
    const pointsPerLevel = 1000;
    return Math.floor(totalPoints / pointsPerLevel) + 1;
  },

  calculateStreakBonus(currentStreak) {
    if (currentStreak >= 30) return 50;
    if (currentStreak >= 14) return 30;
    if (currentStreak >= 7) return 15;
    if (currentStreak >= 3) return 5;
    return 0;
  },

  calculateAccuracy(correct, total) {
    if (total === 0) return 0;
    return Math.round((correct / total) * 100 * 100) / 100;
  },

  getPerformanceRating(accuracy) {
    if (accuracy >= 90) return "Excellent";
    if (accuracy >= 75) return "Good";
    if (accuracy >= 60) return "Average";
    if (accuracy >= 40) return "Below Average";
    return "Needs Improvement";
  },
};
