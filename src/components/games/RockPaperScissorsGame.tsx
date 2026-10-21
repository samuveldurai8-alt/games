import React, { useEffect } from 'react';
import { doc, updateDoc, addDoc, collection, runTransaction } from 'firebase/firestore';
import { Sparkles, Heart, RotateCcw, Trophy, Lock, Check } from 'lucide-react';
import { Room } from '../../types';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { sound } from '../../utils/sound';
import { fireVictoryFanfare } from '../../utils/confetti';

interface RPSProps {
  room: Room;
  currentUserUid: string;
  onRematch?: () => void;
}

type Choice = 'rock' | 'paper' | 'scissors';

const CHOICES: { id: Choice; label: string; emoji: string; beats: Choice }[] = [
  { id: 'rock', label: 'Rock', emoji: '🪨', beats: 'scissors' },
  { id: 'paper', label: 'Paper', emoji: '📄', beats: 'rock' },
  { id: 'scissors', label: 'Scissors', emoji: '✂️', beats: 'paper' },
];

export const RockPaperScissorsGame: React.FC<RPSProps> = ({ room, currentUserUid, onRematch }) => {
  const gameState = room.gameState || {};
  const choices: Record<string, Choice> = gameState.choices || {};
  const scores: Record<string, number> = gameState.scores || {};
  const round: number = gameState.round || 1;
  const roundWinner: string | 'draw' | null = gameState.roundWinner || null;

  const playersList = Object.values(room.players || {});
  const partnerPlayer = playersList.find((p) => p.uid !== currentUserUid);

  const myChoice = choices[currentUserUid];
  const partnerChoice = partnerPlayer ? choices[partnerPlayer.uid] : null;
  const bothChosen = !!myChoice && !!partnerChoice;

  // Auto-resolve winner fallback if both choices recorded but roundWinner wasn't set
  useEffect(() => {
    if (bothChosen && partnerPlayer && !roundWinner && room.hostUid === currentUserUid) {
      const p1Choice = myChoice;
      const p2Choice = partnerChoice;
      let winner: string | 'draw' = 'draw';
      const nextScores = { ...scores };

      if (p1Choice === p2Choice) {
        winner = 'draw';
      } else if (CHOICES.find((c) => c.id === p1Choice)?.beats === p2Choice) {
        winner = currentUserUid;
        nextScores[currentUserUid] = (nextScores[currentUserUid] || 0) + 1;
      } else {
        winner = partnerPlayer.uid;
        nextScores[partnerPlayer.uid] = (nextScores[partnerPlayer.uid] || 0) + 1;
      }

      updateDoc(doc(db, 'rooms', room.roomId), {
        'gameState.roundWinner': winner,
        'gameState.scores': nextScores,
        updatedAt: new Date().toISOString(),
      }).catch(() => {});
    }
  }, [bothChosen, partnerPlayer, roundWinner, room.hostUid, currentUserUid, myChoice, partnerChoice, scores, room.roomId]);

  const initGame = async (resetScores: boolean = false) => {
    try {
      if (resetScores && onRematch) {
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
        const initialScores = resetScores
          ? playersList.reduce((acc, p) => ({ ...acc, [p.uid]: 0 }), {})
          : (currentGS.scores || playersList.reduce((acc, p) => ({ ...acc, [p.uid]: 0 }), {}));

        transaction.update(roomRef, {
          gameState: {
            choices: {},
            scores: initialScores,
            round: resetScores ? 1 : currentRound + 1,
            roundWinner: null,
          },
          updatedAt: new Date().toISOString(),
        });
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.roomId}`);
    }
  };

  const handleSelectChoice = async (choice: Choice) => {
    if (myChoice || bothChosen) return;

    try {
      sound.playPop();
      const roomRef = doc(db, 'rooms', room.roomId);
      let outcomeWinner: string | 'draw' | null = null;
      let hasWon = false;

      await runTransaction(db, async (transaction) => {
        const roomDoc = await transaction.get(roomRef);
        if (!roomDoc.exists()) return;
        const data = roomDoc.data();
        const currentGS = data.gameState || {};
        const currentChoices: Record<string, Choice> = currentGS.choices || {};

        if (currentChoices[currentUserUid]) {
          return; // Already submitted
        }

        const updatedChoices = { ...currentChoices, [currentUserUid]: choice };
        const pChoice = partnerPlayer ? updatedChoices[partnerPlayer.uid] : null;

        if (pChoice && partnerPlayer) {
          let nextWinner: string | 'draw' = 'draw';
          const currentScores = currentGS.scores || playersList.reduce((acc, p) => ({ ...acc, [p.uid]: 0 }), {});
          const nextScores = { ...currentScores };

          if (choice === pChoice) {
            nextWinner = 'draw';
          } else if (CHOICES.find((c) => c.id === choice)?.beats === pChoice) {
            nextWinner = currentUserUid;
            nextScores[currentUserUid] = (nextScores[currentUserUid] || 0) + 1;
          } else {
            nextWinner = partnerPlayer.uid;
            nextScores[partnerPlayer.uid] = (nextScores[partnerPlayer.uid] || 0) + 1;
          }

          outcomeWinner = nextWinner;
          if (nextWinner === currentUserUid) hasWon = true;

          transaction.update(roomRef, {
            'gameState.choices': updatedChoices,
            'gameState.roundWinner': nextWinner,
            'gameState.scores': nextScores,
            updatedAt: new Date().toISOString(),
          });
        } else {
          transaction.update(roomRef, {
            [`gameState.choices.${currentUserUid}`]: choice,
            updatedAt: new Date().toISOString(),
          });
        }
      });

      if (outcomeWinner) {
        if (hasWon) {
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

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto">
      {/* Round & Outcome announcement */}
      <div className="mb-6 text-center">
        {bothChosen ? (
          roundWinner === 'draw' ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-sm font-bold">
              <span>Same Choice! It's a Tie 💕</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-sm font-bold animate-bounce">
              <Trophy className="w-4 h-4 text-emerald-600" />
              <span>
                {roundWinner === currentUserUid
                  ? 'You Won This Round! 🎉'
                  : `${room.players[roundWinner || '']?.nickname || 'Partner'} Won! 🌸`}
              </span>
            </div>
          )
        ) : myChoice ? (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100 text-pink-700 text-xs font-semibold animate-pulse">
            <Lock className="w-3.5 h-3.5" /> Choice Locked! Waiting for partner to choose...
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-purple-900 text-xs font-semibold">
            <span>Make your secret choice below!</span>
          </div>
        )}
      </div>

      {/* Duel Arena */}
      <div className="w-full grid grid-cols-2 gap-4 mb-8">
        {/* Your Side */}
        <div className="flex flex-col items-center p-5 rounded-3xl bg-pink-50/70 border border-pink-200 shadow-xs">
          <span className="text-xs font-bold text-pink-600 uppercase tracking-wider mb-2">
            You ({scores[currentUserUid] || 0} pts)
          </span>
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white border-2 border-pink-300 flex items-center justify-center text-5xl shadow-sm">
            {myChoice ? (
              <span>{CHOICES.find((c) => c.id === myChoice)?.emoji}</span>
            ) : (
              <span className="text-pink-300 animate-pulse text-2xl">❓</span>
            )}
          </div>
          <span className="mt-2 text-xs font-bold text-purple-900">
            {myChoice ? CHOICES.find((c) => c.id === myChoice)?.label : 'Thinking...'}
          </span>
        </div>

        {/* Partner Side */}
        <div className="flex flex-col items-center p-5 rounded-3xl bg-purple-50/70 border border-purple-200 shadow-xs">
          <span className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-2">
            {partnerPlayer?.nickname || 'Partner'} ({partnerPlayer ? scores[partnerPlayer.uid] || 0 : 0} pts)
          </span>
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white border-2 border-purple-300 flex items-center justify-center text-5xl shadow-sm">
            {bothChosen && partnerChoice ? (
              <span>{CHOICES.find((c) => c.id === partnerChoice)?.emoji}</span>
            ) : partnerChoice ? (
              <span className="text-purple-400 text-2xl font-bold">🔒 Locked</span>
            ) : (
              <span className="text-purple-300 animate-pulse text-2xl">❓</span>
            )}
          </div>
          <span className="mt-2 text-xs font-bold text-purple-900">
            {bothChosen && partnerChoice
              ? CHOICES.find((c) => c.id === partnerChoice)?.label
              : partnerChoice
              ? 'Choice Hidden'
              : 'Thinking...'}
          </span>
        </div>
      </div>

      {/* Choice Buttons */}
      {!bothChosen ? (
        <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
          {CHOICES.map((choice) => (
            <button
              key={choice.id}
              onClick={() => handleSelectChoice(choice.id)}
              disabled={!!myChoice}
              className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
                myChoice === choice.id
                  ? 'border-pink-500 bg-pink-100 shadow-md scale-105'
                  : myChoice
                  ? 'border-gray-200 bg-gray-50 opacity-40 cursor-not-allowed'
                  : 'border-pink-200 bg-white hover:border-pink-400 hover:bg-pink-50/50 shadow-2xs hover:scale-102 active:scale-95'
              }`}
            >
              <span className="text-3xl mb-1">{choice.emoji}</span>
              <span className="text-xs font-bold text-purple-950">{choice.label}</span>
            </button>
          ))}
        </div>
      ) : (
        /* Next Round Button */
        <div className="flex items-center gap-3">
          <button
            onClick={() => initGame(false)}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold text-sm shadow-md hover:opacity-95 transition-opacity flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Next Round</span>
          </button>
          <button
            onClick={() => initGame(true)}
            className="px-4 py-3 rounded-2xl border border-pink-300 text-purple-900 text-xs font-semibold hover:bg-pink-50 transition-colors cursor-pointer"
          >
            Reset Scores
          </button>
        </div>
      )}
    </div>
  );
};
