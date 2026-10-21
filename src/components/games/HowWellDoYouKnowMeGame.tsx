import React, { useEffect } from 'react';
import { doc, updateDoc, addDoc, collection, runTransaction } from 'firebase/firestore';
import { Sparkles, Heart, RotateCcw, Trophy, Check, ArrowRight, Lock, Eye } from 'lucide-react';
import { Room } from '../../types';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { sound } from '../../utils/sound';
import { fireVictoryFanfare, fireHeartConfetti } from '../../utils/confetti';
import { HOW_WELL_DO_YOU_KNOW_ME_QUESTIONS } from '../../data/questionBanks';

interface HWProps {
  room: Room;
  currentUserUid: string;
  onRematch?: () => void;
}

export const HowWellDoYouKnowMeGame: React.FC<HWProps> = ({ room, currentUserUid, onRematch }) => {
  const gameState = room.gameState || {};
  const questionIndex: number = gameState.questionIndex || 0;
  const subjectUid: string = gameState.subjectUid || room.hostUid;
  const secretAnswer: number | null = gameState.secretAnswer !== undefined ? gameState.secretAnswer : null;
  const guessAnswer: number | null = gameState.guessAnswer !== undefined ? gameState.guessAnswer : null;
  const scores: Record<string, number> = gameState.scores || {};
  const round: number = gameState.round || 1;

  const playersList = Object.values(room.players || {});
  const partnerPlayer = playersList.find((p) => p.uid !== currentUserUid);

  const isSubject = subjectUid === currentUserUid;
  const isGuesser = !isSubject;
  const isRevealed = secretAnswer !== null && guessAnswer !== null;
  const isCorrect = isRevealed && secretAnswer === guessAnswer;

  const currentQ = HOW_WELL_DO_YOU_KNOW_ME_QUESTIONS[questionIndex % HOW_WELL_DO_YOU_KNOW_ME_QUESTIONS.length];

  useEffect(() => {
    if (!room.gameState || room.gameState.questionIndex === undefined) {
      if (room.hostUid === currentUserUid) {
        initGame(0);
      }
    }
  }, [room.gameState, room.hostUid, currentUserUid]);

  const initGame = async (index: number) => {
    try {
      if (index === 0 && onRematch) {
        onRematch();
        return;
      }
      const roomRef = doc(db, 'rooms', room.roomId);
      await runTransaction(db, async (transaction) => {
        const roomDoc = await transaction.get(roomRef);
        if (!roomDoc.exists()) return;
        const data = roomDoc.data();
        const currentGS = data.gameState || {};
        const currentRound = currentGS.round || 1;
        const currentSubjectUid = currentGS.subjectUid || room.hostUid;
        const nextSubject = currentSubjectUid === room.hostUid && partnerPlayer ? partnerPlayer.uid : room.hostUid;
        const currentScores = index === 0
          ? playersList.reduce((acc, p) => ({ ...acc, [p.uid]: 0 }), {})
          : (currentGS.scores || playersList.reduce((acc, p) => ({ ...acc, [p.uid]: 0 }), {}));

        transaction.update(roomRef, {
          gameState: {
            questionIndex: index,
            subjectUid: index === 0 ? room.hostUid : nextSubject,
            secretAnswer: null,
            guessAnswer: null,
            scores: currentScores,
            round: index === 0 ? 1 : currentRound + 1,
          },
          updatedAt: new Date().toISOString(),
        });
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.roomId}`);
    }
  };

  const handlePickOption = async (optionIdx: number) => {
    try {
      sound.playPop();
      const roomRef = doc(db, 'rooms', room.roomId);
      let isGuessedCorrect = false;
      let isRoundComplete = false;

      await runTransaction(db, async (transaction) => {
        const roomDoc = await transaction.get(roomRef);
        if (!roomDoc.exists()) return;
        const data = roomDoc.data();
        const currentGS = data.gameState || {};
        const currentSubjectUid = currentGS.subjectUid || room.hostUid;
        const currentSecret = currentGS.secretAnswer !== undefined ? currentGS.secretAnswer : null;
        const currentGuess = currentGS.guessAnswer !== undefined ? currentGS.guessAnswer : null;
        const currentScores = currentGS.scores || playersList.reduce((acc, p) => ({ ...acc, [p.uid]: 0 }), {});
        const nextScores = { ...currentScores };

        const userIsSubject = currentSubjectUid === currentUserUid;

        if (userIsSubject) {
          if (currentSecret !== null) return;
          const nextSecret = optionIdx;
          if (currentGuess !== null && partnerPlayer) {
            isRoundComplete = true;
            const guesserUid = partnerPlayer.uid;
            if (nextSecret === currentGuess) {
              nextScores[guesserUid] = (nextScores[guesserUid] || 0) + 1;
              isGuessedCorrect = true;
            }
            transaction.update(roomRef, {
              'gameState.secretAnswer': nextSecret,
              'gameState.scores': nextScores,
              updatedAt: new Date().toISOString(),
            });
          } else {
            transaction.update(roomRef, {
              'gameState.secretAnswer': nextSecret,
              updatedAt: new Date().toISOString(),
            });
          }
        } else {
          if (currentGuess !== null) return;
          const nextGuess = optionIdx;
          const guesserUid = currentUserUid;
          if (currentSecret !== null) {
            isRoundComplete = true;
            if (currentSecret === nextGuess) {
              nextScores[guesserUid] = (nextScores[guesserUid] || 0) + 1;
              isGuessedCorrect = true;
            }
            transaction.update(roomRef, {
              'gameState.guessAnswer': nextGuess,
              'gameState.scores': nextScores,
              updatedAt: new Date().toISOString(),
            });
          } else {
            transaction.update(roomRef, {
              'gameState.guessAnswer': nextGuess,
              updatedAt: new Date().toISOString(),
            });
          }
        }
      });

      if (isRoundComplete) {
        if (isGuessedCorrect) {
          sound.playSuccess();
          fireVictoryFanfare();
        } else {
          sound.playDing();
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.roomId}`);
    }
  };

  const handleNextQuestion = () => {
    sound.playCardFlip();
    const nextIndex = Math.floor(Math.random() * HOW_WELL_DO_YOU_KNOW_ME_QUESTIONS.length);
    initGame(nextIndex);
  };

  const subjectName = room.players[subjectUid]?.nickname || 'Partner';

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto">
      {/* Role Banner */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-violet-100 text-violet-700">
          Spotlight: {subjectName}'s Secrets
        </span>
        <span className="text-xs text-purple-800/70 font-semibold">
          Round {round}
        </span>
      </div>

      {/* Outcome announcement */}
      <div className="mb-5 text-center">
        {isRevealed ? (
          isCorrect ? (
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm shadow-xs animate-bounce">
              <Trophy className="w-4 h-4 text-emerald-600" />
              <span>Correct Prediction! They Know You So Well! 💕</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-100 text-amber-900 font-bold text-sm shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Not quite! Now you know the real answer! 🌸</span>
            </div>
          )
        ) : isSubject ? (
          secretAnswer === null ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100 text-pink-700 text-xs font-semibold">
              <span>Pick your TRUE answer secretly below:</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100 text-pink-700 text-xs font-semibold animate-pulse">
              <Lock className="w-3.5 h-3.5" /> Secret locked! Waiting for {partnerPlayer?.nickname || 'partner'} to guess...
            </div>
          )
        ) : (
          guessAnswer === null ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-purple-900 text-xs font-semibold">
              <span>Predict what {subjectName} will choose:</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-purple-900 text-xs font-semibold animate-pulse">
              <Lock className="w-3.5 h-3.5" /> Guess locked! Waiting for reveal...
            </div>
          )
        )}
      </div>

      {/* Question Card */}
      <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border-2 border-violet-200 shadow-md text-center mb-6">
        <h3 className="font-heading font-bold text-lg sm:text-xl text-purple-950 mb-6">
          {currentQ.question}
        </h3>

        {/* 4 Options */}
        <div className="grid grid-cols-1 gap-2.5 text-left">
          {currentQ.options.map((opt, idx) => {
            const isMySecret = isSubject && secretAnswer === idx;
            const isMyGuess = isGuesser && guessAnswer === idx;
            const isActualSecret = isRevealed && secretAnswer === idx;
            const isPartnerGuess = isRevealed && guessAnswer === idx;

            return (
              <button
                key={idx}
                onClick={() => handlePickOption(idx)}
                disabled={isRevealed || (isSubject && secretAnswer !== null) || (isGuesser && guessAnswer !== null)}
                className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between text-xs sm:text-sm font-semibold cursor-pointer ${
                  isActualSecret
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950 shadow-xs ring-2 ring-emerald-300'
                    : isPartnerGuess && !isCorrect
                    ? 'border-rose-400 bg-rose-50 text-rose-950 shadow-xs'
                    : isMySecret || isMyGuess
                    ? 'border-violet-500 bg-violet-50 text-violet-950 shadow-xs'
                    : (isSubject && secretAnswer !== null) || (isGuesser && guessAnswer !== null)
                    ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                    : 'border-violet-100 bg-white hover:border-violet-300 hover:bg-violet-50/40 text-purple-900'
                }`}
              >
                <span>{opt}</span>
                <div className="flex items-center gap-1">
                  {isActualSecret && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800">
                      Actual Answer ✓
                    </span>
                  )}
                  {isPartnerGuess && !isCorrect && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-800">
                      Guessed ✗
                    </span>
                  )}
                  {!isRevealed && (isMySecret || isMyGuess) && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-200 text-violet-800">
                      Selected 🔒
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Next Question */}
      {isRevealed && (
        <button
          onClick={handleNextQuestion}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold text-sm shadow-md hover:opacity-95 transition-opacity flex items-center gap-2 cursor-pointer animate-scale-in"
        >
          <span>Next Secret</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
