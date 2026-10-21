import React, { useEffect } from 'react';
import { doc, updateDoc, addDoc, collection, runTransaction } from 'firebase/firestore';
import { Heart, RotateCcw, Trophy, Zap, AlertTriangle } from 'lucide-react';
import { Room } from '../../types';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { sound } from '../../utils/sound';
import { fireVictoryFanfare } from '../../utils/confetti';

interface QuickTapProps {
  room: Room;
  currentUserUid: string;
  onRematch?: () => void;
}

export const QuickTapRaceGame: React.FC<QuickTapProps> = ({ room, currentUserUid, onRematch }) => {
  const gameState = room.gameState || {};
  const phase: 'waiting' | 'ready' | 'go' | 'result' = gameState.phase || 'ready';
  const goTime: number = gameState.goTime || 0;
  const winnerUid: string | null = gameState.winnerUid || null;
  const reactionTimes: Record<string, number> = gameState.reactionTimes || {};
  const scores: Record<string, number> = gameState.scores || {};
  const round: number = gameState.round || 1;
  const falseStartUid: string | null = gameState.falseStartUid || null;

  const playersList = Object.values(room.players || {});
  const partnerPlayer = playersList.find((p) => p.uid !== currentUserUid);

  // Host coordinates the randomized 'go' countdown
  useEffect(() => {
    if (phase === 'ready' && room.hostUid === currentUserUid) {
      const delay = 2200 + Math.random() * 2600; // 2.2s - 4.8s
      const timer = setTimeout(async () => {
        try {
          const now = Date.now();
          await updateDoc(doc(db, 'rooms', room.roomId), {
            'gameState.phase': 'go',
            'gameState.goTime': now,
            updatedAt: new Date().toISOString(),
          });
        } catch {
          // ignore
        }
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [phase, room.hostUid, currentUserUid, room.roomId]);

  const initGame = async (resetScores: boolean = false) => {
    try {
      const now = new Date().toISOString();
      await updateDoc(doc(db, 'rooms', room.roomId), {
        gameState: {
          phase: 'ready',
          goTime: 0,
          winnerUid: null,
          falseStartUid: null,
          reactionTimes: {},
          scores: resetScores ? playersList.reduce((acc, p) => ({ ...acc, [p.uid]: 0 }), {}) : scores,
          round: resetScores ? 1 : round + 1,
        },
        updatedAt: now,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.roomId}`);
    }
  };

  const handleTap = async () => {
    if (phase === 'result') return;

    if (phase === 'ready') {
      // False start! Tapped too early!
      sound.playDing();
      const penaltyWinner = partnerPlayer ? partnerPlayer.uid : currentUserUid;
      try {
        await runTransaction(db, async (transaction) => {
          const roomRef = doc(db, 'rooms', room.roomId);
          const roomSnap = await transaction.get(roomRef);
          if (!roomSnap.exists()) return;
          const data = roomSnap.data();
          const gState = data.gameState || {};
          if (gState.phase !== 'ready' || gState.winnerUid) return;

          const curScores = gState.scores || {};
          const nextScores = { ...curScores, [penaltyWinner]: (curScores[penaltyWinner] || 0) + 1 };

          transaction.update(roomRef, {
            'gameState.phase': 'result',
            'gameState.falseStartUid': currentUserUid,
            'gameState.winnerUid': penaltyWinner,
            'gameState.scores': nextScores,
            updatedAt: new Date().toISOString(),
          });
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.roomId}`);
      }
      return;
    }

    if (phase === 'go' && !winnerUid) {
      // Legitimate tap! Using transaction to prevent race conditions
      try {
        let won = false;
        let reactionTime = 0;

        await runTransaction(db, async (transaction) => {
          const roomRef = doc(db, 'rooms', room.roomId);
          const roomSnap = await transaction.get(roomRef);
          if (!roomSnap.exists()) return;

          const data = roomSnap.data();
          const gState = data.gameState || {};
          if (gState.phase !== 'go') return;

          reactionTime = Math.max(15, Date.now() - (gState.goTime || Date.now()));
          const curScores = gState.scores || {};
          const curTimes = gState.reactionTimes || {};

          // If another player already won this millisecond
          if (gState.winnerUid) {
            transaction.update(roomRef, {
              [`gameState.reactionTimes.${currentUserUid}`]: reactionTime,
              updatedAt: new Date().toISOString(),
            });
            return;
          }

          // We are first!
          won = true;
          const nextScores = { ...curScores, [currentUserUid]: (curScores[currentUserUid] || 0) + 1 };
          const nextTimes = { ...curTimes, [currentUserUid]: reactionTime };

          transaction.update(roomRef, {
            'gameState.phase': 'result',
            'gameState.winnerUid': currentUserUid,
            'gameState.reactionTimes': nextTimes,
            'gameState.scores': nextScores,
            updatedAt: new Date().toISOString(),
          });
        });

        if (won) {
          sound.playSuccess();
          fireVictoryFanfare();
          addDoc(collection(db, 'rooms', room.roomId, 'history'), {
            gameId: 'quicktap',
            gameTitle: 'Quick Tap Race',
            winnerUid: currentUserUid,
            scores: { ...scores, [currentUserUid]: (scores[currentUserUid] || 0) + 1 },
            summary: `${room.players[currentUserUid]?.nickname} tapped in ${reactionTime}ms!`,
            completedAt: new Date().toISOString(),
          }).catch(() => {});
        } else {
          sound.playDing();
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.roomId}`);
      }
    }
  };

  return (
    <div className="flex flex-col items-center max-w-md mx-auto text-center select-none">
      {/* Round & Mode */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800">
          ⚡ Reflex Race • Round {round}
        </span>
      </div>

      {/* Outcome Banner */}
      <div className="mb-6">
        {phase === 'result' ? (
          falseStartUid ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 text-rose-800 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>
                {falseStartUid === currentUserUid ? 'You tapped too early!' : `${room.players[falseStartUid]?.nickname || 'Partner'} tapped early!`} Point to {room.players[winnerUid || '']?.nickname}!
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm shadow-xs animate-bounce">
              <Trophy className="w-4 h-4 text-emerald-600" />
              <span>
                {winnerUid === currentUserUid
                  ? `Lightning Reflexes! You won in ${reactionTimes[currentUserUid]}ms! ⚡`
                  : `${room.players[winnerUid || '']?.nickname || 'Partner'} was faster! 🌸`}
              </span>
            </div>
          )
        ) : phase === 'ready' ? (
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-100 text-purple-900 font-bold text-xs animate-pulse">
            <span>Steady... Wait for the target to turn PINK & RED! Don't tap early!</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-rose-500 text-white font-extrabold text-sm shadow-md animate-bounce">
            <Zap className="w-5 h-5 fill-white text-white" />
            <span>TAP THE HEART NOW!</span>
          </div>
        )}
      </div>

      {/* Big Interactive Target Button */}
      <div className="my-4">
        <button
          onClick={handleTap}
          disabled={phase === 'result'}
          className={`w-64 h-64 sm:w-72 sm:h-72 rounded-full flex flex-col items-center justify-center transition-all duration-150 shadow-2xl cursor-pointer ${
            phase === 'ready'
              ? 'bg-purple-900/90 text-purple-200 border-8 border-purple-800 active:scale-95'
              : phase === 'go'
              ? 'bg-gradient-to-tr from-rose-500 via-pink-500 to-rose-400 text-white border-8 border-white animate-pulse scale-105 active:scale-90 shadow-pink-500/50'
              : 'bg-white border-8 border-pink-200 text-purple-950 opacity-90'
          }`}
        >
          {phase === 'ready' ? (
            <>
              <Heart className="w-16 h-16 text-purple-400 opacity-60 mb-2" />
              <span className="text-sm font-bold uppercase tracking-widest text-purple-300">Wait...</span>
            </>
          ) : phase === 'go' ? (
            <>
              <Heart className="w-24 h-24 fill-white text-white mb-2 animate-ping" />
              <span className="text-2xl font-extrabold uppercase tracking-widest">TAP NOW!</span>
            </>
          ) : (
            <>
              <Trophy className="w-16 h-16 text-amber-500 mb-2" />
              <span className="text-sm font-bold text-purple-900">Round Complete</span>
            </>
          )}
        </button>
      </div>

      {/* Next Round Controls */}
      {phase === 'result' && (
        <div className="mt-4 flex items-center gap-3">
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
