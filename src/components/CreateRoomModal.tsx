import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { X, Sparkles, Heart, ArrowRight } from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { AVATAR_OPTIONS } from '../data/questionBanks';
import { sound } from '../utils/sound';

interface CreateRoomModalProps {
  currentUserUid: string;
  onClose: () => void;
  onRoomCreated: (roomId: string) => void;
}

// Generate unambiguous 6-character room code
function generateRoomCode(): string {
  const prefixes = ['LOVE', 'HUG', 'KISS', 'ROSE', 'STAR', 'BABY', 'DEAR', 'MOON', 'SWEET'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const digits = '23456789';
  let numPart = '';
  for (let i = 0; i < (6 - prefix.length); i++) {
    numPart += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return (prefix + numPart).slice(0, 6);
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  currentUserUid,
  onClose,
  onRoomCreated,
}) => {
  const [nickname, setNickname] = useState(() => localStorage.getItem('loveverse_nickname') || auth.currentUser?.displayName?.split(' ')[0] || '');
  const [avatarId, setAvatarId] = useState(() => localStorage.getItem('loveverse_avatar') || 'bunny');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = nickname.trim();
    if (!cleanName) {
      setErrorMessage('Please enter a sweet nickname!');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      sound.playPop();

      // Save preferences
      localStorage.setItem('loveverse_nickname', cleanName);
      localStorage.setItem('loveverse_avatar', avatarId);

      const roomCode = generateRoomCode();
      const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString();

      const newRoomData = {
        roomId,
        roomCode,
        hostUid: currentUserUid,
        status: 'waiting',
        playerUids: [currentUserUid],
        players: {
          [currentUserUid]: {
            uid: currentUserUid,
            nickname: cleanName,
            avatarId,
            seatIndex: 0,
            isReady: false,
            lastSeenAt: now,
          },
        },
        activeGame: null,
        gameState: null,
        createdAt: now,
        updatedAt: now,
        lastActivityAt: now,
      };

      await setDoc(doc(db, 'rooms', roomId), newRoomData);
      sound.playSuccess();
      onRoomCreated(roomId);
    } catch (err: any) {
      console.error('Failed to create room:', err);
      setErrorMessage('Could not create room. Please check your internet connection.');
      handleFirestoreError(err, OperationType.CREATE, 'rooms');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-pink-200 relative animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-pink-50 text-purple-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-400 to-rose-400 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <Heart className="w-6 h-6 fill-white text-white" />
          </div>
          <h3 className="font-heading font-bold text-2xl text-purple-950">
            Create Love Room
          </h3>
          <p className="text-xs text-purple-800/70 mt-1">
            Pick your avatar and name to get your private 2-player room.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nickname input */}
          <div>
            <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider mb-1.5">
              Your Nickname
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. Sweetheart, Bunny, Alex..."
              maxLength={24}
              required
              className="w-full px-4 py-3 rounded-2xl bg-pink-50/60 border border-pink-200 text-sm font-semibold text-purple-950 placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>

          {/* Avatar selection */}
          <div>
            <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider mb-2">
              Choose Your Mascot
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {AVATAR_OPTIONS.map((av) => {
                const isSelected = avatarId === av.id;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      setAvatarId(av.id);
                    }}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-pink-500 bg-pink-100/70 shadow-sm scale-105'
                        : 'border-pink-100 hover:border-pink-300 bg-white'
                    }`}
                  >
                    <span className="text-2xl mb-1">{av.emoji}</span>
                    <span className="text-[10px] font-semibold text-purple-900 truncate w-full text-center">
                      {av.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-bold text-sm shadow-md hover:opacity-95 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Opening Sanctuary...</span>
              </>
            ) : (
              <>
                <span>Launch Private Room</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
