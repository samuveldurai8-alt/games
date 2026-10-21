import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { 
  ArrowLeft, 
  Trash2, 
  Sparkles, 
  Heart, 
  Trophy, 
  CalendarHeart, 
  BookHeart, 
  Star,
  Clock
} from 'lucide-react';
import { Room, GameRecord, SavedMemory } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { sound } from '../utils/sound';

interface MemoriesViewProps {
  room: Room;
  currentUserUid: string;
  onReturnToLobby: () => void;
}

export const MemoriesView: React.FC<MemoriesViewProps> = ({
  room,
  currentUserUid,
  onReturnToLobby,
}) => {
  const [history, setHistory] = useState<GameRecord[]>([]);
  const [memories, setMemories] = useState<SavedMemory[]>([]);
  const [activeTab, setActiveTab] = useState<'memories' | 'history'>('memories');

  const playersList = Object.values(room.players || {});
  const currentPlayer = room.players ? room.players[currentUserUid] : null;
  const partnerPlayer = playersList.find((p) => p.uid !== currentUserUid);

  // Subscribe to room match history
  useEffect(() => {
    if (!room.roomId) return;
    const historyRef = collection(db, 'rooms', room.roomId, 'history');
    const q = query(historyRef, orderBy('completedAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded: GameRecord[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          loaded.push({
            id: docSnap.id,
            gameId: data.gameId,
            gameTitle: data.gameTitle,
            winnerUid: data.winnerUid,
            scores: data.scores,
            summary: data.summary,
            completedAt: data.completedAt,
          });
        });
        setHistory(loaded);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `rooms/${room.roomId}/history`);
      }
    );

    return () => unsubscribe();
  }, [room.roomId]);

  // Subscribe to saved memories
  useEffect(() => {
    if (!room.roomId) return;
    const memoriesRef = collection(db, 'rooms', room.roomId, 'memories');
    const q = query(memoriesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded: SavedMemory[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          loaded.push({
            id: docSnap.id,
            type: data.type,
            title: data.title,
            content: data.content,
            creatorUid: data.creatorUid,
            createdAt: data.createdAt,
          });
        });
        setMemories(loaded);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `rooms/${room.roomId}/memories`);
      }
    );

    return () => unsubscribe();
  }, [room.roomId]);

  const handleDeleteMemory = async (memoryId: string) => {
    try {
      sound.playPop();
      await deleteDoc(doc(db, 'rooms', room.roomId, 'memories', memoryId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `rooms/${room.roomId}/memories/${memoryId}`);
    }
  };

  const myWins = history.filter((h) => h.winnerUid === currentUserUid).length;
  const partnerWins = partnerPlayer ? history.filter((h) => h.winnerUid === partnerPlayer.uid).length : 0;

  return (
    <div className="relative z-10 max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => {
            sound.playPop();
            onReturnToLobby();
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border border-pink-200 text-xs font-semibold text-purple-900 hover:bg-pink-50 transition-colors cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Lobby</span>
        </button>

        <h2 className="font-heading font-bold text-xl text-purple-950 flex items-center gap-2">
          <BookHeart className="w-5 h-5 text-pink-500" />
          <span>Our Love Timeline</span>
        </h2>

        <div className="w-24" /> {/* Spacer */}
      </div>

      {/* Summary Scorecard Pod */}
      <div className="glass-card rounded-3xl p-6 border border-pink-200/80 shadow-md">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-pink-50/80">
            <span className="text-2xl font-extrabold text-pink-600 block">{myWins}</span>
            <span className="text-xs font-semibold text-purple-900">{currentPlayer?.nickname || 'You'} Won</span>
          </div>

          <div className="p-3 rounded-2xl bg-purple-50/80 flex flex-col items-center justify-center">
            <span className="text-2xl font-extrabold text-purple-700 block">{history.length}</span>
            <span className="text-xs font-semibold text-purple-900">Total Games Played</span>
          </div>

          <div className="p-3 rounded-2xl bg-indigo-50/80">
            <span className="text-2xl font-extrabold text-indigo-600 block">{partnerWins}</span>
            <span className="text-xs font-semibold text-purple-900">{partnerPlayer?.nickname || 'Partner'} Won</span>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-pink-200 pb-2">
        <button
          onClick={() => {
            sound.playPop();
            setActiveTab('memories');
          }}
          className={`px-5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'memories'
              ? 'bg-purple-900 text-white shadow-xs'
              : 'bg-white text-purple-900/70 hover:bg-pink-50 border border-pink-200'
          }`}
        >
          Saved Memories ({memories.length})
        </button>

        <button
          onClick={() => {
            sound.playPop();
            setActiveTab('history');
          }}
          className={`px-5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-purple-900 text-white shadow-xs'
              : 'bg-white text-purple-900/70 hover:bg-pink-50 border border-pink-200'
          }`}
        >
          Match History ({history.length})
        </button>
      </div>

      {/* Content list */}
      {activeTab === 'memories' ? (
        <div className="space-y-4">
          {memories.length === 0 ? (
            <div className="p-12 text-center glass-card rounded-3xl border border-pink-200 text-purple-900/60">
              <CalendarHeart className="w-10 h-10 text-pink-400 mx-auto mb-2 opacity-60" />
              <p className="font-semibold text-sm">No memories saved yet!</p>
              <p className="text-xs mt-1">Play Dream Date Builder, Couple Quest, or Truth & Dare to save keepsakes.</p>
            </div>
          ) : (
            memories.map((mem) => (
              <div
                key={mem.id}
                className="glass-card rounded-3xl p-5 border border-pink-200/80 shadow-xs flex flex-col sm:flex-row items-start justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 uppercase">
                      {mem.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-purple-800/60">
                      {new Date(mem.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-base text-purple-950">
                    {mem.title}
                  </h3>

                  {mem.content && (
                    <div className="p-3 bg-pink-50/50 rounded-2xl text-xs text-purple-900 space-y-1">
                      {Object.entries(mem.content).map(([k, v]) => (
                        <div key={k} className="flex gap-2">
                          <span className="font-semibold capitalize text-purple-700">{k}:</span>
                          <span className="font-normal">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteMemory(mem.id)}
                  title="Delete memory"
                  className="p-2 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer self-end sm:self-auto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="p-12 text-center glass-card rounded-3xl border border-pink-200 text-purple-900/60">
              <Trophy className="w-10 h-10 text-pink-400 mx-auto mb-2 opacity-60" />
              <p className="font-semibold text-sm">No match records yet!</p>
              <p className="text-xs mt-1">Play games in the lobby to see your friendly rivalry timeline.</p>
            </div>
          ) : (
            history.map((rec) => {
              const isWinnerMe = rec.winnerUid === currentUserUid;
              const winnerName = rec.winnerUid ? room.players[rec.winnerUid]?.nickname || 'Player' : 'Tie';

              return (
                <div
                  key={rec.id}
                  className="glass-card rounded-2xl p-4 border border-pink-200/80 shadow-2xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                      isWinnerMe ? 'bg-pink-100 text-pink-600' : 'bg-purple-100 text-purple-600'
                    }`}>
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-purple-950">{rec.gameTitle}</h4>
                        <span className="text-[10px] text-purple-800/60">
                          {new Date(rec.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-purple-800/80 mt-0.5">{rec.summary}</p>
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    rec.winnerUid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {rec.winnerUid ? `${winnerName} Won` : 'Tie 💕'}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
