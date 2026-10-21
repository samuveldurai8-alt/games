import React, { useEffect } from 'react';
import { doc, updateDoc, addDoc, collection, runTransaction } from 'firebase/firestore';
import { Sparkles, Heart, ArrowRight, Lock, Award } from 'lucide-react';
import { Room } from '../../types';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { sound } from '../../utils/sound';
import { fireHeartConfetti } from '../../utils/confetti';
import { COUPLE_QUIZ_QUESTIONS } from '../../data/questionBanks';

interface QuizProps {
  room: Room;
  currentUserUid: string;
  onRematch?: () => void;
}

export const CoupleQuizGame: React.FC<QuizProps> = ({ room, currentUserUid, onRematch }) => {
  const gameState = room.gameState || {};
  const questionIndex: number = gameState.questionIndex || 0;
  const answers: Record<string, number> = gameState.answers || {};
  const matchCount: number = gameState.matchCount || 0;
  const round: number = gameState.round || 1;

  const playersList = Object.values(room.players || {});
  const partnerPlayer = playersList.find((p) => p.uid !== currentUserUid);

  const myAnswer = answers[currentUserUid];
  const partnerAnswer = partnerPlayer ? answers[partnerPlayer.uid] : undefined;
  const bothAnswered = myAnswer !== undefined && partnerAnswer !== undefined;
  const isMatch = bothAnswered && myAnswer === partnerAnswer;

  const currentQ = COUPLE_QUIZ_QUESTIONS[questionIndex % COUPLE_QUIZ_QUESTIONS.length];

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
        const currentMatches = currentGS.matchCount || 0;

        transaction.update(roomRef, {
          gameState: {
            questionIndex: index,
            answers: {},
            matchCount: index === 0 ? 0 : currentMatches,
            round: index === 0 ? 1 : currentRound + 1,
          },
          updatedAt: new Date().toISOString(),
        });
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.roomId}`);
    }
  };

  const handleSelect = async (optIdx: number) => {
    if (myAnswer !== undefined || bothAnswered) return;

    try {
      sound.playPop();
      const roomRef = doc(db, 'rooms', room.roomId);
      let isMatched = false;
      let bothCompleted = false;

      await runTransaction(db, async (transaction) => {
        const roomDoc = await transaction.get(roomRef);
        if (!roomDoc.exists()) return;
        const data = roomDoc.data();
        const currentGS = data.gameState || {};
        const currentAnswers: Record<string, number> = currentGS.answers || {};

        if (currentAnswers[currentUserUid] !== undefined) {
          return; // Already submitted
        }

        const updatedAnswers = { ...currentAnswers, [currentUserUid]: optIdx };
        const pAnswer = partnerPlayer ? updatedAnswers[partnerPlayer.uid] : undefined;

        if (pAnswer !== undefined && partnerPlayer) {
          bothCompleted = true;
          let nextMatchCount = currentGS.matchCount || 0;
          if (optIdx === pAnswer) {
            nextMatchCount += 1;
            isMatched = true;
          }

          transaction.update(roomRef, {
            'gameState.answers': updatedAnswers,
            'gameState.matchCount': nextMatchCount,
            updatedAt: new Date().toISOString(),
          });
        } else {
          transaction.update(roomRef, {
            [`gameState.answers.${currentUserUid}`]: optIdx,
            updatedAt: new Date().toISOString(),
          });
        }
      });

      if (bothCompleted) {
        if (isMatched) {
          sound.playSuccess();
          fireHeartConfetti();
        } else {
          sound.playDing();
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.roomId}`);
    }
  };

  const handleNext = () => {
    sound.playCardFlip();
    const nextIndex = Math.floor(Math.random() * COUPLE_QUIZ_QUESTIONS.length);
    initGame(nextIndex);
  };

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto">
      {/* Quiz Progress & Stats */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-pink-100 text-pink-700">
          🏆 Chemistry Quiz • Round {round}
        </span>
        <span className="text-xs text-purple-800/70">
          Matched: {matchCount} answers
        </span>
      </div>

      {/* Outcome announcement */}
      <div className="mb-5 text-center">
        {bothAnswered ? (
          isMatch ? (
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm shadow-xs animate-bounce">
              <Heart className="w-4 h-4 fill-emerald-600 text-emerald-600" />
              <span>Harmonious Connection! You selected the same response! 💕</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-100 text-purple-900 font-bold text-sm shadow-xs">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Unique viewpoints that complement each other! ✨</span>
            </div>
          )
        ) : myAnswer !== undefined ? (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100 text-pink-700 text-xs font-semibold animate-pulse">
            <Lock className="w-3.5 h-3.5" /> Answer locked! Waiting for {partnerPlayer?.nickname || 'partner'}...
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-purple-900 text-xs font-semibold">
            <span>Select what resonates most with your heart:</span>
          </div>
        )}
      </div>

      {/* Question Card */}
      <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border-2 border-pink-200 shadow-md mb-6">
        <h3 className="font-heading font-bold text-lg sm:text-xl text-purple-950 text-center mb-6">
          "{currentQ.question}"
        </h3>

        <div className="grid grid-cols-1 gap-2.5">
          {currentQ.options.map((opt, idx) => {
            const isMyPick = myAnswer === idx;
            const isPartnerPick = bothAnswered && partnerAnswer === idx;

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={myAnswer !== undefined}
                className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between text-xs sm:text-sm font-semibold cursor-pointer ${
                  isMyPick && isPartnerPick
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950 shadow-xs'
                    : isMyPick
                    ? 'border-pink-500 bg-pink-50 text-pink-950 shadow-xs ring-2 ring-pink-300'
                    : isPartnerPick
                    ? 'border-purple-400 bg-purple-50 text-purple-950 shadow-xs'
                    : myAnswer !== undefined
                    ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                    : 'border-pink-100 bg-white hover:border-pink-300 hover:bg-pink-50/40 text-purple-900'
                }`}
              >
                <span>{opt}</span>
                {bothAnswered && (
                  <div className="flex items-center gap-1">
                    {isMyPick && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-200 text-pink-800">
                        You
                      </span>
                    )}
                    {isPartnerPick && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200 text-purple-800">
                        {partnerPlayer?.nickname || 'Partner'}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {bothAnswered && (
        <button
          onClick={handleNext}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold text-sm shadow-md hover:opacity-95 transition-opacity flex items-center gap-2 cursor-pointer animate-scale-in"
        >
          <span>Next Quiz Question</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
