import React, { useEffect } from 'react';
import { doc, updateDoc, addDoc, collection, runTransaction } from 'firebase/firestore';
import { Sparkles, Heart, RotateCcw, ThumbsUp, ThumbsDown, ArrowRight, Lock } from 'lucide-react';
import { Room } from '../../types';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { sound } from '../../utils/sound';
import { fireVictoryFanfare, fireHeartConfetti } from '../../utils/confetti';
import { SWIPE_MATCH_PROMPTS } from '../../data/questionBanks';

interface SwipeMatchProps {
  room: Room;
  currentUserUid: string;
  onRematch?: () => void;
}

export const SwipeMatchGame: React.FC<SwipeMatchProps> = ({ room, currentUserUid, onRematch }) => {
  const gameState = room.gameState || {};
  const promptIndex: number = gameState.promptIndex || 0;
  const votes: Record<string, boolean> = gameState.votes || {};
  const historyList: { prompt: string; match: boolean }[] = gameState.historyList || [];
  const round: number = gameState.round || 1;

  const playersList = Object.values(room.players || {});
  const partnerPlayer = playersList.find((p) => p.uid !== currentUserUid);

  const myVote = votes[currentUserUid];
  const partnerVote = partnerPlayer ? votes[partnerPlayer.uid] : undefined;
  const bothVoted = myVote !== undefined && partnerVote !== undefined;
  const isMatch = bothVoted && myVote === partnerVote;

  const currentPrompt = SWIPE_MATCH_PROMPTS[promptIndex % SWIPE_MATCH_PROMPTS.length];

  useEffect(() => {
    if (!room.gameState || room.gameState.promptIndex === undefined) {
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
        const history = currentGS.historyList || [];

        transaction.update(roomRef, {
          gameState: {
            promptIndex: index,
            votes: {},
            historyList: index === 0 ? [] : history,
            round: index === 0 ? 1 : currentRound + 1,
          },
          updatedAt: new Date().toISOString(),
        });
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.roomId}`);
    }
  };

  const handleVote = async (agree: boolean) => {
    if (myVote !== undefined || bothVoted) return;

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
        const currentVotes: Record<string, boolean> = currentGS.votes || {};

        if (currentVotes[currentUserUid] !== undefined) {
          return; // Already voted
        }

        const updatedVotes = { ...currentVotes, [currentUserUid]: agree };
        const pVote = partnerPlayer ? updatedVotes[partnerPlayer.uid] : undefined;

        if (pVote !== undefined && partnerPlayer) {
          bothCompleted = true;
          const match = agree === pVote;
          if (match) isMatched = true;

          const nextHistory = [...(currentGS.historyList || []), { prompt: currentPrompt, match }];

          transaction.update(roomRef, {
            'gameState.votes': updatedVotes,
            'gameState.historyList': nextHistory,
            updatedAt: new Date().toISOString(),
          });
        } else {
          transaction.update(roomRef, {
            [`gameState.votes.${currentUserUid}`]: agree,
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
    const nextIndex = Math.floor(Math.random() * SWIPE_MATCH_PROMPTS.length);
    initGame(nextIndex);
  };

  // Match statistics
  const totalRoundsPlayed = historyList.length;
  const matchedRounds = historyList.filter((h) => h.match).length;
  const matchPercentage = totalRoundsPlayed > 0 ? Math.round((matchedRounds / totalRoundsPlayed) * 100) : 100;

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto">
      {/* Score Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-rose-100 text-rose-700">
          Sync Rate: {matchPercentage}% ({matchedRounds}/{totalRoundsPlayed} matches)
        </span>
        <span className="text-xs text-purple-800/70">
          Round {round}
        </span>
      </div>

      {/* Outcome announcement */}
      <div className="mb-5 text-center">
        {bothVoted ? (
          isMatch ? (
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm shadow-xs animate-bounce">
              <Heart className="w-4 h-4 fill-emerald-600 text-emerald-600" />
              <span>Matching Hearts! You Both Said {myVote ? 'YES 👍' : 'NO 👎'}!</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-100 text-purple-900 font-bold text-sm shadow-xs">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>One agreed, one passed! Cute contrast! ✨</span>
            </div>
          )
        ) : myVote !== undefined ? (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100 text-pink-700 text-xs font-semibold animate-pulse">
            <Lock className="w-3.5 h-3.5" /> Answer locked in! Waiting for {partnerPlayer?.nickname || 'partner'}...
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-purple-900 text-xs font-semibold">
            <span>Do you agree or pass?</span>
          </div>
        )}
      </div>

      {/* Swipe Prompt Card */}
      <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border-2 border-pink-200 shadow-md text-center mb-6 relative overflow-hidden">
        <span className="text-3xl mb-3 block">💬</span>
        <p className="font-heading font-semibold text-lg sm:text-xl text-purple-950 leading-relaxed min-h-[90px] flex items-center justify-center">
          "{currentPrompt}"
        </p>

        {bothVoted && (
          <div className="mt-4 pt-3 border-t border-pink-100 flex items-center justify-center gap-4 text-xs font-bold">
            <span className={myVote ? 'text-emerald-600' : 'text-rose-500'}>
              You: {myVote ? 'Agree 👍' : 'Pass 👎'}
            </span>
            <span className="text-purple-300">•</span>
            <span className={partnerVote ? 'text-emerald-600' : 'text-rose-500'}>
              {partnerPlayer?.nickname || 'Partner'}: {partnerVote ? 'Agree 👍' : 'Pass 👎'}
            </span>
          </div>
        )}
      </div>

      {/* Voting Buttons */}
      {!bothVoted ? (
        <div className="flex items-center justify-center gap-4 w-full max-w-xs">
          <button
            onClick={() => handleVote(false)}
            disabled={myVote !== undefined}
            className={`flex-1 py-3.5 rounded-2xl border-2 flex items-center justify-center gap-2 font-bold text-sm transition-all cursor-pointer ${
              myVote === false
                ? 'border-rose-500 bg-rose-100 text-rose-700 shadow-sm'
                : myVote !== undefined
                ? 'border-gray-200 opacity-40 cursor-not-allowed'
                : 'border-rose-200 bg-white text-rose-600 hover:bg-rose-50 shadow-xs hover:scale-102 active:scale-95'
            }`}
          >
            <ThumbsDown className="w-4 h-4" />
            <span>Pass / No</span>
          </button>

          <button
            onClick={() => handleVote(true)}
            disabled={myVote !== undefined}
            className={`flex-1 py-3.5 rounded-2xl border-2 flex items-center justify-center gap-2 font-bold text-sm transition-all cursor-pointer ${
              myVote === true
                ? 'border-emerald-500 bg-emerald-100 text-emerald-700 shadow-sm'
                : myVote !== undefined
                ? 'border-gray-200 opacity-40 cursor-not-allowed'
                : 'border-emerald-200 bg-white text-emerald-600 hover:bg-emerald-50 shadow-xs hover:scale-102 active:scale-95'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>Agree / Yes</span>
          </button>
        </div>
      ) : (
        <button
          onClick={handleNextPrompt}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold text-sm shadow-md hover:opacity-95 transition-opacity flex items-center gap-2 cursor-pointer animate-scale-in"
        >
          <span>Next Prompt</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
