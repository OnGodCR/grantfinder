/**
 * Grant Match Score Algorithm
 * 
 * This algorithm calculates a match score (0-100) for grants based on various factors:
 * - Research interests and keywords
 * - Funding amount preferences
 * - Deadline urgency
 * - Agency type preferences
 * - Geographic location
 * - Grant type and category
 */

export interface UserProfile {
  researchInterests: string[];
  fundingRange: { min: number; max: number };
  preferredAgencies: string[];
  preferredGrantTypes: string[];
  location?: string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  deadlineBuffer: number; // days
}

export interface Grant {
  id: string;
  title: string;
  description: string;
  summary?: string;
  agency?: string;
  fundingMin?: number;
  fundingMax?: number;
  currency?: string;
  deadline?: string;
  grantType?: string;
  category?: string;
  keywords?: string[];
  location?: string;
  eligibility?: string;
  url?: string;
}

export interface MatchFactors {
  keywordMatch: number;
  fundingMatch: number;
  deadlineMatch: number;
  agencyMatch: number;
  typeMatch: number;
  locationMatch: number;
  experienceMatch: number;
}

export interface MatchResult {
  score: number;
  factors: MatchFactors;
  explanation: string[];
  recommendations: string[];
}

/**
 * Calculate match score between a grant and user profile
 */
export function calculateMatchScore(grant: Grant, profile: UserProfile): MatchResult {
  // More lenient fallback - only use if truly no data
  const hasBasicData = grant.title || grant.description;
  if (!hasBasicData) {
    return {
      score: 15, // Very low score for no data
      factors: {
        keywordMatch: 0.1,
        fundingMatch: 0.2,
        deadlineMatch: 0.1,
        agencyMatch: 0.1,
        typeMatch: 0.1,
        locationMatch: 0.1,
        experienceMatch: 0.1,
      },
      explanation: ['No data available for matching'],
      recommendations: ['Review grant details for better assessment'],
    };
  }

  const factors: MatchFactors = {
    keywordMatch: 0,
    fundingMatch: 0,
    deadlineMatch: 0,
    agencyMatch: 0,
    typeMatch: 0,
    locationMatch: 0,
    experienceMatch: 0,
  };

  const explanation: string[] = [];
  const recommendations: string[] = [];

  // 1. Keyword/Research Interest Matching (30% weight)
  factors.keywordMatch = calculateKeywordMatch(grant, profile);
  if (factors.keywordMatch > 0.8) {
    explanation.push('Excellent match with your research interests');
  } else if (factors.keywordMatch > 0.6) {
    explanation.push('Good match with your research interests');
  } else if (factors.keywordMatch > 0.3) {
    explanation.push('Partial match with your research interests');
  } else {
    explanation.push('Limited match with your research interests');
    recommendations.push('Consider expanding your research scope or looking for more relevant grants');
  }

  // 2. Funding Amount Matching (20% weight)
  factors.fundingMatch = calculateFundingMatch(grant, profile);
  if (factors.fundingMatch > 0.8) {
    explanation.push('Funding amount aligns perfectly with your preferences');
  } else if (factors.fundingMatch > 0.6) {
    explanation.push('Funding amount is within your preferred range');
  } else if (factors.fundingMatch > 0.3) {
    explanation.push('Funding amount is close to your preferences');
  } else {
    explanation.push('Funding amount may not meet your expectations');
    recommendations.push('Consider adjusting your funding expectations or looking for larger grants');
  }

  // 3. Deadline Matching (15% weight)
  factors.deadlineMatch = calculateDeadlineMatch(grant, profile);
  if (factors.deadlineMatch > 0.8) {
    explanation.push('Deadline gives you plenty of time to prepare');
  } else if (factors.deadlineMatch > 0.6) {
    explanation.push('Deadline is manageable with good planning');
  } else if (factors.deadlineMatch > 0.3) {
    explanation.push('Deadline is approaching soon');
    recommendations.push('Start working on your application immediately');
  } else {
    explanation.push('Deadline is very close or has passed');
    recommendations.push('This grant may not be suitable due to timing');
  }

  // 4. Agency Matching (15% weight)
  factors.agencyMatch = calculateAgencyMatch(grant, profile);
  if (factors.agencyMatch > 0.8) {
    explanation.push('From your preferred funding agency');
  } else if (factors.agencyMatch > 0.6) {
    explanation.push('From a reputable funding agency');
  } else if (factors.agencyMatch > 0.3) {
    explanation.push('From a recognized funding source');
  } else {
    explanation.push('From an agency you may not be familiar with');
    recommendations.push('Research this agency to understand their funding priorities');
  }

  // 5. Grant Type Matching (10% weight)
  factors.typeMatch = calculateTypeMatch(grant, profile);
  if (factors.typeMatch > 0.8) {
    explanation.push('Perfect match for your preferred grant type');
  } else if (factors.typeMatch > 0.6) {
    explanation.push('Good match for your grant preferences');
  } else if (factors.typeMatch > 0.3) {
    explanation.push('Somewhat matches your grant preferences');
  } else {
    explanation.push('May not align with your typical grant preferences');
  }

  // 6. Location Matching (5% weight)
  factors.locationMatch = calculateLocationMatch(grant, profile);
  if (factors.locationMatch > 0.8) {
    explanation.push('Perfect geographic match');
  } else if (factors.locationMatch > 0.6) {
    explanation.push('Good geographic compatibility');
  } else if (factors.locationMatch > 0.3) {
    explanation.push('Some geographic considerations');
  } else {
    explanation.push('May require travel or relocation');
    recommendations.push('Consider if you can meet location requirements');
  }

  // 7. Experience Level Matching (5% weight)
  factors.experienceMatch = calculateExperienceMatch(grant, profile);
  if (factors.experienceMatch > 0.8) {
    explanation.push('Perfect match for your experience level');
  } else if (factors.experienceMatch > 0.6) {
    explanation.push('Good match for your experience level');
  } else if (factors.experienceMatch > 0.3) {
    explanation.push('May require some additional experience');
  } else {
    explanation.push('May be too advanced or too basic for your level');
    recommendations.push('Consider if you meet the experience requirements');
  }

  // Calculate weighted score (aligned with backend weights)
  const weights = {
    keywordMatch: 0.35,    // Increased weight for keywords to match backend
    fundingMatch: 0.20,
    deadlineMatch: 0.15,
    agencyMatch: 0.15,
    typeMatch: 0.10,
    locationMatch: 0.05,
    experienceMatch: 0.00, // Removed experience weight to match backend
  };

  const score = Math.round(
    factors.keywordMatch * weights.keywordMatch +
    factors.fundingMatch * weights.fundingMatch +
    factors.deadlineMatch * weights.deadlineMatch +
    factors.agencyMatch * weights.agencyMatch +
    factors.typeMatch * weights.typeMatch +
    factors.locationMatch * weights.locationMatch +
    factors.experienceMatch * weights.experienceMatch
  );

  return {
    score: Math.min(100, Math.max(0, score)),
    factors,
    explanation,
    recommendations,
  };
}

