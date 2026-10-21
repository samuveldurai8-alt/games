import React, { useState } from 'react';
import { 
  Heart, 
  Sparkles, 
  Gamepad2, 
  Flame, 
  Compass, 
  ShieldCheck, 
  ArrowRight,
  PlusCircle,
  LogIn,
  UserCheck
} from 'lucide-react';
import type { User } from 'firebase/auth';

interface WelcomeViewProps {
  currentUser: User | null;
  onGoogleSignIn: () => void;
  onCreateRoom: () => void;
  onJoinRoom: (presetCode?: string) => void;
  inviteCode?: string;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  currentUser,
  onGoogleSignIn,
  onCreateRoom,
  onJoinRoom,
  inviteCode,
}) => {
  const [quickCode, setQuickCode] = useState(inviteCode || '');

  const handleAction = (action: 'create' | 'join') => {
    if (!currentUser) {
      onGoogleSignIn();
      return;
    }
    if (action === 'create') {
      onCreateRoom();
    } else {
      onJoinRoom(quickCode);
    }
  };

  return (
    <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 sm:py-12 flex flex-col items-center">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-pink-200/80 shadow-xs mb-6 animate-pulse-glow">
        <Sparkles className="w-4 h-4 text-pink-500 animate-spin" style={{ animationDuration: '6s' }} />
        <span className="text-xs sm:text-sm font-semibold text-purple-900">
          A Private Multiplayer Universe for Exactly Two
        </span>
        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
      </div>

      {/* Main Title & Tagline */}
      <h1 className="font-heading font-extrabold text-4xl sm:text-6xl text-center text-purple-950 tracking-tight leading-tight mb-4">
        LOVEVERSE
      </h1>
      <p className="font-heading font-medium text-lg sm:text-2xl text-center text-pink-600/90 mb-3">
        Just Us Two. Endless Little Adventures.
      </p>
      <p className="max-w-xl text-center text-sm sm:text-base text-purple-900/75 leading-relaxed mb-6">
        Create a private sanctuary with your favourite person. Play cute games, discover deep truths, challenge each other, and collect shared memories in real-time across any device.
      </p>

      {/* User Login Status Banner / Google Button */}
      {!currentUser ? (
        <div className="mb-8 p-4 rounded-3xl bg-white/90 border-2 border-pink-200 shadow-md flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-400 to-purple-400 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Heart className="w-6 h-6 fill-white" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-purple-950">
              Sign in with Google to Connect
            </h3>
            <p className="text-xs text-purple-800/70">
              One-click Google login powers live synchronization across all devices.
            </p>
          </div>
          <button
            onClick={onGoogleSignIn}
            className="sm:ml-auto px-5 py-2.5 rounded-2xl bg-white border border-gray-300 hover:border-pink-300 hover:bg-pink-50/50 text-gray-700 text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>
        </div>
      ) : (
        <div className="mb-6 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
          <UserCheck className="w-3.5 h-3.5" />
          <span>Connected as {currentUser.displayName || currentUser.email || 'Adventurer'}</span>
        </div>
      )}

      {/* Primary Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl mb-12">
        {/* Create Room Card */}
        <div 
          onClick={() => handleAction('create')}
          className="group relative p-6 rounded-3xl glass-card glass-card-hover border-2 border-pink-300/80 shadow-lg cursor-pointer flex flex-col items-center text-center overflow-hidden transition-all bg-gradient-to-b from-white/95 to-pink-50/70"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-400 to-rose-400 text-white flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform">
            <PlusCircle className="w-7 h-7" />
          </div>
          <h2 className="font-heading font-bold text-xl text-purple-950 mb-1.5">
            Create Private Room
          </h2>
          <p className="text-xs text-purple-800/70 mb-4">
            Get a 6-character room code & invite link to share with your special someone.
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-pink-600 group-hover:translate-x-1 transition-transform">
            Host Room <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Join Room Card */}
        <div 
          onClick={() => handleAction('join')}
          className="group relative p-6 rounded-3xl glass-card glass-card-hover border-2 border-purple-300/70 shadow-lg cursor-pointer flex flex-col items-center text-center overflow-hidden transition-all bg-gradient-to-b from-white/95 to-purple-50/70"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-400 to-indigo-400 text-white flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform">
            <LogIn className="w-7 h-7" />
          </div>
          <h2 className="font-heading font-bold text-xl text-purple-950 mb-1.5">
            Join a Room
          </h2>
          <p className="text-xs text-purple-800/70 mb-4">
            Enter the 6-character code from your partner to jump straight into the lobby.
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 group-hover:translate-x-1 transition-transform">
            Enter Room <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Quick Code Entry Bar */}
      <div className="w-full max-w-md p-4 rounded-2xl glass-card border border-pink-200 mb-12 flex flex-col sm:flex-row items-center gap-3">
        <input
          type="text"
          value={quickCode}
          onChange={(e) => setQuickCode(e.target.value.toUpperCase().slice(0, 6))}
          placeholder="ENTER ROOM CODE (e.g. HUG89)"
          className="w-full sm:flex-1 text-center font-mono font-bold tracking-widest text-sm px-4 py-2.5 rounded-xl bg-white border border-pink-200 text-purple-950 placeholder-purple-300 uppercase focus:outline-none focus:ring-2 focus:ring-pink-300"
          maxLength={6}
        />
        <button
          onClick={() => handleAction('join')}
          disabled={quickCode.length < 4}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold uppercase tracking-wider disabled:opacity-40 hover:opacity-95 transition-opacity cursor-pointer shadow-xs"
        >
          Join Now
        </button>
      </div>

      {/* Feature Highlights Grid */}
      <div className="w-full max-w-4xl">
        <div className="text-center mb-6">
          <h3 className="font-heading font-bold text-xl text-purple-950">
            Everything Built For Two Hearts
          </h3>
          <p className="text-xs text-purple-800/70">
            Real-time synchronization across phones, tablets, and computers
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white/80 border border-pink-200/80 shadow-2xs flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center mb-2.5">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <h4 className="font-heading font-bold text-sm text-purple-950 mb-1">16 Live Games</h4>
            <p className="text-[11px] text-purple-800/70">Tic-tac-toe, Connect 4, Mind Reader, Memory & more.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 border border-pink-200/80 shadow-2xs flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-2.5">
              <Flame className="w-5 h-5" />
            </div>
            <h4 className="font-heading font-bold text-sm text-purple-950 mb-1">1000s of Prompts</h4>
            <p className="text-[11px] text-purple-800/70">Curated romantic, deep & hilarious questions.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 border border-pink-200/80 shadow-2xs flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-2.5">
              <Compass className="w-5 h-5" />
            </div>
            <h4 className="font-heading font-bold text-sm text-purple-950 mb-1">Shared Quests</h4>
            <p className="text-[11px] text-purple-800/70">Branching story adventures and dream date planner.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 border border-pink-200/80 shadow-2xs flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-heading font-bold text-sm text-purple-950 mb-1">100% Private</h4>
            <p className="text-[11px] text-purple-800/70">Only 2 players allowed. Encrypted room security.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
