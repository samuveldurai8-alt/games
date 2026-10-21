import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { 
  Heart, 
  Sparkles, 
  Copy, 
  Check, 
  Share2, 
  Play, 
  Clock, 
  Users, 
  CheckCircle2, 
  Circle,
  Filter
} from 'lucide-react';
import { Room, GameDefinition, GameCategory } from '../types';
import { GAME_CATALOG, AVATAR_OPTIONS } from '../data/questionBanks';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { sound } from '../utils/sound';

interface LobbyViewProps {
  room: Room;
  currentUserUid: string;
  onLaunchGame: (gameId: string) => void;
}

const CATEGORIES: { id: GameCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All Games', icon: '✨' },
  { id: 'competitive', label: 'Competitive', icon: '⚔️' },
  { id: 'truth_or_dare', label: 'Truth or Dare', icon: '🔥' },
  { id: 'compatibility', label: 'Compatibility', icon: '💕' },
  { id: 'mystery', label: 'Mystery Cards', icon: '🔮' },
  { id: 'memory_and_mind', label: 'Memory & Mind', icon: '🧠' },
  { id: 'coop_adventure', label: 'Cooperative', icon: '🌸' },
  { id: 'quick_challenge', label: 'Quick Reflexes', icon: '⚡' },
];

export const LobbyView: React.FC<LobbyViewProps> = ({
  room,
  currentUserUid,
  onLaunchGame,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | 'all'>('all');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const playersList = Object.values(room.players || {});
  const currentPlayer = room.players ? room.players[currentUserUid] : null;
  const partnerPlayer = playersList.find((p) => p.uid !== currentUserUid);
  const isHost = room.hostUid === currentUserUid;

  const bothReady = playersList.length === 2 && playersList.every((p) => p.isReady);

  const handleToggleReady = async () => {
    if (!currentPlayer) return;
    try {
      sound.playPop();
      const nextReady = !currentPlayer.isReady;
      const now = new Date().toISOString();
      await updateDoc(doc(db, 'rooms', room.roomId), {
        [`players.${currentUserUid}.isReady`]: nextReady,
        [`players.${currentUserUid}.lastSeenAt`]: now,
        updatedAt: now,
      });
      if (nextReady) sound.playDing();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.roomId}`);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(room.roomCode);
      setCopiedCode(true);
      sound.playDing();
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}${window.location.pathname}?room=${room.roomCode}`;
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      sound.playDing();
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // ignore
    }
  };

  const filteredGames = selectedCategory === 'all'
    ? GAME_CATALOG
    : GAME_CATALOG.filter((g) => g.category === selectedCategory);

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-8">
      {/* Top Banner: Couple Presence Pod */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-md border border-pink-200/80">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Host Seat */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-start">
            {currentPlayer && (
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-300 to-rose-400 flex items-center justify-center text-3xl shadow-sm">
                    {AVATAR_OPTIONS.find((a) => a.id === currentPlayer.avatarId)?.emoji || '🐰'}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" title="Connected" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-bold text-lg text-purple-950">
                      {currentPlayer.nickname}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                      You
                    </span>
                  </div>
                  <p className="text-xs text-purple-800/70">
                    {currentPlayer.seatIndex === 0 ? '👑 Room Host' : '💖 Invited Guest'}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    {currentPlayer.isReady ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Ready
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Circle className="w-3 h-3" /> Not Ready
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Central Heart Connector & Ready Toggle */}
          <div className="flex flex-col items-center justify-center gap-2.5 text-center">
            <div className="w-12 h-12 rounded-full bg-pink-100 text-rose-500 flex items-center justify-center shadow-inner animate-pulse">
              <Heart className="w-6 h-6 fill-rose-500" />
            </div>
            
            <button
              onClick={handleToggleReady}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                currentPlayer?.isReady
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:opacity-95'
              }`}
            >
              {currentPlayer?.isReady ? 'I Am Ready ✓' : 'Mark as Ready 💕'}
            </button>
          </div>

          {/* Partner Seat */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-end">
            {partnerPlayer ? (
              <div className="flex items-center gap-3.5 flex-row-reverse md:flex-row">
                <div className="text-right md:text-left">
                  <div className="flex items-center gap-2 justify-end md:justify-start">
                    <h3 className="font-heading font-bold text-lg text-purple-950">
                      {partnerPlayer.nickname}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                      Partner
                    </span>
                  </div>
                  <p className="text-xs text-purple-800/70">
                    {partnerPlayer.seatIndex === 0 ? '👑 Room Host' : '💖 Invited Guest'}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 justify-end md:justify-start">
                    {partnerPlayer.isReady ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Ready
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Circle className="w-3 h-3" /> Waiting...
                      </span>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-300 to-indigo-300 flex items-center justify-center text-3xl shadow-sm">
                    {AVATAR_OPTIONS.find((a) => a.id === partnerPlayer.avatarId)?.emoji || '🌸'}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" title="Connected" />
                </div>
              </div>
            ) : (
              /* Waiting for partner invite block */
              <div className="flex flex-col items-center md:items-end text-center md:text-right p-4 rounded-2xl bg-pink-50/70 border border-pink-200/80 max-w-xs">
                <span className="text-xs font-bold text-purple-900 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-pink-500" /> Waiting for your favourite person...
                </span>
                <p className="text-[11px] text-purple-800/70 mb-3">
                  Share this 6-character room code:
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-extrabold text-sm tracking-widest px-3 py-1 bg-white rounded-xl border border-pink-300 text-purple-950">
                    {room.roomCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    title="Copy Code"
                    className="p-1.5 rounded-xl bg-white border border-pink-200 hover:bg-pink-100 text-purple-700 transition-colors cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={handleCopyLink}
                    title="Copy Invite Link"
                    className="p-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-2xs hover:opacity-95 transition-opacity cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Game Catalog Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-heading font-bold text-2xl text-purple-950">
              Pick an Adventure
            </h2>
            <p className="text-xs text-purple-800/70">
              16 multiplayer games crafted for intimacy, laughter, and competition.
            </p>
          </div>

          {/* Both ready indicator badge */}
          {bothReady ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold shadow-2xs animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Both Hearts Ready! Choose a Game!
            </span>
          ) : (
            <span className="text-xs text-purple-700/60 italic">
              {playersList.length < 2
                ? 'Tip: Share code to play live on 2 screens!'
                : 'Click "Mark as Ready" when you are set!'}
            </span>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  sound.playPop();
                  setSelectedCategory(cat.id);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple-900 text-white shadow-xs'
                    : 'bg-white/90 text-purple-900/80 hover:bg-pink-100/70 border border-pink-200/70'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Game Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              className="group rounded-3xl glass-card glass-card-hover border border-pink-200/80 p-5 flex flex-col justify-between shadow-xs hover:border-pink-300 transition-all bg-gradient-to-b from-white/95 to-pink-50/40"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${game.badgeColor}`}>
                    {game.categoryName}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-purple-800/60 font-medium">
                    <Clock className="w-3 h-3" />
                    <span>~{game.estimatedMinutes}m</span>
                  </div>
                </div>

                <h3 className="font-heading font-bold text-lg text-purple-950 group-hover:text-pink-600 transition-colors mb-0.5">
                  {game.title}
                </h3>
                <p className="text-xs font-medium text-pink-600/90 mb-2">
                  {game.subtitle}
                </p>
                <p className="text-xs text-purple-800/70 line-clamp-3 leading-relaxed mb-4">
                  {game.description}
                </p>
              </div>

              <div className="pt-2 border-t border-pink-100/80 flex items-center justify-between">
                <span className="text-[11px] text-purple-600/70 font-semibold uppercase tracking-wider">
                  {game.mode.replace('_', ' ')}
                </span>
                <button
                  onClick={() => {
                    sound.playChime();
                    onLaunchGame(game.id);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 text-white text-xs font-bold shadow-xs hover:opacity-95 active:scale-95 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Play</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
