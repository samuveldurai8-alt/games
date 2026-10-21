import React, { useState, useEffect, useRef } from 'react';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { 
  Sparkles, 
  Heart, 
  Flame, 
  Shuffle, 
  CheckCircle, 
  SkipForward, 
  PlusCircle, 
  BookmarkPlus, 
  RotateCw,
  Trophy
} from 'lucide-react';
import { Room } from '../../types';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { sound } from '../../utils/sound';
import { fireHeartConfetti, fireVictoryFanfare } from '../../utils/confetti';
import { TRUTH_OR_DARE_DATA, AVATAR_OPTIONS } from '../../data/questionBanks';

interface TruthOrDareProps {
  room: Room;
  currentUserUid: string;
}

type Mode = 'truth' | 'dare';
type Category = 'cute' | 'flirty' | 'romantic' | 'deep' | 'funny' | 'random';

const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: 'cute', label: 'Cute', icon: '🌸' },
  { id: 'flirty', label: 'Flirty', icon: '💋' },
  { id: 'romantic', label: 'Romantic', icon: '💖' },
  { id: 'deep', label: 'Deep', icon: '🌊' },
  { id: 'funny', label: 'Funny', icon: '😂' },
  { id: 'random', label: 'Random', icon: '🎲' },
];

export const TruthOrDareGame: React.FC<TruthOrDareProps> = ({ room, currentUserUid }) => {
  const gameState = room.gameState || {};
  const currentTurnUid: string = gameState.currentTurnUid || room.hostUid;
  const currentCard = gameState.currentCard || null;
  const completedCount = gameState.completedCount || 0;
  const spinAngle: number = gameState.spinAngle || 0;
  const isSpinning: boolean = gameState.isSpinning || false;
  const spinTargetUid: string | null = gameState.spinTargetUid || null;
  const hasSpun: boolean = gameState.hasSpun || false;

  const [customText, setCustomText] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>('cute');
  const [localSpinning, setLocalSpinning] = useState(false);

  const playersList = Object.values(room.players || {});
  const hostPlayer = playersList.find((p) => p.seatIndex === 0) || playersList[0];
  const guestPlayer = playersList.find((p) => p.seatIndex === 1) || playersList[1] || hostPlayer;
  const partnerPlayer = playersList.find((p) => p.uid !== currentUserUid);

  const chosenPlayer = playersList.find((p) => p.uid === currentTurnUid) || playersList[0];
  const isMyTurn = currentTurnUid === currentUserUid;

  // Sound effect during spin
  useEffect(() => {
    if (isSpinning) {
      setLocalSpinning(true);
      sound.playPop();
      const interval = setInterval(() => {
        sound.playPop();
      }, 350);

      const timer = setTimeout(() => {
        clearInterval(interval);
        setLocalSpinning(false);
        sound.playDing();
        fireHeartConfetti();
      }, 3200);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [isSpinning, spinAngle]);

  const handleSpinBottle = async () => {
    if (isSpinning || localSpinning) return;

    try {
      sound.playPop();
      // Select chosen player: 50% chance between players
      const targetIsHost = Math.random() > 0.5;
      const targetUid = targetIsHost ? hostPlayer.uid : guestPlayer.uid;

      // 0 degrees points up (Host), 180 degrees points down (Guest)
      const baseAngle = targetIsHost ? 0 : 180;
      // Add 5 to 8 full rotations (1800 - 2880 deg) + slight randomized jitter (-12 to +12 deg)
      const fullRotations = (5 + Math.floor(Math.random() * 4)) * 360;
      const jitter = Math.floor(Math.random() * 24) - 12;
      const newAngle = spinAngle + fullRotations + (baseAngle - (spinAngle % 360) + 360) % 360 + jitter;

      const now = new Date().toISOString();
      await updateDoc(doc(db, 'rooms', room.roomId), {
        'gameState.isSpinning': true,
        'gameState.spinAngle': newAngle,
        'gameState.spinTargetUid': targetUid,
        'gameState.hasSpun': true,
        'gameState.currentCard': null, // Clear previous card to focus on spin
        updatedAt: now,
      });

      // After 3.2s spin finishes, commit chosen player as active turn
      setTimeout(async () => {
        try {
          await updateDoc(doc(db, 'rooms', room.roomId), {
            'gameState.isSpinning': false,
            'gameState.currentTurnUid': targetUid,
            updatedAt: new Date().toISOString(),
          });
        } catch {
          // ignore
        }
      }, 3300);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.roomId}`);
    }
  };

  const drawNewCard = async (mode: Mode, category: Category = selectedCategory) => {
    try {
      sound.playCardFlip();
      const deck = TRUTH_OR_DARE_DATA[mode] as Record<string, string[]>;
      const categoryList = deck[category] || deck.cute || deck.romantic || [];
      const randomIndex = Math.floor(Math.random() * categoryList.length);
      const text = categoryList[randomIndex] || "Tell your partner why you love them today.";

      const now = new Date().toISOString();
      await updateDoc(doc(db, 'rooms', room.roomId), {
        'gameState.currentCard': {
          mode,
          category,
          text,
          isCustom: false,
        },
        'gameState.currentTurnUid': currentTurnUid,
        'gameState.hasSpun': true,
        updatedAt: now,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.roomId}`);
    }
  };

  const handleComplete = async () => {
    try {
      sound.playSuccess();
      fireVictoryFanfare();
      const now = new Date().toISOString();

      await updateDoc(doc(db, 'rooms', room.roomId), {
        'gameState.currentCard': null,
        'gameState.hasSpun': false, // Prompt next spin!
        'gameState.completedCount': completedCount + 1,
        updatedAt: now,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.roomId}`);
    }
  };

  const handleSkip = async () => {
    try {
      sound.playPop();
      const now = new Date().toISOString();

      await updateDoc(doc(db, 'rooms', room.roomId), {
        'gameState.currentCard': null,
        'gameState.hasSpun': false,
        updatedAt: now,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.roomId}`);
    }
  };

  const handleSaveToMemories = async () => {
    if (!currentCard) return;
    try {
      sound.playDing();
      await addDoc(collection(db, 'rooms', room.roomId, 'memories'), {
        type: 'favorite_answer',
        title: `${currentCard.mode.toUpperCase()}: ${currentCard.category}`,
        content: { text: currentCard.text, answeredBy: chosenPlayer?.nickname },
        creatorUid: currentUserUid,
        createdAt: new Date().toISOString(),
      });
      alert('Saved to your shared memories box! 💌');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `rooms/${room.roomId}/memories`);
    }
  };

  const handleAddCustom = async (mode: Mode) => {
    if (!customText.trim()) return;
    try {
      sound.playChime();
      const now = new Date().toISOString();
      await updateDoc(doc(db, 'rooms', room.roomId), {
        'gameState.currentCard': {
          mode,
          category: 'custom',
          text: customText.trim(),
          isCustom: true,
        },
        'gameState.hasSpun': true,
        updatedAt: now,
      });
      setCustomText('');
      setShowCustomModal(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.roomId}`);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-xl mx-auto">
      {/* Turn status header */}
      <div className="mb-4 text-center">
        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-pink-100 text-pink-700">
          Completed {completedCount} Challenges Together 💕
        </span>
      </div>

      {/* ========================================================= */}
      {/* 🍾 ROMANTIC BOTTLE SPINNER SECTION */}
      {/* ========================================================= */}
      <div className="w-full bg-gradient-to-b from-purple-50/70 via-pink-50/40 to-white rounded-3xl p-6 border-2 border-pink-200/80 shadow-md mb-6 flex flex-col items-center text-center relative overflow-hidden">
        {/* Host Avatar (Top of Wheel) */}
        <div className={`flex items-center gap-2 p-2 rounded-2xl transition-all ${
          !isSpinning && spinTargetUid === hostPlayer.uid
            ? 'bg-rose-100 border-2 border-rose-300 shadow-sm scale-105'
            : 'opacity-80'
        }`}>
          <span className="text-2xl">
            {AVATAR_OPTIONS.find((a) => a.id === hostPlayer.avatarId)?.emoji || '🐰'}
          </span>
          <span className="font-bold text-xs text-purple-950">
            {hostPlayer.nickname} {hostPlayer.uid === currentUserUid ? '(You)' : ''}
          </span>
          {!isSpinning && spinTargetUid === hostPlayer.uid && (
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
              CHOSEN!
            </span>
          )}
        </div>

        {/* The Spinning Bottle Circle Area */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 my-4 flex items-center justify-center">
          {/* Circular Track Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-dashed border-pink-200/90 shadow-inner flex items-center justify-center pointer-events-none">
            <div className="w-40 h-40 rounded-full border border-pink-100 bg-pink-50/20" />
          </div>

          {/* Decorative Hearts around ring */}
          <span className="absolute top-1 text-sm opacity-60">🌸</span>
          <span className="absolute bottom-1 text-sm opacity-60">💖</span>
          <span className="absolute left-1 text-sm opacity-60">✨</span>
          <span className="absolute right-1 text-sm opacity-60">🥂</span>

          {/* Center Pivot Point */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-400 to-purple-400 shadow-md z-10 flex items-center justify-center text-white">
            <Heart className="w-4 h-4 fill-white" />
          </div>

          {/* The Spinning Romantic Bottle */}
          <div
            className="absolute z-20 flex flex-col items-center justify-center transition-transform"
            style={{
              width: '180px',
              height: '180px',
              transform: `rotate(${spinAngle}deg)`,
              transition: isSpinning ? 'transform 3.2s cubic-bezier(0.18, 0.89, 0.32, 1.05)' : 'none',
              transformOrigin: 'center center',
            }}
          >
            {/* Top Pointer Tip (Bottle Neck) */}
            <div className="w-5 h-8 bg-gradient-to-b from-amber-400 to-amber-300 rounded-t-lg shadow-sm border border-amber-500 flex items-center justify-center">
              <span className="text-[10px]">✨</span>
            </div>
            {/* Bottle Body */}
            <div className="w-9 h-14 bg-gradient-to-b from-rose-400 via-pink-400 to-purple-500 rounded-2xl shadow-lg border-2 border-white flex flex-col items-center justify-center">
              <span className="text-sm select-none">🍾</span>
            </div>
          </div>
        </div>

        {/* Guest Avatar (Bottom of Wheel) */}
        {playersList.length >= 2 && (
          <div className={`flex items-center gap-2 p-2 rounded-2xl transition-all ${
            !isSpinning && spinTargetUid === guestPlayer.uid
              ? 'bg-rose-100 border-2 border-rose-300 shadow-sm scale-105'
              : 'opacity-80'
          }`}>
            <span className="text-2xl">
              {AVATAR_OPTIONS.find((a) => a.id === guestPlayer.avatarId)?.emoji || '🌸'}
            </span>
            <span className="font-bold text-xs text-purple-950">
              {guestPlayer.nickname} {guestPlayer.uid === currentUserUid ? '(You)' : ''}
            </span>
            {!isSpinning && spinTargetUid === guestPlayer.uid && (
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                CHOSEN!
              </span>
            )}
          </div>
        )}

        {/* Spin Bottle Action Button */}
        <div className="mt-4 flex flex-col items-center gap-2">
          <button
            onClick={handleSpinBottle}
            disabled={isSpinning || localSpinning}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${isSpinning || localSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning || localSpinning ? 'Spinning the Bottle...' : 'Spin the Bottle! 🍾'}</span>
          </button>
          <span className="text-[11px] text-purple-700/70 font-medium">
            {isSpinning
              ? 'Round & round it goes... who will fate choose?!'
              : hasSpun
              ? `Fate picked ${chosenPlayer?.nickname}! Time to choose Truth or Dare!`
              : 'Spin the bottle to randomly pick whose turn it is!'}
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TRUTH OR DARE CATEGORY & DECK CHOICES */}
      {/* ========================================================= */}

      {/* Category selector */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              if (currentCard) {
                drawNewCard(currentCard.mode, cat.id);
              }
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-white/80 text-purple-900 hover:bg-pink-100 border border-pink-200'
            }`}
          >
            <span>{cat.icon} {cat.label}</span>
          </button>
        ))}
      </div>

      {/* Mode Buttons (Truth or Dare) */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-6">
        <button
          onClick={() => drawNewCard('truth', selectedCategory)}
          className={`py-3.5 rounded-2xl font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            currentCard?.mode === 'truth'
              ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white ring-2 ring-pink-300'
              : 'bg-white text-pink-600 border border-pink-200 hover:bg-pink-50'
          }`}
        >
          <Heart className="w-4 h-4 fill-current" />
          <span>Draw Truth</span>
        </button>

        <button
          onClick={() => drawNewCard('dare', selectedCategory)}
          className={`py-3.5 rounded-2xl font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            currentCard?.mode === 'dare'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-500 text-white ring-2 ring-purple-300'
              : 'bg-white text-purple-600 border border-purple-200 hover:bg-purple-50'
          }`}
        >
          <Flame className="w-4 h-4 fill-current" />
          <span>Draw Dare</span>
        </button>
      </div>

      {/* Main Prompt Card */}
      {currentCard ? (
        <div className="w-full bg-gradient-to-b from-white to-pink-50/60 rounded-3xl p-6 sm:p-8 border-2 border-pink-200 shadow-md text-center relative overflow-hidden mb-6 animate-scale-in">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2 bg-pink-100 text-pink-700">
            {currentCard.mode === 'truth' ? '💖 Truth' : '🔥 Dare'} • {currentCard.category}
          </div>

          <div className="text-xs text-purple-700/80 font-bold mb-4">
            Target: {chosenPlayer?.nickname} {chosenPlayer?.uid === currentUserUid ? '(You)' : ''}
          </div>

          <p className="font-heading font-semibold text-lg sm:text-xl text-purple-950 leading-relaxed min-h-[90px] flex items-center justify-center">
            "{currentCard.text}"
          </p>

          <div className="mt-6 pt-4 border-t border-pink-100 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleComplete}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold shadow-xs hover:opacity-95 flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Done / Finished 💕</span>
            </button>

            <button
              onClick={() => drawNewCard(currentCard.mode, selectedCategory)}
              className="px-4 py-2.5 rounded-2xl bg-white border border-pink-200 text-purple-900 text-xs font-semibold hover:bg-pink-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5 text-pink-500" />
              <span>Draw Another</span>
            </button>

            <button
              onClick={handleSkip}
              className="px-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>Skip (No Penalty)</span>
            </button>

            <button
              onClick={handleSaveToMemories}
              title="Save to Shared Memories"
              className="p-2.5 rounded-2xl bg-pink-100 text-pink-600 hover:bg-pink-200 transition-colors cursor-pointer"
            >
              <BookmarkPlus className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full py-8 rounded-3xl bg-pink-50/60 border border-pink-200 text-center mb-6">
          <p className="text-xs font-semibold text-purple-900 mb-2">
            Spin the bottle above or draw a card to start this round!
          </p>
        </div>
      )}

      {/* Custom Dare / Truth creator button */}
      <button
        onClick={() => setShowCustomModal(true)}
        className="text-xs font-semibold text-purple-700 hover:text-pink-600 transition-colors flex items-center gap-1.5 cursor-pointer"
      >
        <PlusCircle className="w-3.5 h-3.5" />
        <span>Write a Custom Truth or Dare for {partnerPlayer?.nickname || 'Partner'}</span>
      </button>

      {/* Custom Card Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-pink-200 animate-scale-in">
            <h4 className="font-heading font-bold text-lg text-purple-950 mb-2">
              Write Custom Prompt
            </h4>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="e.g. Give me 3 compliments while staring into my eyes..."
              rows={3}
              className="w-full p-3 rounded-2xl bg-pink-50/60 border border-pink-200 text-xs text-purple-950 placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-pink-300 mb-4"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-3 py-2 rounded-xl text-xs text-gray-500 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAddCustom('truth')}
                className="px-4 py-2 rounded-xl bg-pink-500 text-white text-xs font-bold hover:bg-pink-600 cursor-pointer"
              >
                Set Truth
              </button>
              <button
                onClick={() => handleAddCustom('dare')}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 cursor-pointer"
              >
                Set Dare
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
