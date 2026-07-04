/**
 * Sorts and ranks candidates based on their scores.
 * @param {object[]} candidates - Array of scored candidates
 * @returns {object} Ranked list, top candidate, and summary stats
 */
export function rankCandidates(candidates) {
  if (!candidates || candidates.length === 0) {
    return {
      ranked: [],
      bestFit: null,
      stats: {
        averageScore: 0,
        strongMatchesCount: 0,
        totalCandidates: 0
      }
    };
  }

  // Sort: 1st by final ATS score, 2nd by semantic score, 3rd by experience years
  const ranked = [...candidates].sort((a, b) => {
    if (b.scores.final !== a.scores.final) {
      return b.scores.final - a.scores.final;
    }
    if (b.scores.semantic !== a.scores.semantic) {
      return b.scores.semantic - a.scores.semantic;
    }
    return b.experience_years - a.experience_years;
  });

  const bestFit = ranked[0];

  const totalScore = candidates.reduce((sum, c) => sum + c.scores.final, 0);
  const averageScore = Math.round(totalScore / candidates.length);
  const strongMatchesCount = candidates.filter(c => c.scores.final >= 70).length;

  return {
    ranked,
    bestFit,
    stats: {
      averageScore,
      strongMatchesCount,
      totalCandidates: candidates.length
    }
  };
}