/**
 * Calculate keyword matching score
 */
function calculateKeywordMatch(grant: Grant, profile: UserProfile): number {
  const grantText = `${grant.title} ${grant.description} ${grant.summary || ''} ${grant.keywords?.join(' ') || ''}`.toLowerCase();
  const userInterests = profile.researchInterests.map(interest => interest.toLowerCase());
  
  if (userInterests.length === 0) return 0.3; // Default score if no interests
  
  let totalScore = 0;
  let exactMatches = 0;
  let partialMatches = 0;

  for (const interest of userInterests) {
    const words = interest.split(/\s+/).filter(word => word.length > 2);
    let interestScore = 0;
    
    for (const word of words) {
      // Exact word boundary match (higher weight)
      const exactRegex = new RegExp(`\\b${word}\\b`, 'gi');
      if (exactRegex.test(grantText)) {
        exactMatches++;
        interestScore += 1.0;
      }
      // Partial match (lower weight)
      else if (grantText.includes(word)) {
        partialMatches++;
        interestScore += 0.5;
      }
    }
    
    // Cap each interest at 1.0
    totalScore += Math.min(interestScore, 1.0);
  }

  // Calculate base score
  const baseScore = totalScore / userInterests.length;
  
  // Bonus for multiple exact matches
  const exactBonus = Math.min(exactMatches * 0.1, 0.3);
  
  // If no matches found, give a decent score based on common research terms
  if (baseScore === 0) {
    const commonTerms = ['research', 'study', 'investigation', 'analysis', 'development', 'innovation', 'technology', 'science', 'grant', 'funding', 'project', 'program'];
    let commonMatches = 0;
    for (const term of commonTerms) {
      if (grantText.includes(term)) {
        commonMatches += 0.15;
      }
    }
    return Math.min(commonMatches, 0.6);
  }

  // Ensure minimum score and cap at 1.0
  const finalScore = Math.max(baseScore + exactBonus, 0.2);
  return Math.min(finalScore, 1.0);
}

