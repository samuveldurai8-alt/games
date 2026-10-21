import React, { useState } from 'react';
import { 
  Heart, 
  Volume2, 
  VolumeX, 
  Flower2, 
  Copy, 
  Check, 
  LogOut, 
  BookHeart, 
  Share2,
  LogIn,
  User as UserIcon
} from 'lucide-react';
import type { User } from 'firebase/auth';
import { Room } from '../types';
import { sound } from '../utils/sound';
import { AVATAR_OPTIONS } from '../data/questionBanks';

interface HeaderProps {
  room: Room | null;
  currentUser: User | null;
  onGoogleSignIn: () => void;
  onSignOut: () => void;
  onLeaveRoom: () => void;
  onOpenMemories: () => void;
  petalsEnabled: boolean;
  onTogglePetals: () => void;
  activeView: 'lobby' | 'game' | 'memories';
  onReturnToLobby: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  room,
  currentUser,
  onGoogleSignIn,
  onSignOut,
  onLeaveRoom,
  onOpenMemories,
  petalsEnabled,
  onTogglePetals,
  activeView,
  onReturnToLobby,
}) => {
  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.isMuted());
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const currentUserUid = currentUser?.uid || null;

  const handleCopyCode = async () => {
    if (!room) return;
    try {
      await navigator.clipboard.writeText(room.roomCode);
      setCopied(true);
      sound.playDing();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleShareLink = async () => {
    if (!room) return;
    const url = `${window.location.origin}${window.location.pathname}?room=${room.roomCode}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Join me in LOVEVERSE!',
          text: `Enter room code: ${room.roomCode} to play romantic games together!`,
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        sound.playDing();
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // ignore
    }
  };

  const handleToggleSound = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  const playersList = room ? Object.values(room.players || {}) : [];
  const currentPlayer = currentUserUid && room?.players ? room.players[currentUserUid] : null;
  const partnerPlayer = playersList.find((p) => p.uid !== currentUserUid);

  return (
    <>
      <header className="sticky top-0 z-30 w-full glass-card border-b border-pink-200/60 shadow-xs px-4 py-2.5 transition-all">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Logo / Branding */}
          <div 
            onClick={() => {
              if (room && activeView !== 'lobby') {
                onReturnToLobby();
              }
            }}
            className="flex items-center gap-2 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-400 via-rose-300 to-purple-400 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5 fill-white text-white animate-heart-float" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-bold text-lg tracking-wide text-plum bg-gradient-to-r from-purple-800 via-pink-700 to-rose-600 bg-clip-text text-transparent">
                  LOVEVERSE
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-pink-100 text-pink-600 border border-pink-200">
                  Just Us Two
                </span>
              </div>
            </div>
          </div>

          {/* Room info & Players presence */}
          {room && (
            <div className="hidden sm:flex items-center gap-3">
              {/* Room Code Badge */}
              <div className="flex items-center gap-1.5 bg-white/90 border border-pink-200 rounded-full px-3 py-1 shadow-2xs">
                <span className="text-xs text-purple-900/60 font-medium">Room:</span>
                <span className="text-xs font-mono font-bold tracking-widest text-purple-900">
                  {room.roomCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  title="Copy room code"
                  className="p-1 rounded-full hover:bg-pink-100 text-purple-600 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={handleShareLink}
                  title="Share invite link"
                  className="p-1 rounded-full hover:bg-pink-100 text-pink-600 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Player chips */}
              <div className="flex items-center gap-1.5 bg-pink-50/80 border border-pink-100 rounded-full px-2.5 py-1 text-xs">
                {currentPlayer && (
                  <div className="flex items-center gap-1 text-purple-900 font-medium">
                    <span className="text-sm">
                      {AVATAR_OPTIONS.find((a) => a.id === currentPlayer.avatarId)?.emoji || '🐰'}
                    </span>
                    <span>{currentPlayer.nickname} (You)</span>
                  </div>
                )}

                <Heart className="w-3 h-3 text-pink-400 fill-pink-400 mx-0.5" />

                {partnerPlayer ? (
                  <div className="flex items-center gap-1 text-purple-900 font-medium">
                    <span className="text-sm">
                      {AVATAR_OPTIONS.find((a) => a.id === partnerPlayer.avatarId)?.emoji || '🌸'}
                    </span>
                    <span>{partnerPlayer.nickname}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" title="Online" />
                  </div>
                ) : (
                  <span className="text-purple-400 italic text-[11px] animate-pulse">Waiting for partner...</span>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {room && (
              <button
                onClick={onOpenMemories}
                className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeView === 'memories'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white/80 hover:bg-pink-100 text-purple-900 border border-pink-200'
                }`}
                title="View Match History & Shared Memories"
              >
                <BookHeart className="w-4 h-4 text-pink-500" />
                <span className="hidden md:inline">Memories</span>
              </button>
            )}

            {/* Sakura petal toggle */}
            <button
              onClick={onTogglePetals}
              title={petalsEnabled ? 'Pause Sakura Petals' : 'Enable Sakura Petals'}
              className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                petalsEnabled 
                  ? 'bg-pink-100 border-pink-300 text-pink-600' 
                  : 'bg-white/80 border-gray-200 text-gray-400 hover:text-gray-600'
              }`}
            >
              <Flower2 className="w-4 h-4" />
            </button>

            {/* Sound toggle */}
            <button
              onClick={handleToggleSound}
              title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
              className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                !isMuted 
                  ? 'bg-purple-100 border-purple-300 text-purple-700' 
                  : 'bg-white/80 border-gray-200 text-gray-400 hover:text-gray-600'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* User Profile / Auth Toggle */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  title={currentUser.displayName || currentUser.email || 'My Account'}
                  className="p-1.5 rounded-xl border border-pink-200 bg-white/80 hover:bg-pink-50 text-purple-800 transition-colors cursor-pointer flex items-center gap-1 text-xs"
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt="Avatar"
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-4 h-4" />
                  )}
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-pink-200 p-2 z-50 animate-scale-in">
                    <div className="px-3 py-2 border-b border-pink-100 text-[11px]">
                      <p className="font-bold text-purple-950 truncate">
                        {currentUser.displayName || 'Lover'}
                      </p>
                      <p className="text-purple-700/60 truncate">{currentUser.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onSignOut();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer mt-1"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onGoogleSignIn}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-pink-200 hover:bg-pink-50 text-purple-900 text-xs font-bold transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Leave Room Button */}
            {room && (
              <button
                onClick={() => setShowLeaveConfirm(true)}
                title="Leave Room"
                className="p-2 rounded-xl border border-rose-200 bg-rose-50/80 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Leave Room Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-pink-200 text-center animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-3">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-purple-950 mb-1">Leave Loveverse Room?</h3>
            <p className="text-sm text-purple-800/70 mb-5">
              Are you sure you want to disconnect from this private room? You can rejoin anytime using the room code.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium cursor-pointer"
              >
                Stay Together
              </button>
              <button
                onClick={() => {
                  setShowLeaveConfirm(false);
                  onLeaveRoom();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-medium shadow-sm hover:opacity-95 cursor-pointer"
              >
                Leave Room
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
