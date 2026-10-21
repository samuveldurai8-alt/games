import React, { useEffect } from 'react';
import { doc, updateDoc, addDoc, collection, runTransaction } from 'firebase/firestore';
import { Sparkles, Heart, RotateCcw, Trophy, Check, ArrowRight, Lock } from 'lucide-react';
import { Room } from '../../types';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { sound } from '../../utils/sound';
import { fireHeartConfetti } from '../../utils/confetti';
import { THIS_OR_THAT_PAIRS } from '../../data/questionBanks';

interface ThisOrThatProps {
  room: Room;
  currentUserUid: string;
  onRematch?: () => void;
}

export const ThisOrThatGame: React.FC<ThisOrThatProps> = ({ room, currentUserUid, onRematch }) => {
  const gameState = room.gameState || {};
  const currentPairIndex: number = gameState.pairIndex || 0;
  const choices: Record<string, 'A' | 'B'> = gameState.choices || {};
  const matchScore: number = gameState.matchScore || 0;
  const round: number = gameState.round || 1;

  const playersList = Object.values(room.players || {});
  const partnerPlayer = playersList.find((p) => p.uid !== currentUserUid);

  const myChoice = choices[currentUserUid];
  const partnerChoice = partnerPlayer ? choices[partnerPlayer.uid] : null;
  const bothChosen = !!myChoice && !!partnerChoice;
  const isMatch = bothChosen && myChoice === partnerChoice;

  const currentPair = THIS_OR_THAT_PAIRS[currentPairIndex % THIS_OR_THAT_PAIRS.length];

  useEffect(() => {
    if (!room.gameState || room.gameState.pairIndex === undefined) {
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
        const currentMatch = currentGS.matchScore || 0;

        transaction.update(roomRef, {
          gameState: {
            pairIndex: index,
            choices: {},
            matchScore: index === 0 ? 0 : currentMatch,
            round: index === 0 ? 1 : currentRound + 1,
          },
          updatedAt: new Date().toISOString(),
        });
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.roomId}`);
    }
  };

  const handleSelect = async (choice: 'A' | 'B') => {
    if (myChoice || bothChosen) return;

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
        const currentChoices: Record<string, 'A' | 'B'> = currentGS.choices || {};

        if (currentChoices[currentUserUid]) {
          return; // Already chosen
        }

        const updatedChoices = { ...currentChoices, [currentUserUid]: choice };
        const pChoice = partnerPlayer ? updatedChoices[partnerPlayer.uid] : null;

        if (pChoice && partnerPlayer) {
          bothCompleted = true;
          let nextMatchScore = currentGS.matchScore || 0;
          if (choice === pChoice) {
            nextMatchScore += 1;
            isMatched = true;
          }

          transaction.update(roomRef, {
            'gameState.choices': updatedChoices,
            'gameState.matchScore': nextMatchScore,
            updatedAt: new Date().toISOString(),
          });
        } else {
          transaction.update(roomRef, {
            [`gameState.choices.${currentUserUid}`]: choice,
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

  const handleNextPrompt = () => {
    sound.playCardFlip();
    const nextIndex = Math.floor(Math.random() * THIS_OR_THAT_PAIRS.length);
    initGame(nextIndex);
  };

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto">
      {/* Category Pill & Round */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-700 uppercase tracking-wider">
          {currentPair.cat}
        </span>
        <span className="text-xs text-purple-800/60 font-semibold">
          Round {round} • Matched {matchScore} times 💕
        </span>
      </div>

      {/* Status banner */}
      <div className="mb-6 text-center">
        {bothChosen ? (
          isMatch ? (
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm shadow-xs animate-bounce">
              <Heart className="w-4 h-4 fill-emerald-600 text-emerald-600" />
              <span>Perfect Compatibility! You Both Chose the Same! 💕</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-100 text-amber-900 font-bold text-sm shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Opposites Attract! Different Flavors 💫</span>
            </div>
          )
        ) : myChoice ? (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100 text-pink-700 text-xs font-semibold animate-pulse">
            <Lock className="w-3.5 h-3.5" /> Choice Locked! Waiting for {partnerPlayer?.nickname || 'partner'}...
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-purple-900 text-xs font-semibold">
            <span>Pick your honest preference:</span>
          </div>
        )}
      </div>

      {/* Choice Cards (A vs B) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-8">
        {/* Option A */}
        <button
          onClick={() => handleSelect('A')}
          disabled={!!myChoice}
          className={`p-6 rounded-3xl border-2 text-center transition-all flex flex-col items-center justify-center min-h-[140px] cursor-pointer ${
            myChoice === 'A'
              ? 'border-pink-500 bg-pink-50 shadow-md ring-2 ring-pink-300'
              : bothChosen && partnerChoice === 'A'
              ? 'border-purple-400 bg-purple-50 shadow-xs'
              : myChoice
              ? 'border-gray-200 bg-white/60 opacity-60 cursor-not-allowed'
              : 'border-pink-200 bg-white hover:border-pink-400 hover:bg-pink-50/50 shadow-xs hover:scale-102 active:scale-98'
          }`}
        >
          <span className="text-[11px] font-bold text-pink-500 uppercase tracking-widest mb-1.5">
            Option A
          </span>
          <p className="font-heading font-bold text-base sm:text-lg text-purple-950 mb-2">
            {currentPair.a}
          </p>

          {/* Reveal tags */}
          {bothChosen && (
            <div className="flex items-center gap-1.5 mt-2 flex-wrap justify-center">
              {myChoice === 'A' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-200 text-pink-800">
                  You
                </span>
              )}
              {partnerChoice === 'A' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200 text-purple-800">
                  {partnerPlayer?.nickname || 'Partner'}
                </span>
              )}
            </div>
          )}
        </button>

        {/* Option B */}
        <button
          onClick={() => handleSelect('B')}
          disabled={!!myChoice}
          className={`p-6 rounded-3xl border-2 text-center transition-all flex flex-col items-center justify-center min-h-[140px] cursor-pointer ${
            myChoice === 'B'
              ? 'border-purple-500 bg-purple-50 shadow-md ring-2 ring-purple-300'
              : bothChosen && partnerChoice === 'B'
              ? 'border-pink-400 bg-pink-50 shadow-xs'
              : myChoice
              ? 'border-gray-200 bg-white/60 opacity-60 cursor-not-allowed'
              : 'border-purple-200 bg-white hover:border-purple-400 hover:bg-purple-50/50 shadow-xs hover:scale-102 active:scale-98'
          }`}
        >
          <span className="text-[11px] font-bold text-purple-600 uppercase tracking-widest mb-1.5">
            Option B
          </span>
          <p className="font-heading font-bold text-base sm:text-lg text-purple-950 mb-2">
            {currentPair.b}
          </p>

          {/* Reveal tags */}
          {bothChosen && (
            <div className="flex items-center gap-1.5 mt-2 flex-wrap justify-center">
              {myChoice === 'B' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-200 text-pink-800">
                  You
                </span>
              )}
              {partnerChoice === 'B' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200 text-purple-800">
                  {partnerPlayer?.nickname || 'Partner'}
                </span>
              )}
            </div>
          )}
        </button>
      </div>

      {/* Next prompt button */}
      {bothChosen && (
        <button
          onClick={handleNextPrompt}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold text-sm shadow-md hover:opacity-95 transition-opacity flex items-center gap-2 cursor-pointer animate-scale-in"
        >
          <span>Next Dilemma</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
