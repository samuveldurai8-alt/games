import React from 'react';
import { ArrowLeft, RotateCcw, Trophy, Sparkles } from 'lucide-react';
import { Room, GameDefinition } from '../types';
import { AVATAR_OPTIONS, GAME_CATALOG } from '../data/questionBanks';
import { sound } from '../utils/sound';

interface GameRoomWrapperProps {
  room: Room;
  currentUserUid: string;
  gameId: string;
  onReturnToLobby: () => void;
  onRematch?: () => void;
  winnerUid?: string | null;
  scores?: Record<string, number>;
  round?: number;
  maxRounds?: number;
  children: React.ReactNode;
}

export const GameRoomWrapper: React.FC<GameRoomWrapperProps> = ({
  room,
  currentUserUid,
  gameId,
  onReturnToLobby,
  onRematch,
  winnerUid,
  scores,
  round,
  maxRounds,
  children,
}) => {
  const gameDef = GAME_CATALOG.find((g) => g.id === gameId);
  const playersList = Object.values(room.players || {});
  const currentPlayer = room.players ? room.players[currentUserUid] : null;
  const partnerPlayer = playersList.find((p) => p.uid !== currentUserUid);

  const myScore = scores && currentUserUid ? scores[currentUserUid] || 0 : 0;
  const partnerScore = scores && partnerPlayer ? scores[partnerPlayer.uid] || 0 : 0;

  return (
    <div className="relative z-10 max-w-4xl mx-auto px-4 py-4 sm:py-6">
      {/* Game Header Bar */}
      <div className="glass-card rounded-2xl p-4 mb-5 border border-pink-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left: Back & Game Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playPop();
              onReturnToLobby();
            }}
            className="p-2 rounded-xl bg-pink-100/70 hover:bg-pink-200/80 text-purple-900 transition-colors cursor-pointer"
            title="Return to Game Lobby"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-bold text-base sm:text-lg text-purple-950">
                {gameDef?.title || 'Love Game'}
              </h2>
              {round !== undefined && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  Round {round}{maxRounds ? ` / ${maxRounds}` : ''}
                </span>
              )}
            </div>
            <p className="text-xs text-pink-600 font-medium">
              {gameDef?.subtitle}
            </p>
          </div>
        </div>

        {/* Center / Right: Live Scoreboard */}
        <div className="flex items-center gap-4 ml-auto">
          {scores && (
            <div className="flex items-center gap-2 bg-white/90 border border-pink-200 px-3 py-1.5 rounded-2xl shadow-2xs text-xs font-bold">
              <div className="flex items-center gap-1 text-pink-600">
                <span>{AVATAR_OPTIONS.find((a) => a.id === currentPlayer?.avatarId)?.emoji || '🐰'}</span>
                <span>{currentPlayer?.nickname || 'You'}: {myScore}</span>
              </div>
              <span className="text-purple-300">|</span>
              <div className="flex items-center gap-1 text-purple-700">
                <span>{AVATAR_OPTIONS.find((a) => a.id === partnerPlayer?.avatarId)?.emoji || '🌸'}</span>
                <span>{partnerPlayer?.nickname || 'Partner'}: {partnerScore}</span>
              </div>
            </div>
          )}

          {onRematch && (
            <button
              onClick={() => {
                sound.playPop();
                onRematch();
              }}
              className="p-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 transition-colors cursor-pointer"
              title="Reset / Rematch"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Game Surface */}
      <div className="glass-card rounded-3xl p-5 sm:p-8 border border-pink-200/80 shadow-md">
        {children}
      </div>
    </div>
  );
};
