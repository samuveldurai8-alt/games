import {
  THIS_OR_THAT_PAIRS,
  SWIPE_MATCH_PROMPTS,
  HOW_WELL_DO_YOU_KNOW_ME_QUESTIONS,
  MIND_READER_SCENARIOS,
  WOULD_YOU_RATHER_PROMPTS,
  COUPLE_QUIZ_QUESTIONS,
  EMOJI_DECODER_PUZZLES,
  MYSTERY_CARD_PROMPTS,
} from '../data/questionBanks';

export function getInitialGameState(
  gameId: string,
  hostUid: string,
  previousScores: Record<string, number> = {},
  nextRound: number = 1
): Record<string, any> {
  const emojiPairs = ['🌸', '💖', '🍓', '🧸', '💍', '☕', '🐱', '🌙'];
  const shuffledCards = [...emojiPairs, ...emojiPairs];
  for (let i = shuffledCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
  }

  // 6 distinct mystery card indices
  const mysteryCardIndices: number[] = [];
  const maxMystery = Math.max(6, MYSTERY_CARD_PROMPTS.length);
  while (mysteryCardIndices.length < Math.min(6, MYSTERY_CARD_PROMPTS.length)) {
    const r = Math.floor(Math.random() * maxMystery);
    if (!mysteryCardIndices.includes(r) && r < MYSTERY_CARD_PROMPTS.length) {
      mysteryCardIndices.push(r);
    }
  }

  switch (gameId) {
    case 'tictactoe':
      return {
        board: Array(9).fill(null),
        currentTurnUid: hostUid,
        scores: previousScores,
        winnerUid: null,
        winningLine: null,
        round: nextRound,
      };
    case 'connectfour':
      return {
        grid: Array(6).fill(null).map(() => Array(7).fill(null)),
        currentTurnUid: hostUid,
        scores: previousScores,
        winnerUid: null,
        round: nextRound,
      };
    case 'rps':
      return {
        choices: {},
        scores: previousScores,
        round: nextRound,
        roundWinner: null,
      };
    case 'truthordare':
      return {
        currentTurnUid: hostUid,
        currentCard: null,
        completedCount: previousScores.completed || 0,
        spinAngle: 0,
        isSpinning: false,
        spinTargetUid: null,
        hasSpun: false,
        scores: previousScores,
        round: nextRound,
      };
    case 'thisorthat':
      return {
        pairIndex: Math.floor(Math.random() * THIS_OR_THAT_PAIRS.length),
        choices: {},
        matchScore: previousScores.matches || 0,
        scores: previousScores,
        round: nextRound,
      };
    case 'swipematch':
      return {
        promptIndex: Math.floor(Math.random() * SWIPE_MATCH_PROMPTS.length),
        votes: {},
        historyList: [],
        scores: previousScores,
        round: nextRound,
      };
    case 'howwelldoyouknowme':
      return {
        questionIndex: Math.floor(Math.random() * HOW_WELL_DO_YOU_KNOW_ME_QUESTIONS.length),
        subjectUid: hostUid,
        secretAnswer: null,
        guessAnswer: null,
        scores: previousScores,
        round: nextRound,
      };
    case 'mindreader':
      return {
        scenarioIndex: Math.floor(Math.random() * MIND_READER_SCENARIOS.length),
        submissions: {},
        scores: previousScores,
        round: nextRound,
      };
    case 'memorymatch':
      return {
        cards: shuffledCards,
        revealedIndices: [],
        matchedIndices: [],
        currentTurnUid: hostUid,
        scores: previousScores,
        isGameOver: false,
        round: nextRound,
      };
    case 'quicktap':
      return {
        phase: 'ready',
        goTime: 0,
        winnerUid: null,
        falseStartUid: null,
        reactionTimes: {},
        scores: previousScores,
        round: nextRound,
      };
    case 'wouldyourather':
      return {
        promptIndex: Math.floor(Math.random() * WOULD_YOU_RATHER_PROMPTS.length),
        submissions: {},
        scores: previousScores,
        round: nextRound,
      };
    case 'couplequiz':
      return {
        questionIndex: Math.floor(Math.random() * COUPLE_QUIZ_QUESTIONS.length),
        answers: {},
        matchCount: previousScores.matches || 0,
        scores: previousScores,
        round: nextRound,
      };
    case 'emojidecoder':
      return {
        puzzleIndex: Math.floor(Math.random() * EMOJI_DECODER_PUZZLES.length),
        isSolved: false,
        showHint: false,
        solvedByUid: null,
        scores: previousScores,
        round: nextRound,
      };
    case 'mysterycards':
      return {
        cards: mysteryCardIndices,
        activeCardIndex: null,
        revealedIndices: [],
        currentTurnUid: hostUid,
        scores: previousScores,
        round: nextRound,
      };
    case 'couplequest':
      return {
        chapterIndex: 0,
        votes: {},
        chosenPath: [],
        starsCollected: previousScores.stars || 0,
        isCompleted: false,
        scores: previousScores,
        round: nextRound,
      };
    case 'dreamdate':
      return {
        currentStep: 0,
        selections: {},
        isFinished: false,
        scores: previousScores,
        round: nextRound,
      };
    default:
      return { scores: previousScores, round: nextRound };
  }
}