/**
 * Calculate funding amount matching score
 */
function calculateFundingMatch(grant: Grant, profile: UserProfile): number {
  if (!grant.fundingMin && !grant.fundingMax) return 0.7; // Unknown funding - good score

  const grantMin = grant.fundingMin || 0;
  const grantMax = grant.fundingMax || grantMin;
  const userMin = profile.fundingRange.min;
  const userMax = profile.fundingRange.max;

  // Check if grant funding overlaps with user preferences
  if (grantMax < userMin) {
    return 0.4; // Grant max is below user minimum
  }
  if (grantMin > userMax) {
    return 0.4; // Grant min is above user maximum
  }

  // Calculate overlap percentage
  const overlapMin = Math.max(grantMin, userMin);
  const overlapMax = Math.min(grantMax, userMax);
  const overlap = Math.max(0, overlapMax - overlapMin);
  const totalRange = Math.max(grantMax - grantMin, userMax - userMin);

  if (totalRange > 0) {
    const overlapScore = overlap / totalRange;
    return Math.max(0.5, overlapScore); // Minimum 50% score
  }
  
  return 0.9; // If ranges are the same, give high score
}

/**
 * Calculate deadline matching score
 */
function calculateDeadlineMatch(grant: Grant, profile: UserProfile): number {
  if (!grant.deadline) return 0.7; // Unknown deadline - give good score

  const deadline = new Date(grant.deadline);
  const now = new Date();
  const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilDeadline < 0) return 0.1; // Deadline has passed - very low score

  // More generous scoring
  if (daysUntilDeadline >= 30 && daysUntilDeadline <= 90) {
    return 1; // Perfect timing
  } else if (daysUntilDeadline >= 14 && daysUntilDeadline < 30) {
    return 0.9; // Good timing, slightly rushed
  } else if (daysUntilDeadline > 90) {
    return 0.8; // Plenty of time
  } else if (daysUntilDeadline >= 7) {
    return 0.6; // Tight deadline but manageable
  } else {
    return 0.3; // Very tight deadline
  }
}

/**
 * Calculate agency matching score
 */
function calculateAgencyMatch(grant: Grant, profile: UserProfile): number {
  if (!grant.agency) return 0.6; // Unknown agency - give decent score

  const agency = grant.agency.toLowerCase();
  const preferredAgencies = profile.preferredAgencies.map(a => a.toLowerCase());

  // Check for exact match
  for (const preferred of preferredAgencies) {
    if (agency.includes(preferred) || preferred.includes(agency)) {
      return 1;
    }
  }

  // Check for partial match
  for (const preferred of preferredAgencies) {
    const words = preferred.split(/\s+/);
    let matchCount = 0;
    for (const word of words) {
      if (word.length > 2 && agency.includes(word)) {
        matchCount++;
      }
    }
    if (matchCount > 0) {
      return 0.7 + (matchCount / words.length) * 0.3;
    }
  }

  // Check for common agency types - give higher scores
  const commonAgencies = ['nsf', 'nih', 'doe', 'darpa', 'foundation', 'institute', 'university', 'government', 'federal', 'state'];
  for (const common of commonAgencies) {
    if (agency.includes(common)) {
      return 0.6; // Higher score for common agencies
    }
  }

  return 0.4; // Unknown agency - still give decent score
}

/**
 * Calculate grant type matching score
 */
function calculateTypeMatch(grant: Grant, profile: UserProfile): number {
  if (!grant.grantType && !grant.category) return 0.6; // Unknown type - give decent score

  const grantType = `${grant.grantType || ''} ${grant.category || ''}`.toLowerCase();
  const preferredTypes = profile.preferredGrantTypes.map(t => t.toLowerCase());

  // Check for exact match
  for (const preferred of preferredTypes) {
    if (grantType.includes(preferred)) {
      return 1;
    }
  }

  // Check for partial match
  for (const preferred of preferredTypes) {
    const words = preferred.split(/\s+/);
    let matchCount = 0;
    for (const word of words) {
      if (word.length > 2 && grantType.includes(word)) {
        matchCount++;
      }
    }
    if (matchCount > 0) {
      return 0.6 + (matchCount / words.length) * 0.4;
    }
  }

  // Check for common grant types
  const commonTypes = ['research', 'fellowship', 'grant', 'funding', 'scholarship', 'award', 'project'];
  for (const common of commonTypes) {
    if (grantType.includes(common)) {
      return 0.5; // Give decent score for common types
    }
  }

  return 0.4; // No clear match - still give decent score
}

