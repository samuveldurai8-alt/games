import React, { useEffect } from 'react';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { Sparkles, Heart, RotateCcw, CheckCircle, ArrowRight } from 'lucide-react';
import { Room } from '../../types';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { sound } from '../../utils/sound';
import { fireHeartConfetti } from '../../utils/confetti';
import { MYSTERY_CARD_PROMPTS } from '../../data/questionBanks';

interface MysteryCardsProps {
  room: Room;
  currentUserUid: string;
  onRematch?: () => void;
}

export const MysteryCardsGame: React.FC<MysteryCardsProps> = ({ room, currentUserUid, onRematch }) => {
  const gameState = room.gameState || {};
  const cards: number[] = gameState.cards || [0, 1, 2, 3, 4, 5];
  const activeCardIndex: number | null = gameState.activeCardIndex !== undefined ? gameState.activeCardIndex : null;
  const revealedIndices: number[] = gameState.revealedIndices || [];
  const currentTurnUid: string = gameState.currentTurnUid || room.hostUid;

  const playersList = Object.values(room.players || {});
  const partnerPlayer = playersList.find((p) => p.uid !== currentUserUid);
  const isMyTurn = currentTurnUid === currentUserUid;

  useEffect(() => {
    if (!room.gameState || !room.gameState.cards) {
      if (room.hostUid === currentUserUid) {
        dealNewDeck();
      }
    }
  }, [room.gameState, room.hostUid, currentUserUid]);

  const dealNewDeck = async () => {
    if (onRematch) {
      onRematch();
      return;
    }
    try {
      sound.playCardFlip();
      // Pick 6 random distinct indices from MYSTERY_CARD_PROMPTS
      const indices: number[] = [];
      while (indices.length < 6) {
        const rand = Math.floor(Math.random() * MYSTERY_CARD_PROMPTS.length);
        if (!indices.includes(rand)) indices.push(rand);
      }

      const now = new Date().toISOString();
      await updateDoc(doc(db, 'rooms', room.roomId), {
        gameState: {
          cards: indices,
          activeCardIndex: null,
          revealedIndices: [],
          currentTurnUid: room.hostUid,
        },
        updatedAt: now,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.roomId}`);
    }
  };

  const handlePickCard = async (slotIdx: number) => {
    if (!isMyTurn || revealedIndices.includes(slotIdx) || activeCardIndex !== null) return;

    try {
      sound.playCardFlip();
      fireHeartConfetti();
      const now = new Date().toISOString();

      await updateDoc(doc(db, 'rooms', room.roomId), {
        'gameState.activeCardIndex': slotIdx,
        'gameState.revealedIndices': [...revealedIndices, slotIdx],
        updatedAt: now,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.roomId}`);
    }
  };

  const handleFinishTurn = async () => {
    try {
      sound.playSuccess();
      const nextTurnUid = partnerPlayer ? partnerPlayer.uid : currentUserUid;
      const now = new Date().toISOString();

      await updateDoc(doc(db, 'rooms', room.roomId), {
        'gameState.activeCardIndex': null,
        'gameState.currentTurnUid': nextTurnUid,
        updatedAt: now,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.roomId}`);
    }
  };

  const activePrompt = activeCardIndex !== null ? MYSTERY_CARD_PROMPTS[cards[activeCardIndex]] : null;
  const allRevealed = revealedIndices.length >= cards.length;

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto">
      {/* Turn indicator */}
      <div className="mb-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fuchsia-100 text-fuchsia-900 text-xs font-semibold">
          {isMyTurn ? (
            <span className="flex items-center gap-1.5 text-pink-600 font-bold">
              <Sparkles className="w-3.5 h-3.5" /> Your Turn to Pick a Fate Card!
            </span>
          ) : (
            <span>
              {partnerPlayer?.nickname || 'Partner'}'s turn to draw a card...
            </span>
          )}
        </div>
      </div>

      {/* Revealed Active Card Display */}
      {activePrompt && (
        <div className="w-full bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-400 text-white rounded-3xl p-6 sm:p-7 shadow-lg text-center mb-6 animate-scale-in">
          <span className="text-xs uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full font-bold">
            🔮 {activePrompt.title}
          </span>
          <p className="font-heading font-bold text-lg sm:text-xl my-4 leading-relaxed">
            "{activePrompt.text}"
          </p>
          <button
            onClick={handleFinishTurn}
            className="px-6 py-2.5 rounded-2xl bg-white text-pink-600 text-xs font-bold uppercase tracking-wider shadow-md hover:bg-pink-50 transition-colors cursor-pointer"
          >
            Finished & Pass Turn 💕
          </button>
        </div>
      )}

      {/* Grid of 6 Mystery Cards */}
      <div className="grid grid-cols-3 gap-3 w-full mb-6">
        {cards.map((promptIdx, slotIdx) => {
          const isFlipped = revealedIndices.includes(slotIdx);
          const prompt = MYSTERY_CARD_PROMPTS[promptIdx];

          return (
            <button
              key={slotIdx}
              onClick={() => handlePickCard(slotIdx)}
              disabled={!isMyTurn || isFlipped || activeCardIndex !== null}
              className={`h-36 sm:h-40 rounded-2xl p-3 border-2 transition-all flex flex-col items-center justify-center select-none text-center cursor-pointer ${
                isFlipped
                  ? 'bg-fuchsia-50 border-fuchsia-200 text-purple-900 shadow-2xs'
                  : isMyTurn && activeCardIndex === null
                  ? 'bg-gradient-to-tr from-purple-800 via-fuchsia-800 to-pink-700 border-fuchsia-400 text-white shadow-md hover:scale-105 active:scale-95'
                  : 'bg-purple-900/80 border-purple-800 text-purple-300 opacity-70 cursor-not-allowed'
              }`}
            >
              {isFlipped ? (
                <>
                  <span className="text-xl mb-1">✨</span>
                  <span className="text-[11px] font-bold text-purple-950 line-clamp-1">{prompt.title}</span>
                  <span className="text-[10px] text-fuchsia-600 font-semibold mt-1">Revealed ✓</span>
                </>
              ) : (
                <>
                  <span className="text-3xl mb-2 animate-pulse">🔮</span>
                  <span className="text-[11px] font-bold tracking-wider uppercase">Card #{slotIdx + 1}</span>
                </>
              )}
            </button>
          );
        })}
      </div>

      {allRevealed && (
        <button
          onClick={dealNewDeck}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white font-bold text-sm shadow-md hover:opacity-95 transition-opacity flex items-center gap-2 cursor-pointer animate-scale-in"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Deal 6 Fresh Cards</span>
        </button>
      )}
    </div>
  );
};
