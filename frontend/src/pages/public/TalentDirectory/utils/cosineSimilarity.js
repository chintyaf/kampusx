/**
 * Utility Cosine Similarity & Vector Matching Engine
 * Cosine Similarity (A, B) = (A . B) / (||A|| * ||B||)
 */

export const calculateCosineSimilarity = (candidateSkills = [], requiredSkills = [], sbtList = []) => {
  if (!requiredSkills || requiredSkills.length === 0) {
    return {
      score: null,
      cosine: 0,
      matchedSkillsCount: 0,
      hasSbtBonus: false
    };
  }

  // Bangun vektor dimensi berdasarkan union skill yang dibutuhkan
  // Vektor Query Q: bobot 1.0 (atau 100) untuk setiap required skill
  // Vektor Kandidat T: proficiency level normalized [0.0 - 1.0]

  let dotProduct = 0;
  let normCandidateSq = 0;
  let normQuerySq = 0;
  let matchedSkillsCount = 0;
  let hasMatchingSbt = false;

  requiredSkills.forEach((reqSkill) => {
    const qWeight = 1.0;
    normQuerySq += qWeight * qWeight;

    const foundSkill = candidateSkills.find(
      (s) => s.name.toLowerCase() === reqSkill.toLowerCase()
    );

    if (foundSkill) {
      matchedSkillsCount++;
      const tWeight = (foundSkill.level || 70) / 100.0;
      dotProduct += qWeight * tWeight;
      normCandidateSq += tWeight * tWeight;

      // Cek apakah ada SBT on-chain yang memvalidasi skill ini
      if (sbtList && sbtList.length > 0) {
        const sbtMatch = sbtList.some(
          (sbt) =>
            sbt.category?.toLowerCase().includes(reqSkill.toLowerCase()) ||
            sbt.title?.toLowerCase().includes(reqSkill.toLowerCase())
        );
        if (sbtMatch) {
          hasMatchingSbt = true;
        }
      }
    }
  });

  if (matchedSkillsCount === 0 || normCandidateSq === 0) {
    return {
      score: 0,
      cosine: 0,
      matchedSkillsCount: 0,
      hasSbtBonus: false
    };
  }

  const denominator = Math.sqrt(normQuerySq) * Math.sqrt(normCandidateSq);
  let cosine = denominator > 0 ? dotProduct / denominator : 0;

  // Rasio cakupan skill yang cocok dari seluruh kriteria yang dicari
  const coverageRatio = matchedSkillsCount / requiredSkills.length;

  // Nilai dasar persentase kemiripan vektor dikalikan cakupan
  let percentage = Math.round(cosine * coverageRatio * 100);

  // Bonus Kredensial On-Chain SBT (+8% up to max 99% jika diverifikasi smart contract)
  if (hasMatchingSbt) {
    percentage = Math.min(99, percentage + 8);
  }

  return {
    score: Math.max(0, percentage),
    cosine: Number(cosine.toFixed(4)),
    matchedSkillsCount,
    hasSbtBonus: hasMatchingSbt
  };
};

export const formatAddress = (addr) => {
  if (!addr) return '0x0000...0000';
  if (addr.length <= 12) return addr;
  return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
};

export const formatTxHash = (hash) => {
  if (!hash) return '0x0000...0000';
  if (hash.length <= 16) return hash;
  return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
};

export const checkCandidateHasSkillSbt = (talent, skillName) => {
  if (!talent || !skillName) return null;
  const sbtList = talent.sbtList || (talent.latestSbt ? [talent.latestSbt] : []);
  return sbtList.find((sbt) => {
    const sbtText = `${sbt.title || ''} ${sbt.category || ''}`.toLowerCase();
    return sbtText.includes(skillName.toLowerCase());
  }) || null;
};
