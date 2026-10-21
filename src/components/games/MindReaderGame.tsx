import React, { useEffect } from 'react';
import { doc, updateDoc, addDoc, collection, runTransaction } from 'firebase/firestore';
import { Sparkles, Heart, Trophy, ArrowRight, Lock, Brain } from 'lucide-react';
import { Room } from '../../types';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { sound } from '../../utils/sound';
import { fireVictoryFanfare, fireHeartConfetti } from '../../utils/confetti';
import { MIND_READER_SCENARIOS } from '../../data/questionBanks';

interface MindReaderProps {
  room: Room;
  currentUserUid: string;
  onRematch?: () => void;
}

export const MindReaderGame: React.FC<MindReaderProps> = ({ room, currentUserUid, onRematch }) => {
  const gameState = room.gameState || {};
  const scenarioIndex: number = gameState.scenarioIndex || 0;
  // Submissions: { [uid]: { myChoice: number, partnerPrediction: number } }
  const submissions: Record<string, { myChoice: number; partnerPrediction: number }> = gameState.submissions || {};
  const scores: Record<string, number> = gameState.scores || {};
  const round: number = gameState.round || 1;

  const playersList = Object.values(room.players || {});
  const partnerPlayer = playersList.find((p) => p.uid !== currentUserUid);

  const mySubmission = submissions[currentUserUid];
  const partnerSubmission = partnerPlayer ? submissions[partnerPlayer.uid] : null;
  const bothSubmitted = !!mySubmission && !!partnerSubmission;

  const currentScenario = MIND_READER_SCENARIOS[scenarioIndex % MIND_READER_SCENARIOS.length];

  // Check how many telepathic matches
  let myPredictionCorrect = false;
  let partnerPredictionCorrect = false;
  if (bothSubmitted && partnerSubmission && mySubmission) {
    myPredictionCorrect = mySubmission.partnerPrediction === partnerSubmission.myChoice;
    partnerPredictionCorrect = partnerSubmission.partnerPrediction === mySubmission.myChoice;
  }

  useEffect(() => {
    if (!room.gameState || room.gameState.scenarioIndex === undefined) {
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
        const currentScores = index === 0
          ? playersList.reduce((acc, p) => ({ ...acc, [p.uid]: 0 }), {})
          : (currentGS.scores || playersList.reduce((acc, p) => ({ ...acc, [p.uid]: 0 }), {}));

        transaction.update(roomRef, {
          gameState: {
            scenarioIndex: index,
            submissions: {},
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

  const [tempMyChoice, setTempMyChoice] = React.useState<number | null>(null);
  const [tempPrediction, setTempPrediction] = React.useState<number | null>(null);

  const handleSubmit = async () => {
    if (tempMyChoice === null || tempPrediction === null || mySubmission) return;

    try {
      sound.playPop();
      const roomRef = doc(db, 'rooms', room.roomId);
      let someoneWon = false;
      let bothCompleted = false;

      await runTransaction(db, async (transaction) => {
        const roomDoc = await transaction.get(roomRef);
        if (!roomDoc.exists()) return;
        const data = roomDoc.data();
        const currentGS = data.gameState || {};
        const currentSubs: Record<string, { myChoice: number; partnerPrediction: number }> = currentGS.submissions || {};

        if (currentSubs[currentUserUid]) {
          return; // Already submitted
        }

        const updatedSubs = {
          ...currentSubs,
          [currentUserUid]: {
            myChoice: tempMyChoice,
            partnerPrediction: tempPrediction,
          },
        };

        const pSub = partnerPlayer ? updatedSubs[partnerPlayer.uid] : null;

        if (pSub && partnerPlayer) {
          bothCompleted = true;
          const iGuessedCorrect = tempPrediction === pSub.myChoice;
          const theyGuessedCorrect = pSub.partnerPrediction === tempMyChoice;

          const currentScores = currentGS.scores || playersList.reduce((acc, p) => ({ ...acc, [p.uid]: 0 }), {});
          const nextScores = { ...currentScores };

          if (iGuessedCorrect) nextScores[currentUserUid] = (nextScores[currentUserUid] || 0) + 1;
          if (theyGuessedCorrect) nextScores[partnerPlayer.uid] = (nextScores[partnerPlayer.uid] || 0) + 1;

          if (iGuessedCorrect || theyGuessedCorrect) {
            someoneWon = true;
          }

          transaction.update(roomRef, {
            'gameState.submissions': updatedSubs,
            'gameState.scores': nextScores,
            updatedAt: new Date().toISOString(),
          });
        } else {
          transaction.update(roomRef, {
            [`gameState.submissions.${currentUserUid}`]: {
              myChoice: tempMyChoice,
              partnerPrediction: tempPrediction,
            },
            updatedAt: new Date().toISOString(),
          });
        }
      });

      if (bothCompleted) {
        if (someoneWon) {
          sound.playSuccess();
          fireHeartConfetti();
        } else {
          sound.playDing();
        }
      }

      setTempMyChoice(null);
      setTempPrediction(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.roomId}`);
    }
  };

  const handleNextScenario = () => {
    sound.playCardFlip();
    const nextIndex = Math.floor(Math.random() * MIND_READER_SCENARIOS.length);
    initGame(nextIndex);
  };

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto">
      {/* Round Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800">
          🧠 Telepathy Round {round}
        </span>
      </div>

      {/* Outcome announcement */}
      <div className="mb-5 text-center">
        {bothSubmitted ? (
          myPredictionCorrect && partnerPredictionCorrect ? (
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm shadow-xs animate-bounce">
              <Trophy className="w-4 h-4 text-emerald-600" />
              <span>Double Mind Read! Both predicted correctly! 💖</span>
            </div>
          ) : myPredictionCorrect ? (
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-100 text-blue-800 font-bold text-sm shadow-xs">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>You read their mind accurately! +1 Point! 🎉</span>
            </div>
          ) : partnerPredictionCorrect ? (
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-100 text-purple-800 font-bold text-sm shadow-xs">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>{partnerPlayer?.nickname || 'Partner'} read your mind! +1 Point! 🎉</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-100 text-amber-900 font-bold text-sm shadow-xs">
              <span>Mysterious minds! Neither guessed correctly this time! 💫</span>
            </div>
          )
        ) : mySubmission ? (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100 text-pink-700 text-xs font-semibold animate-pulse">
            <Lock className="w-3.5 h-3.5" /> Predictions locked! Waiting for {partnerPlayer?.nickname || 'partner'}...
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-purple-900 text-xs font-semibold">
            <span>Lock in your choice AND predict theirs:</span>
          </div>
        )}
      </div>

      {/* Scenario text */}
      <div className="w-full bg-white rounded-3xl p-6 sm:p-7 border-2 border-blue-200 shadow-md mb-6">
        <h3 className="font-heading font-bold text-base sm:text-lg text-purple-950 text-center mb-6">
          "{currentScenario.scenario}"
        </h3>

        {!bothSubmitted && !mySubmission ? (
          <div className="space-y-5">
            {/* Step 1: Your Choice */}
            <div>
              <label className="block text-xs font-bold text-pink-600 uppercase tracking-wider mb-2">
                1. What would YOU pick?
              </label>
              <div className="grid grid-cols-1 gap-2">
                {currentScenario.options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      setTempMyChoice(idx);
                    }}
                    className={`p-3 rounded-2xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                      tempMyChoice === idx
                        ? 'border-pink-500 bg-pink-100/70 text-purple-950 font-bold shadow-xs'
                        : 'border-pink-100 bg-pink-50/40 hover:bg-pink-100/40 text-purple-900'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Prediction of Partner */}
            <div>
              <label className="block text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                2. Predict what {partnerPlayer?.nickname || 'Partner'} will pick:
              </label>
              <div className="grid grid-cols-1 gap-2">
                {currentScenario.options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      setTempPrediction(idx);
                    }}
                    className={`p-3 rounded-2xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                      tempPrediction === idx
                        ? 'border-blue-500 bg-blue-100/70 text-purple-950 font-bold shadow-xs'
                        : 'border-blue-100 bg-blue-50/40 hover:bg-blue-100/40 text-purple-900'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={tempMyChoice === null || tempPrediction === null}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xs uppercase tracking-wider shadow-md disabled:opacity-40 hover:opacity-95 transition-all cursor-pointer"
            >
              Lock In My Telepathy 🔒
            </button>
          </div>
        ) : bothSubmitted && partnerSubmission && mySubmission ? (
          /* Reveal View */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-pink-50/70 border border-pink-200 text-xs">
              <span className="font-bold text-pink-700 block mb-1">Your True Choice:</span>
              <p className="font-semibold text-purple-950">{currentScenario.options[mySubmission.myChoice]}</p>
              <span className="text-[11px] text-purple-800/70 mt-1 block">
                {partnerPlayer?.nickname || 'Partner'} predicted: "{currentScenario.options[partnerSubmission.partnerPrediction]}" {partnerPredictionCorrect ? '✅ (Correct!)' : '❌'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs">
              <span className="font-bold text-blue-700 block mb-1">{partnerPlayer?.nickname || 'Partner'}'s True Choice:</span>
              <p className="font-semibold text-purple-950">{currentScenario.options[partnerSubmission.myChoice]}</p>
              <span className="text-[11px] text-purple-800/70 mt-1 block">
                You predicted: "{currentScenario.options[mySubmission.partnerPrediction]}" {myPredictionCorrect ? '✅ (Correct!)' : '❌'}
              </span>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-purple-800/70 text-xs">
            Answers locked! Waiting for both of you to finish...
          </div>
        )}
      </div>

      {bothSubmitted && (
        <button
          onClick={handleNextScenario}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-sm shadow-md hover:opacity-95 transition-opacity flex items-center gap-2 cursor-pointer animate-scale-in"
        >
          <span>Next Mind Read</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
