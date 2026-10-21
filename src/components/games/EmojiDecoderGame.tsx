import React, { useState, useEffect } from 'react';
import { doc, updateDoc, addDoc, collection, runTransaction } from 'firebase/firestore';
import { Sparkles, Heart, Trophy, ArrowRight, Lightbulb, CheckCircle2 } from 'lucide-react';
import { Room } from '../../types';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { sound } from '../../utils/sound';
import { fireVictoryFanfare } from '../../utils/confetti';
import { EMOJI_DECODER_PUZZLES } from '../../data/questionBanks';

interface EmojiDecoderProps {
  room: Room;
  currentUserUid: string;
  onRematch?: () => void;
}

export const EmojiDecoderGame: React.FC<EmojiDecoderProps> = ({ room, currentUserUid, onRematch }) => {
  const gameState = room.gameState || {};
  const puzzleIndex: number = gameState.puzzleIndex || 0;
  const isSolved: boolean = gameState.isSolved || false;
  const showHint: boolean = gameState.showHint || false;
  const solvedByUid: string | null = gameState.solvedByUid || null;
  const scores: Record<string, number> = gameState.scores || {};
  const round: number = gameState.round || 1;

  const [guessInput, setGuessInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const playersList = Object.values(room.players || {});
  const partnerPlayer = playersList.find((p) => p.uid !== currentUserUid);

  const currentPuzzle = EMOJI_DECODER_PUZZLES[puzzleIndex % EMOJI_DECODER_PUZZLES.length];

  useEffect(() => {
    if (!room.gameState || room.gameState.puzzleIndex === undefined) {
      if (room.hostUid === currentUserUid) {
        initGame(0);
      }
    }
  }, [room.gameState, room.hostUid, currentUserUid]);

  const initGame = async (index: number) => {
    try {
      if (index === 0 && onRematch) {
        onRematch();
        setGuessInput('');
        setFeedback(null);
        return;
      }
      const roomRef = doc(db, 'rooms', room.roomId);
      await runTransaction(db, async (transaction) => {
        const roomDoc = await transaction.get(roomRef);
        if (!roomDoc.exists()) return;
        const data = roomDoc.data();
        const currentGS = data.gameState || {};
        const currentRound = currentGS.round || 1;
        const currentScores = index === 0
          ? playersList.reduce((acc, p) => ({ ...acc, [p.uid]: 0 }), {})
          : (currentGS.scores || playersList.reduce((acc, p) => ({ ...acc, [p.uid]: 0 }), {}));

        transaction.update(roomRef, {
          gameState: {
            puzzleIndex: index,
            isSolved: false,
            showHint: false,
            solvedByUid: null,
            scores: currentScores,
            round: index === 0 ? 1 : currentRound + 1,
          },
          updatedAt: new Date().toISOString(),
        });
      });
      setGuessInput('');
      setFeedback(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.roomId}`);
    }
  };

  const handleToggleHint = async () => {
    try {
      sound.playPop();
      await updateDoc(doc(db, 'rooms', room.roomId), {
        'gameState.showHint': true,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.roomId}`);
    }
  };

  const handleCheckGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guessInput.trim() || isSolved) return;

    const normalizedGuess = guessInput.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedAnswer = currentPuzzle.answer.toLowerCase().replace(/[^a-z0-9]/g, '');

    const isExactMatch = normalizedGuess === normalizedAnswer;
    const isSubstringMatch = normalizedGuess.length >= 4 && normalizedAnswer.includes(normalizedGuess);

    if (isExactMatch || isSubstringMatch) {
      try {
        const roomRef = doc(db, 'rooms', room.roomId);
        let awardedWin = false;

        await runTransaction(db, async (transaction) => {
          const roomDoc = await transaction.get(roomRef);
          if (!roomDoc.exists()) return;
          const data = roomDoc.data();
          const currentGS = data.gameState || {};

          if (currentGS.isSolved) {
            return; // Already solved by partner!
          }

          const currentScores = currentGS.scores || playersList.reduce((acc, p) => ({ ...acc, [p.uid]: 0 }), {});
          const nextScores = { ...currentScores, [currentUserUid]: (currentScores[currentUserUid] || 0) + 1 };

          transaction.update(roomRef, {
            'gameState.isSolved': true,
            'gameState.solvedByUid': currentUserUid,
            'gameState.scores': nextScores,
            updatedAt: new Date().toISOString(),
          });

          awardedWin = true;
        });

        if (awardedWin) {
          sound.playSuccess();
          fireVictoryFanfare();
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.roomId}`);
      }
    } else {
      sound.playDing();
      setFeedback('Not quite! Try another guess or check the hint!');
      setTimeout(() => setFeedback(null), 2500);
    }
  };

  const handleRevealAnswer = async () => {
    try {
      sound.playDing();
      await updateDoc(doc(db, 'rooms', room.roomId), {
        'gameState.isSolved': true,
        'gameState.solvedByUid': 'revealed',
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.roomId}`);
    }
  };

  const handleNextPuzzle = () => {
    sound.playCardFlip();
    const nextIndex = Math.floor(Math.random() * EMOJI_DECODER_PUZZLES.length);
    initGame(nextIndex);
  };

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto">
      {/* Category & Round */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">
          🧩 {currentPuzzle.category} Puzzle • Round {round}
        </span>
      </div>

      {/* Outcome announcement */}
      <div className="mb-5 text-center">
        {isSolved ? (
          solvedByUid === 'revealed' ? (
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-100 text-purple-900 font-bold text-sm shadow-xs">
              <span>Answer revealed: {currentPuzzle.answer} ✨</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm shadow-xs animate-bounce">
              <Trophy className="w-4 h-4 text-emerald-600" />
              <span>
                {solvedByUid === currentUserUid
                  ? `Brilliant! You Solved It: "${currentPuzzle.answer}"! 🎉`
                  : `${room.players[solvedByUid || '']?.nickname || 'Partner'} solved it! 🌸`}
              </span>
            </div>
          )
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-purple-900 text-xs font-semibold">
            <span>Decode the hidden phrase together:</span>
          </div>
        )}
      </div>

      {/* Main Emoji Puzzle Display */}
      <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border-2 border-yellow-200 shadow-md text-center mb-6">
        <div className="text-4xl sm:text-5xl tracking-widest mb-4 py-3 select-none">
          {currentPuzzle.emojis}
        </div>

        {/* Hint banner */}
        {showHint ? (
          <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
            💡 Hint: {currentPuzzle.hint}
          </div>
        ) : (
          !isSolved && (
            <button
              onClick={handleToggleHint}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 transition-colors mb-4 cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Reveal Hint</span>
            </button>
          )
        )}

        {/* Guess Form */}
        {!isSolved ? (
          <form onSubmit={handleCheckGuess} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={guessInput}
                onChange={(e) => setGuessInput(e.target.value)}
                placeholder="Type your guess here..."
                className="flex-1 px-4 py-2.5 rounded-2xl bg-yellow-50/50 border border-yellow-200 text-sm font-semibold text-purple-950 placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
              <button
                type="submit"
                disabled={!guessInput.trim()}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-bold text-xs uppercase tracking-wider shadow-xs disabled:opacity-40 hover:opacity-95 transition-all cursor-pointer"
              >
                Guess
              </button>
            </div>

            {feedback && (
              <p className="text-xs text-rose-600 font-semibold animate-shake">
                {feedback}
              </p>
            )}

            <button
              type="button"
              onClick={handleRevealAnswer}
              className="text-[11px] text-purple-700/60 hover:text-purple-900 font-medium cursor-pointer"
            >
              Give up & reveal answer
            </button>
          </form>
        ) : (
          <div className="pt-2 text-base font-bold text-emerald-700">
            ✓ Solution: {currentPuzzle.answer}
          </div>
        )}
      </div>

      {isSolved && (
        <button
          onClick={handleNextPuzzle}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold text-sm shadow-md hover:opacity-95 transition-opacity flex items-center gap-2 cursor-pointer animate-scale-in"
        >
          <span>Next Emoji Puzzle</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