/**
 * Calculate location matching score
 */
function calculateLocationMatch(grant: Grant, profile: UserProfile): number {
  if (!grant.location && !profile.location) return 0.7; // No location info - give good score

  if (!grant.location) return 0.7; // Grant location unknown - give good score
  if (!profile.location) return 0.7; // User location unknown - give good score

  const grantLocation = grant.location.toLowerCase();
  const userLocation = profile.location.toLowerCase();

  // Check for exact match
  if (grantLocation.includes(userLocation) || userLocation.includes(grantLocation)) {
    return 1;
  }

  // Check for country match
  const countries = ['usa', 'united states', 'canada', 'uk', 'united kingdom', 'australia', 'germany', 'france'];
  let grantCountry = '';
  let userCountry = '';

  for (const country of countries) {
    if (grantLocation.includes(country)) grantCountry = country;
    if (userLocation.includes(country)) userCountry = country;
  }

  if (grantCountry && userCountry) {
    return grantCountry === userCountry ? 0.9 : 0.5; // Higher score for different countries
  }

  // Check for remote/international opportunities
  if (grantLocation.includes('remote') || grantLocation.includes('international') || grantLocation.includes('global')) {
    return 0.8;
  }

  return 0.6; // No clear location match - still give decent score
}

/**
 * Calculate experience level matching score
 */
function calculateExperienceMatch(grant: Grant, profile: UserProfile): number {
  const grantText = `${grant.title} ${grant.description} ${grant.summary || ''} ${grant.eligibility || ''}`.toLowerCase();
  
  const experienceKeywords = {
    beginner: ['undergraduate', 'student', 'entry-level', 'junior', 'novice', 'learning', 'young', 'emerging'],
    intermediate: ['graduate', 'masters', 'phd student', 'early career', 'postdoc', 'researcher', 'scholar'],
    advanced: ['senior', 'principal', 'lead', 'experienced', 'established', 'professional', 'expert'],
    expert: ['director', 'chief', 'head', 'distinguished', 'emeritus', 'pioneer', 'leader', 'senior']
  };

  const userLevel = profile.experienceLevel;
  const userKeywords = experienceKeywords[userLevel] || [];
  
  let matchScore = 0.6; // Higher default score

  // Check for positive matches
  for (const keyword of userKeywords) {
    if (grantText.includes(keyword)) {
      matchScore += 0.15; // Higher bonus for matches
    }
  }

  // Check for negative matches (too advanced or too basic) - less penalty
  for (const [level, keywords] of Object.entries(experienceKeywords)) {
    if (level !== userLevel) {
      for (const keyword of keywords) {
        if (grantText.includes(keyword)) {
          matchScore -= 0.02; // Less penalty
        }
      }
    }
  }

  return Math.min(1, Math.max(0.4, matchScore)); // Minimum 40% score
}

/**
 * Get default user profile for testing
 */
export function getDefaultUserProfile(): UserProfile {
  return {
    researchInterests: [
      'Machine Learning',
      'Artificial Intelligence',
      'Data Science',
      'Computer Vision',
      'Natural Language Processing'
    ],
    fundingRange: { min: 50000, max: 500000 },
    preferredAgencies: ['NSF', 'NIH', 'DARPA', 'DOE'],
    preferredGrantTypes: ['Research Grant', 'Fellowship', 'Innovation Grant'],
    location: 'United States',
    experienceLevel: 'intermediate',
    deadlineBuffer: 30,
  };
}

/**
 * Batch calculate match scores for multiple grants
 */
export function calculateBatchMatchScores(grants: Grant[], profile: UserProfile): Array<Grant & { matchScore: number; matchResult: MatchResult }> {
  return grants.map(grant => {
    const matchResult = calculateMatchScore(grant, profile);
    return {
      ...grant,
      matchScore: matchResult.score,
      matchResult,
    };
  }).sort((a, b) => b.matchScore - a.matchScore); // Sort by match score descending
}
