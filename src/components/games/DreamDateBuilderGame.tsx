import React, { useState, useEffect } from 'react';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { Sparkles, Heart, CalendarHeart, BookmarkCheck, RotateCcw } from 'lucide-react';
import { Room } from '../../types';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { sound } from '../../utils/sound';
import { fireVictoryFanfare } from '../../utils/confetti';
import { DREAM_DATE_OPTIONS } from '../../data/questionBanks';

interface DreamDateProps {
  room: Room;
  currentUserUid: string;
  onRematch?: () => void;
}

export const DreamDateBuilderGame: React.FC<DreamDateProps> = ({ room, currentUserUid, onRematch }) => {
  const gameState = room.gameState || {};
  const currentStep: number = gameState.currentStep || 0;
  const selections: {
    destination?: string;
    vibe?: string;
    food?: string;
    nightActivity?: string;
  } = gameState.selections || {};
  const isFinished: boolean = gameState.isFinished || false;

  const [savedMemory, setSavedMemory] = useState(false);

  useEffect(() => {
    if (!room.gameState || room.gameState.currentStep === undefined) {
      if (room.hostUid === currentUserUid) {
        initBuilder();
      }
    }
  }, [room.gameState, room.hostUid, currentUserUid]);

  const initBuilder = async () => {
    if (onRematch) {
      onRematch();
      setSavedMemory(false);
      return;
    }
    try {
      const now = new Date().toISOString();
      await updateDoc(doc(db, 'rooms', room.roomId), {
        gameState: {
          currentStep: 0,
          selections: {},
          isFinished: false,
        },
        updatedAt: now,
      });
      setSavedMemory(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.roomId}`);
    }
  };

  const handlePick = async (categoryKey: 'destination' | 'vibe' | 'food' | 'nightActivity', itemId: string) => {
    try {
      sound.playPop();
      const nextSelections = { ...selections, [categoryKey]: itemId };
      const nextStep = currentStep + 1;
      const finished = nextStep >= 4;

      if (finished) {
        sound.playSuccess();
        fireVictoryFanfare();
      }

      const now = new Date().toISOString();
      await updateDoc(doc(db, 'rooms', room.roomId), {
        gameState: {
          currentStep: nextStep,
          selections: nextSelections,
          isFinished: finished,
        },
        updatedAt: now,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.roomId}`);
    }
  };

  const handleSaveToMemories = async () => {
    try {
      sound.playDing();
      const dest = DREAM_DATE_OPTIONS.destinations.find((d) => d.id === selections.destination);
      const vibe = DREAM_DATE_OPTIONS.vibes.find((v) => v.id === selections.vibe);
      const food = DREAM_DATE_OPTIONS.foods.find((f) => f.id === selections.food);
      const night = DREAM_DATE_OPTIONS.nightActivities.find((n) => n.id === selections.nightActivity);

      await addDoc(collection(db, 'rooms', room.roomId, 'memories'), {
        type: 'dream_date',
        title: `Dream Date in ${dest?.name || 'Paradise'}`,
        content: {
          destination: dest?.name,
          vibe: vibe?.name,
          food: food?.name,
          nightActivity: night?.name,
        },
        creatorUid: currentUserUid,
        createdAt: new Date().toISOString(),
      });
      setSavedMemory(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `rooms/${room.roomId}/memories`);
    }
  };

  const destObj = DREAM_DATE_OPTIONS.destinations.find((d) => d.id === selections.destination);
  const vibeObj = DREAM_DATE_OPTIONS.vibes.find((v) => v.id === selections.vibe);
  const foodObj = DREAM_DATE_OPTIONS.foods.find((f) => f.id === selections.food);
  const nightObj = DREAM_DATE_OPTIONS.nightActivities.find((n) => n.id === selections.nightActivity);

  return (
    <div className="flex flex-col items-center max-w-xl mx-auto">
      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-6">
        {['Destination', 'Vibe', 'Dining', 'Nighttime'].map((step, idx) => (
          <div
            key={idx}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
              idx === currentStep
                ? 'bg-rose-500 text-white shadow-2xs ring-2 ring-rose-200'
                : idx < currentStep
                ? 'bg-rose-100 text-rose-700'
                : 'bg-white border border-pink-200 text-purple-900/50'
            }`}
          >
            {idx + 1}. {step}
          </div>
        ))}
      </div>

      {!isFinished ? (
        <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border-2 border-pink-200 shadow-md">
          {currentStep === 0 && (
            <div>
              <h3 className="font-heading font-bold text-lg text-purple-950 mb-1">
                Step 1: Choose Your Fantasy Destination
              </h3>
              <p className="text-xs text-purple-800/70 mb-4">
                Where should the two of you escape to?
              </p>
              <div className="grid grid-cols-1 gap-2.5">
                {DREAM_DATE_OPTIONS.destinations.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => handlePick('destination', d.id)}
                    className="p-3.5 rounded-2xl border border-pink-100 hover:border-pink-300 hover:bg-pink-50/50 flex items-center gap-3 text-left transition-all cursor-pointer shadow-2xs"
                  >
                    <span className="text-3xl">{d.icon}</span>
                    <div>
                      <h4 className="font-bold text-sm text-purple-950">{d.name}</h4>
                      <p className="text-xs text-purple-800/70">{d.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div>
              <h3 className="font-heading font-bold text-lg text-purple-950 mb-1">
                Step 2: Set the Vibe & Attire
              </h3>
              <p className="text-xs text-purple-800/70 mb-4">
                What mood and energy should define our evening?
              </p>
              <div className="grid grid-cols-1 gap-2.5">
                {DREAM_DATE_OPTIONS.vibes.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => handlePick('vibe', v.id)}
                    className="p-3.5 rounded-2xl border border-purple-100 hover:border-purple-300 hover:bg-purple-50/50 flex items-center gap-3 text-left transition-all cursor-pointer shadow-2xs"
                  >
                    <span className="text-3xl">{v.icon}</span>
                    <div>
                      <h4 className="font-bold text-sm text-purple-950">{v.name}</h4>
                      <p className="text-xs text-purple-800/70">{v.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h3 className="font-heading font-bold text-lg text-purple-950 mb-1">
                Step 3: Pick the Gourmet Dining
              </h3>
              <p className="text-xs text-purple-800/70 mb-4">
                What scrumptious feast will we share together?
              </p>
              <div className="grid grid-cols-1 gap-2.5">
                {DREAM_DATE_OPTIONS.foods.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => handlePick('food', f.id)}
                    className="p-3.5 rounded-2xl border border-rose-100 hover:border-rose-300 hover:bg-rose-50/50 flex items-center gap-3 text-left transition-all cursor-pointer shadow-2xs"
                  >
                    <span className="text-3xl">{f.icon}</span>
                    <div>
                      <h4 className="font-bold text-sm text-purple-950">{f.name}</h4>
                      <p className="text-xs text-purple-800/70">{f.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h3 className="font-heading font-bold text-lg text-purple-950 mb-1">
                Step 4: The Late-Night Climax
              </h3>
              <p className="text-xs text-purple-800/70 mb-4">
                How should our magical evening conclude under the stars?
              </p>
              <div className="grid grid-cols-1 gap-2.5">
                {DREAM_DATE_OPTIONS.nightActivities.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handlePick('nightActivity', n.id)}
                    className="p-3.5 rounded-2xl border border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50/50 flex items-center gap-3 text-left transition-all cursor-pointer shadow-2xs"
                  >
                    <span className="text-3xl">{n.icon}</span>
                    <div>
                      <h4 className="font-bold text-sm text-purple-950">{n.name}</h4>
                      <p className="text-xs text-purple-800/70">{n.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Final Combined Dream Date Keepsake Card */
        <div className="w-full bg-gradient-to-br from-pink-500 via-rose-400 to-purple-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl text-center relative overflow-hidden animate-scale-in">
          <span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
            💌 Our Collaborative Dream Date
          </span>

          <h3 className="font-heading font-extrabold text-2xl sm:text-3xl my-3">
            {destObj?.name}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left my-6 bg-black/15 p-4 rounded-2xl backdrop-blur-xs">
            <div className="p-2">
              <span className="text-[11px] font-bold text-pink-200 block">Atmosphere & Vibe:</span>
              <p className="text-sm font-semibold">{vibeObj?.name}</p>
              <p className="text-[11px] text-white/80">{vibeObj?.desc}</p>
            </div>
            <div className="p-2">
              <span className="text-[11px] font-bold text-pink-200 block">Dinner & Dining:</span>
              <p className="text-sm font-semibold">{foodObj?.name}</p>
              <p className="text-[11px] text-white/80">{foodObj?.desc}</p>
            </div>
            <div className="p-2 sm:col-span-2 border-t border-white/10 pt-2">
              <span className="text-[11px] font-bold text-pink-200 block">Midnight Finale:</span>
              <p className="text-sm font-semibold">{nightObj?.name}</p>
              <p className="text-[11px] text-white/80">{nightObj?.desc}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleSaveToMemories}
              disabled={savedMemory}
              className="px-6 py-3 rounded-2xl bg-white text-purple-950 font-bold text-xs uppercase tracking-wider shadow-md hover:bg-pink-50 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <BookmarkCheck className="w-4 h-4 text-emerald-600" />
              <span>{savedMemory ? 'Saved to Memories Box! 💕' : 'Save to Our Memories Box'}</span>
            </button>
            <button
              onClick={initBuilder}
              className="px-4 py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
