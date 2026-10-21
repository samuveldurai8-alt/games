import React, { useEffect } from 'react';
import { doc, updateDoc, addDoc, collection, runTransaction } from 'firebase/firestore';
import { Sparkles, Heart, RotateCcw, Trophy } from 'lucide-react';
import { Room } from '../../types';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { sound } from '../../utils/sound';
import { fireVictoryFanfare, fireHeartConfetti } from '../../utils/confetti';

interface MemoryProps {
  room: Room;
  currentUserUid: string;
  onRematch?: () => void;
}

const EMOJI_PAIRS = ['🌸', '💖', '🍓', '🧸', '💍', '☕', '🐱', '🌙'];

function generateShuffledCards(): string[] {
  const cards = [...EMOJI_PAIRS, ...EMOJI_PAIRS];
  // Fisher-Yates shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

export const MemoryMatchGame: React.FC<MemoryProps> = ({ room, currentUserUid, onRematch }) => {
  const gameState = room.gameState || {};
  const cards: string[] = gameState.cards || [];
  const revealedIndices: number[] = gameState.revealedIndices || [];
  const matchedIndices: number[] = gameState.matchedIndices || [];
  const currentTurnUid: string = gameState.currentTurnUid || room.hostUid;
  const scores: Record<string, number> = gameState.scores || {};
  const isGameOver: boolean = gameState.isGameOver || false;

  const playersList = Object.values(room.players || {});
  const partnerPlayer = playersList.find((p) => p.uid !== currentUserUid);
  const isMyTurn = currentTurnUid === currentUserUid && !isGameOver;

  useEffect(() => {
    if (!room.gameState || !room.gameState.cards || room.gameState.cards.length === 0) {
      if (room.hostUid === currentUserUid) {
        initGame();
      }
    }
  }, [room.gameState, room.hostUid, currentUserUid]);

  const initGame = async () => {
    if (onRematch) {
      onRematch();
      return;
    }
    try {
      const now = new Date().toISOString();
      await updateDoc(doc(db, 'rooms', room.roomId), {
        gameState: {
          cards: generateShuffledCards(),
          revealedIndices: [],
          matchedIndices: [],
          currentTurnUid: room.hostUid,
          scores: playersList.reduce((acc, p) => ({ ...acc, [p.uid]: 0 }), {}),
          isGameOver: false,
        },
        updatedAt: now,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.roomId}`);
    }
  };

  const handleFlipCard = async (index: number) => {
    if (!isMyTurn || matchedIndices.includes(index) || revealedIndices.includes(index) || revealedIndices.length >= 2) {
      return;
    }

    const roomRef = doc(db, 'rooms', room.roomId);
    try {
      sound.playCardFlip();
      let matchResult = 'none';
      let allFound = false;

      await runTransaction(db, async (transaction) => {
        const freshSnap = await transaction.get(roomRef);
        if (!freshSnap.exists()) return;
        const freshData = freshSnap.data() as Room;
        const currentGS = freshData.gameState || {};

        if (currentGS.isGameOver) return;
        if (currentGS.currentTurnUid !== currentUserUid) return;

        const currentCards: string[] = currentGS.cards || [];
        const currentRevealed: number[] = currentGS.revealedIndices || [];
        const currentMatched: number[] = currentGS.matchedIndices || [];
        const currentScores: Record<string, number> = { ...(currentGS.scores || {}) };

        if (currentRevealed.length >= 2) return;
        if (currentRevealed.includes(index) || currentMatched.includes(index)) return;

        const nextRevealed = [...currentRevealed, index];
        const now = new Date().toISOString();

        if (nextRevealed.length === 1) {
          transaction.update(roomRef, {
            'gameState.revealedIndices': nextRevealed,
            updatedAt: now,
          });
        } else if (nextRevealed.length === 2) {
          const [idx1, idx2] = nextRevealed;
          const isMatch = currentCards[idx1] === currentCards[idx2];

          if (isMatch) {
            matchResult = 'matched';
            const nextMatched = [...currentMatched, idx1, idx2];
            currentScores[currentUserUid] = (currentScores[currentUserUid] || 0) + 1;
            allFound = nextMatched.length === currentCards.length;

            transaction.update(roomRef, {
              'gameState.revealedIndices': [],
              'gameState.matchedIndices': nextMatched,
              'gameState.scores': currentScores,
              'gameState.isGameOver': allFound,
              updatedAt: now,
            });
          } else {
            matchResult = 'mismatch';
            transaction.update(roomRef, {
              'gameState.revealedIndices': nextRevealed,
              updatedAt: now,
            });
          }
        }
      });

      if (matchResult === 'matched') {
        sound.playSuccess();
        fireHeartConfetti();
        if (allFound) {
          fireVictoryFanfare();
          addDoc(collection(db, 'rooms', room.roomId, 'history'), {
            gameId: 'memorymatch',
            gameTitle: 'Memory Match',
            winnerUid: currentUserUid,
            scores: { ...scores, [currentUserUid]: (scores[currentUserUid] || 0) + 1 },
            summary: 'All sweet pairs uncovered!',
            completedAt: new Date().toISOString(),
          }).catch(() => {});
        }
      } else if (matchResult === 'mismatch') {
        // Hide after 1.2s and switch turn
        setTimeout(async () => {
          try {
            const nextTurnUid = partnerPlayer ? partnerPlayer.uid : currentUserUid;
            await updateDoc(roomRef, {
              'gameState.revealedIndices': [],
              'gameState.currentTurnUid': nextTurnUid,
              updatedAt: new Date().toISOString(),
            });
          } catch {
            // ignore timeout error
          }
        }, 1200);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.roomId}`);
    }
  };

  // Determine winner
  const myScore = scores[currentUserUid] || 0;
  const partnerScore = partnerPlayer ? scores[partnerPlayer.uid] || 0 : 0;
  let winnerText = 'Both hearts matched wonderfully!';
  if (myScore > partnerScore) winnerText = 'You Won This Round! 🎉';
  else if (partnerScore > myScore) winnerText = `${partnerPlayer?.nickname || 'Partner'} Won! 🌸`;

  return (
    <div className="flex flex-col items-center max-w-md mx-auto">
      {/* Header status */}
      <div className="mb-4 text-center">
        {isGameOver ? (
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm shadow-xs animate-bounce">
            <Trophy className="w-4 h-4 text-emerald-600" />
            <span>{winnerText}</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-purple-900 text-xs font-semibold">
            {isMyTurn ? (
              <span className="flex items-center gap-1.5 text-pink-600 font-bold">
                <Heart className="w-3.5 h-3.5 fill-pink-600 animate-pulse" /> Your Turn to Flip Cards!
              </span>
            ) : (
              <span>
                {partnerPlayer?.nickname || 'Partner'}'s turn to find a pair...
              </span>
            )}
          </div>
        )}
      </div>

      {/* 4x4 Grid */}
      <div className="grid grid-cols-4 gap-2.5 w-72 sm:w-80 p-3 bg-pink-100/50 rounded-3xl border-2 border-pink-200 shadow-inner select-none mb-6">
        {cards.map((emoji, idx) => {
          const isFlipped = revealedIndices.includes(idx) || matchedIndices.includes(idx);
          const isMatched = matchedIndices.includes(idx);

          return (
            <button
              key={idx}
              onClick={() => handleFlipCard(idx)}
              disabled={!isMyTurn || isFlipped}
              className={`h-16 sm:h-18 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-bold transition-all duration-300 cursor-pointer ${
                isMatched
                  ? 'bg-emerald-100 border-2 border-emerald-300 text-emerald-700 shadow-2xs scale-95'
                  : isFlipped
                  ? 'bg-white border-2 border-pink-400 shadow-sm'
                  : isMyTurn
                  ? 'bg-gradient-to-tr from-pink-300 via-rose-300 to-purple-300 border border-pink-200 text-white shadow-2xs hover:scale-105 active:scale-95'
                  : 'bg-purple-200/60 border border-purple-200 text-transparent cursor-not-allowed'
              }`}
            >
              {isFlipped ? emoji : '🌸'}
            </button>
          );
        })}
      </div>

      {/* Rematch button */}
      {isGameOver && (
        <button
          onClick={initGame}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold text-sm shadow-md hover:opacity-95 transition-opacity flex items-center gap-2 cursor-pointer animate-scale-in"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Play Again</span>
        </button>
      )}
    </div>
  );
};
