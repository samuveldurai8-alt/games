import React, { useState, useEffect } from 'react';
import { doc, updateDoc, addDoc, collection, runTransaction } from 'firebase/firestore';
import { Sparkles, Heart, ArrowRight, Lock, MessageCircle } from 'lucide-react';
import { Room } from '../../types';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { sound } from '../../utils/sound';
import { fireHeartConfetti } from '../../utils/confetti';
import { WOULD_YOU_RATHER_PROMPTS } from '../../data/questionBanks';

interface WYRProps {
  room: Room;
  currentUserUid: string;
  onRematch?: () => void;
}

export const WouldYouRatherGame: React.FC<WYRProps> = ({ room, currentUserUid, onRematch }) => {
  const gameState = room.gameState || {};
  const promptIndex: number = gameState.promptIndex || 0;
  // Submissions: { [uid]: { choice: 'A' | 'B', note?: string } }
  const submissions: Record<string, { choice: 'A' | 'B'; note?: string }> = gameState.submissions || {};
  const round: number = gameState.round || 1;

  const [note, setNote] = useState('');

  const playersList = Object.values(room.players || {});
  const partnerPlayer = playersList.find((p) => p.uid !== currentUserUid);

  const mySubmission = submissions[currentUserUid];
  const partnerSubmission = partnerPlayer ? submissions[partnerPlayer.uid] : null;
  const bothSubmitted = !!mySubmission && !!partnerSubmission;
  const isMatch = bothSubmitted && mySubmission.choice === partnerSubmission.choice;

  const currentPrompt = WOULD_YOU_RATHER_PROMPTS[promptIndex % WOULD_YOU_RATHER_PROMPTS.length];

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
        setNote('');
        return;
      }
      const roomRef = doc(db, 'rooms', room.roomId);
      await runTransaction(db, async (transaction) => {
        const roomDoc = await transaction.get(roomRef);
        if (!roomDoc.exists()) return;
        const data = roomDoc.data();
        const currentGS = data.gameState || {};
        const currentRound = currentGS.round || 1;

        transaction.update(roomRef, {
          gameState: {
            promptIndex: index,
            submissions: {},
            round: index === 0 ? 1 : currentRound + 1,
          },
          updatedAt: new Date().toISOString(),
        });
      });
      setNote('');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.roomId}`);
    }
  };

  const handleSelect = async (choice: 'A' | 'B') => {
    if (mySubmission || bothSubmitted) return;

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
        const currentSubs: Record<string, { choice: 'A' | 'B'; note?: string }> = currentGS.submissions || {};

        if (currentSubs[currentUserUid]) {
          return; // Already submitted
        }

        const updatedSubs = {
          ...currentSubs,
          [currentUserUid]: { choice, note: note.trim() },
        };

        const pSub = partnerPlayer ? updatedSubs[partnerPlayer.uid] : null;

        if (pSub && partnerPlayer) {
          bothCompleted = true;
          if (choice === pSub.choice) {
            isMatched = true;
          }

          transaction.update(roomRef, {
            'gameState.submissions': updatedSubs,
            updatedAt: new Date().toISOString(),
          });
        } else {
          transaction.update(roomRef, {
            [`gameState.submissions.${currentUserUid}`]: { choice, note: note.trim() },
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
    const nextIndex = Math.floor(Math.random() * WOULD_YOU_RATHER_PROMPTS.length);
    initGame(nextIndex);
  };

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto">
      {/* Round & Mode */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-teal-100 text-teal-800">
          🤔 Would You Rather? • Round {round}
        </span>
      </div>

      {/* Outcome announcement */}
      <div className="mb-5 text-center">
        {bothSubmitted ? (
          isMatch ? (
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm shadow-xs animate-bounce">
              <Heart className="w-4 h-4 fill-emerald-600 text-emerald-600" />
              <span>You Chose the Exact Same Path! 💕</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-100 text-purple-900 font-bold text-sm shadow-xs">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Different desires, equal excitement! ✨</span>
            </div>
          )
        ) : mySubmission ? (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100 text-pink-700 text-xs font-semibold animate-pulse">
            <Lock className="w-3.5 h-3.5" /> Choice locked! Waiting for {partnerPlayer?.nickname || 'partner'}...
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-purple-900 text-xs font-semibold">
            <span>Which would you rather experience?</span>
          </div>
        )}
      </div>

      {/* Optional Note / Explanation Input (before selecting) */}
      {!mySubmission && !bothSubmitted && (
        <div className="w-full mb-4">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add an optional cute reason why..."
            maxLength={120}
            className="w-full px-4 py-2.5 rounded-2xl bg-white border border-teal-200 text-xs text-purple-950 placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-teal-300"
          />
        </div>
      )}

      {/* Choice Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-6">
        {/* Choice A */}
        <button
          onClick={() => handleSelect('A')}
          disabled={!!mySubmission}
          className={`p-6 rounded-3xl border-2 text-center transition-all flex flex-col items-center justify-between min-h-[160px] cursor-pointer ${
            mySubmission?.choice === 'A'
              ? 'border-teal-500 bg-teal-50 shadow-md ring-2 ring-teal-300'
              : bothSubmitted && partnerSubmission?.choice === 'A'
              ? 'border-purple-400 bg-purple-50 shadow-xs'
              : mySubmission
              ? 'border-gray-200 bg-white/60 opacity-60 cursor-not-allowed'
              : 'border-teal-200 bg-white hover:border-teal-400 hover:bg-teal-50/40 shadow-xs hover:scale-102 active:scale-98'
          }`}
        >
          <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest mb-2">
            Choice 1
          </span>
          <p className="font-heading font-bold text-base sm:text-lg text-purple-950 mb-3">
            {currentPrompt.a}
          </p>

          {bothSubmitted && (
            <div className="flex flex-col items-center gap-1 w-full pt-2 border-t border-teal-100 text-[11px]">
              {mySubmission?.choice === 'A' && (
                <div className="font-bold text-teal-700">
                  You {mySubmission.note ? `("${mySubmission.note}")` : ''}
                </div>
              )}
              {partnerSubmission?.choice === 'A' && (
                <div className="font-bold text-purple-700">
                  {partnerPlayer?.nickname || 'Partner'} {partnerSubmission.note ? `("${partnerSubmission.note}")` : ''}
                </div>
              )}
            </div>
          )}
        </button>

        {/* Choice B */}
        <button
          onClick={() => handleSelect('B')}
          disabled={!!mySubmission}
          className={`p-6 rounded-3xl border-2 text-center transition-all flex flex-col items-center justify-between min-h-[160px] cursor-pointer ${
            mySubmission?.choice === 'B'
              ? 'border-purple-500 bg-purple-50 shadow-md ring-2 ring-purple-300'
              : bothSubmitted && partnerSubmission?.choice === 'B'
              ? 'border-teal-400 bg-teal-50 shadow-xs'
              : mySubmission
              ? 'border-gray-200 bg-white/60 opacity-60 cursor-not-allowed'
              : 'border-purple-200 bg-white hover:border-purple-400 hover:bg-purple-50/40 shadow-xs hover:scale-102 active:scale-98'
          }`}
        >
          <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mb-2">
            Choice 2
          </span>
          <p className="font-heading font-bold text-base sm:text-lg text-purple-950 mb-3">
            {currentPrompt.b}
          </p>

          {bothSubmitted && (
            <div className="flex flex-col items-center gap-1 w-full pt-2 border-t border-purple-100 text-[11px]">
              {mySubmission?.choice === 'B' && (
                <div className="font-bold text-teal-700">
                  You {mySubmission.note ? `("${mySubmission.note}")` : ''}
                </div>
              )}
              {partnerSubmission?.choice === 'B' && (
                <div className="font-bold text-purple-700">
                  {partnerPlayer?.nickname || 'Partner'} {partnerSubmission.note ? `("${partnerSubmission.note}")` : ''}
                </div>
              )}
            </div>
          )}
        </button>
      </div>

      {bothSubmitted && (
        <button
          onClick={handleNextPrompt}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-purple-600 text-white font-bold text-sm shadow-md hover:opacity-95 transition-opacity flex items-center gap-2 cursor-pointer animate-scale-in"
        >
          <span>Next Dilemma</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
