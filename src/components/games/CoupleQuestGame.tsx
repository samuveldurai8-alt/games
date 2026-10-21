import React, { useEffect } from 'react';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { Sparkles, Heart, Star, Compass, ArrowRight, BookmarkPlus } from 'lucide-react';
import { Room } from '../../types';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { sound } from '../../utils/sound';
import { fireVictoryFanfare } from '../../utils/confetti';
import { COUPLE_QUEST_STORY } from '../../data/questionBanks';

interface QuestProps {
  room: Room;
  currentUserUid: string;
  onRematch?: () => void;
}

export const CoupleQuestGame: React.FC<QuestProps> = ({ room, currentUserUid, onRematch }) => {
  const gameState = room.gameState || {};
  const chapterIndex: number = gameState.chapterIndex || 0;
  // Choices selected for current chapter: { [uid]: choiceId }
  const votes: Record<string, string> = gameState.votes || {};
  const chosenPath: { chapterId: string; choiceId: string; outcome: string }[] = gameState.chosenPath || [];
  const starsCollected: number = gameState.starsCollected || 0;
  const isCompleted: boolean = gameState.isCompleted || false;

  const playersList = Object.values(room.players || {});
  const partnerPlayer = playersList.find((p) => p.uid !== currentUserUid);

  const currentChapter = COUPLE_QUEST_STORY.chapters[chapterIndex];
  const myVote = votes[currentUserUid];
  const partnerVote = partnerPlayer ? votes[partnerPlayer.uid] : undefined;
  const bothVoted = myVote !== undefined && (playersList.length < 2 || partnerVote !== undefined);

  useEffect(() => {
    if (!room.gameState || room.gameState.chapterIndex === undefined) {
      if (room.hostUid === currentUserUid) {
        initQuest();
      }
    }
  }, [room.gameState, room.hostUid, currentUserUid]);

  const initQuest = async () => {
    if (onRematch) {
      onRematch();
      return;
    }
    try {
      const now = new Date().toISOString();
      await updateDoc(doc(db, 'rooms', room.roomId), {
        gameState: {
          chapterIndex: 0,
          votes: {},
          chosenPath: [],
          starsCollected: 0,
          isCompleted: false,
        },
        updatedAt: now,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.roomId}`);
    }
  };

  const handleChoose = async (choiceId: string) => {
    if (myVote || bothVoted) return;

    try {
      sound.playPop();
      const now = new Date().toISOString();

      await updateDoc(doc(db, 'rooms', room.roomId), {
        [`gameState.votes.${currentUserUid}`]: choiceId,
        updatedAt: now,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.roomId}`);
    }
  };

  const handleAdvanceChapter = async () => {
    if (!currentChapter) return;
    try {
      sound.playSuccess();
      // If votes differ, pick the host's or agree
      const resolvedChoiceId = myVote || currentChapter.choices[0].id;
      const chosenChoice = currentChapter.choices.find((c) => c.id === resolvedChoiceId) || currentChapter.choices[0];

      const nextPath = [
        ...chosenPath,
        {
          chapterId: currentChapter.id,
          choiceId: resolvedChoiceId,
          outcome: chosenChoice.outcome,
        },
      ];

      const nextStars = starsCollected + 2;
      const nextChapterIdx = chapterIndex + 1;
      const finished = nextChapterIdx >= COUPLE_QUEST_STORY.chapters.length;

      if (finished) {
        fireVictoryFanfare();
        // Save to memories
        addDoc(collection(db, 'rooms', room.roomId, 'memories'), {
          type: 'adventure_story',
          title: 'Sakura Starlight Journey',
          content: { path: nextPath, stars: nextStars },
          creatorUid: currentUserUid,
          createdAt: new Date().toISOString(),
        }).catch(() => {});
      }

      await updateDoc(doc(db, 'rooms', room.roomId), {
        gameState: {
          chapterIndex: nextChapterIdx,
          votes: {},
          chosenPath: nextPath,
          starsCollected: nextStars,
          isCompleted: finished,
        },
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.roomId}`);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-xl mx-auto">
      {/* Stars Counter */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-700 flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
          <span>{starsCollected} Starlight Stars Earned</span>
        </span>
      </div>

      {!isCompleted && currentChapter ? (
        <div className="w-full bg-gradient-to-b from-white via-purple-50/40 to-pink-50/40 rounded-3xl p-6 sm:p-8 border-2 border-purple-200 shadow-md mb-6">
          <span className="text-[11px] font-bold text-purple-600 uppercase tracking-widest block mb-2">
            {currentChapter.title}
          </span>
          <p className="font-heading font-medium text-sm sm:text-base text-purple-950 leading-relaxed mb-6">
            {currentChapter.narrative}
          </p>

          {/* Choices */}
          <div className="grid grid-cols-1 gap-3 mb-6">
            {currentChapter.choices.map((choice) => {
              const isSelected = myVote === choice.id;
              return (
                <button
                  key={choice.id}
                  onClick={() => handleChoose(choice.id)}
                  disabled={!!myVote}
                  className={`p-4 rounded-2xl border-2 text-left text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'border-purple-600 bg-purple-100/80 text-purple-950 shadow-xs'
                      : myVote
                      ? 'border-gray-200 opacity-60 cursor-not-allowed bg-white'
                      : 'border-purple-200 bg-white hover:border-purple-400 hover:bg-purple-50 text-purple-900 shadow-2xs hover:scale-101 active:scale-99'
                  }`}
                >
                  <p className="mb-1">{choice.text}</p>
                  {bothVoted && (
                    <p className="text-[11px] text-purple-700 font-normal italic mt-2 pt-2 border-t border-purple-100">
                      Outcome: {choice.outcome}
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Advance button */}
          {bothVoted && (
            <div className="text-center">
              <button
                onClick={handleAdvanceChapter}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:opacity-95 transition-opacity flex items-center gap-2 mx-auto cursor-pointer animate-scale-in"
              >
                <span>Continue Journey</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Journey Complete View */
        <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border-2 border-pink-200 shadow-md text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-400 to-purple-400 text-white flex items-center justify-center mx-auto mb-4 shadow-md">
            <Heart className="w-8 h-8 fill-white" />
          </div>
          <h3 className="font-heading font-bold text-2xl text-purple-950 mb-2">
            Quest Completed Together!
          </h3>
          <p className="text-xs sm:text-sm text-purple-800/80 mb-6 max-w-md mx-auto leading-relaxed">
            You walked the Sakura path hand-in-hand, solved ancient puzzles, and made an eternal wish under the stars. This tale has been preserved in your shared memories box.
          </p>

          <div className="space-y-3 mb-6 text-left max-w-md mx-auto">
            {chosenPath.map((step, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-pink-50/70 border border-pink-100 text-xs text-purple-900">
                <span className="font-bold block text-pink-700">Chapter {idx + 1} Memory:</span>
                <p className="mt-0.5">{step.outcome}</p>
              </div>
            ))}
          </div>

          <button
            onClick={initQuest}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer"
          >
            Replay Adventure
          </button>
        </div>
      )}
    </div>
  );
};
