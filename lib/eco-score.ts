export const pointsPerScan = 10;

export function calculateEcoScore(totalScans: number) {
  return totalScans * pointsPerScan;
}

export function getEcoLevel(points: number) {
  if (points >= 101) {
    return "Earth Guardian";
  }

  if (points >= 51) {
    return "Eco Hero";
  }

  if (points >= 21) {
    return "Eco Explorer";
  }

  return "Beginner";
}
