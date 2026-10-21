import React, { useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc 
} from 'firebase/firestore';
import { X, Sparkles, LogIn, ArrowRight } from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { AVATAR_OPTIONS } from '../data/questionBanks';
import { sound } from '../utils/sound';

interface JoinRoomModalProps {
  currentUserUid: string;
  initialCode?: string;
  onClose: () => void;
  onRoomJoined: (roomId: string) => void;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
  currentUserUid,
  initialCode = '',
  onClose,
  onRoomJoined,
}) => {
  const [roomCode, setRoomCode] = useState(initialCode.toUpperCase().slice(0, 6));
  const [nickname, setNickname] = useState(() => localStorage.getItem('loveverse_nickname') || auth.currentUser?.displayName?.split(' ')[0] || '');
  const [avatarId, setAvatarId] = useState(() => localStorage.getItem('loveverse_avatar') || 'cat');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = roomCode.trim().toUpperCase();
    const cleanName = nickname.trim();

    if (!cleanCode || cleanCode.length < 4) {
      setErrorMessage('Please enter a valid 6-character room code.');
      return;
    }
    if (!cleanName) {
      setErrorMessage('Please enter your nickname!');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      sound.playPop();

      // Save user profile preference
      localStorage.setItem('loveverse_nickname', cleanName);
      localStorage.setItem('loveverse_avatar', avatarId);

      // Search room by roomCode
      const roomsRef = collection(db, 'rooms');
      const q = query(roomsRef, where('roomCode', '==', cleanCode));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setErrorMessage('Room not found. Please double-check the code.');
        setIsSubmitting(false);
        return;
      }

      const roomDoc = querySnapshot.docs[0];
      const roomData = roomDoc.data();
      const roomId = roomDoc.id;

      if (roomData.status === 'closed') {
        setErrorMessage('This love room has already been closed by the host.');
        setIsSubmitting(false);
        return;
      }

      const playerUids: string[] = roomData.playerUids || [];
      const isAlreadyPlayer = playerUids.includes(currentUserUid);

      if (isAlreadyPlayer) {
        // Reconnection: update profile & timestamp
        const now = new Date().toISOString();
        await updateDoc(doc(db, 'rooms', roomId), {
          [`players.${currentUserUid}.nickname`]: cleanName,
          [`players.${currentUserUid}.avatarId`]: avatarId,
          [`players.${currentUserUid}.lastSeenAt`]: now,
          updatedAt: now,
        });
        sound.playSuccess();
        onRoomJoined(roomId);
        return;
      }

      // Check if room is full
      if (playerUids.length >= 2) {
        setErrorMessage('This room is already full (maximum 2 lovers).');
        setIsSubmitting(false);
        return;
      }

      // Join as second player (Guest seat)
      const now = new Date().toISOString();
      const newPlayers = {
        ...(roomData.players || {}),
        [currentUserUid]: {
          uid: currentUserUid,
          nickname: cleanName,
          avatarId,
          seatIndex: 1,
          isReady: false,
          lastSeenAt: now,
        },
      };

      await updateDoc(doc(db, 'rooms', roomId), {
        playerUids: [...playerUids, currentUserUid],
        players: newPlayers,
        status: 'ready',
        updatedAt: now,
        lastActivityAt: now,
      });

      sound.playSuccess();
      onRoomJoined(roomId);
    } catch (err: any) {
      console.error('Failed to join room:', err);
      setErrorMessage('Failed to join room. Please check your network connection.');
      handleFirestoreError(err, OperationType.UPDATE, 'rooms');
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
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-400 to-indigo-400 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <LogIn className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-2xl text-purple-950">
            Join Love Room
          </h3>
          <p className="text-xs text-purple-800/70 mt-1">
            Connect to your partner's private gaming session.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Room Code */}
          <div>
            <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider mb-1.5">
              Room Code
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="e.g. LOVE89"
              maxLength={6}
              required
              className="w-full text-center font-mono font-bold tracking-widest text-lg px-4 py-3 rounded-2xl bg-pink-50/60 border border-pink-200 uppercase text-purple-950 placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>

          {/* Nickname input */}
          <div>
            <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider mb-1.5">
              Your Nickname
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. Honey, Mochi, Jordan..."
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
            <div className="grid grid-cols-4 gap-2">
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
                    className={`flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-purple-500 bg-purple-100/70 shadow-sm scale-105'
                        : 'border-pink-100 hover:border-purple-300 bg-white'
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
            disabled={isSubmitting || roomCode.length < 4}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white font-bold text-sm shadow-md hover:opacity-95 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Connecting Hearts...</span>
              </>
            ) : (
              <>
                <span>Enter Room</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
