import React from 'react';
import { doc, updateDoc, addDoc, collection, runTransaction } from 'firebase/firestore';
import { Sparkles, Heart, RotateCcw, Trophy } from 'lucide-react';
import { Room } from '../../types';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { sound } from '../../utils/sound';
import { fireVictoryFanfare } from '../../utils/confetti';

interface TicTacToeProps {
  room: Room;
  currentUserUid: string;
  onRematch?: () => void;
}

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6]             // diagonals
];

export const TicTacToeGame: React.FC<TicTacToeProps> = ({ room, currentUserUid, onRematch }) => {
  const gameState = room.gameState || {};
  const board: (string | null)[] = gameState.board || Array(9).fill(null);
  const currentTurnUid: string = gameState.currentTurnUid || room.hostUid;
  const scores: Record<string, number> = gameState.scores || {};
  const winnerUid: string | 'draw' | null = gameState.winnerUid || null;
  const winningLine: number[] | null = gameState.winningLine || null;
  const round: number = gameState.round || 1;

  const playersList = Object.values(room.players || {});
  const partnerPlayer = playersList.find((p) => p.uid !== currentUserUid);
  const isMyTurn = currentTurnUid === currentUserUid && !winnerUid;

  const initGame = async (resetScores: boolean = false) => {
    if (onRematch && !resetScores) {
      onRematch();
      return;
    }
    try {
      const now = new Date().toISOString();
      const initialScores = resetScores
        ? playersList.reduce((acc, p) => ({ ...acc, [p.uid]: 0 }), {})
        : (gameState.scores || playersList.reduce((acc, p) => ({ ...acc, [p.uid]: 0 }), {}));

      await updateDoc(doc(db, 'rooms', room.roomId), {
        gameState: {
          board: Array(9).fill(null),
          currentTurnUid: room.hostUid,
          scores: initialScores,
          winnerUid: null,
          winningLine: null,
          round: resetScores ? 1 : round + 1,
        },
        updatedAt: now,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.roomId}`);
    }
  };

  const handleCellClick = async (index: number) => {
    if (!isMyTurn || board[index] !== null || winnerUid) {
      return;
    }

    try {
      let winResult: string | null = null;
      let nextScoresSnapshot: Record<string, number> = {};

      await runTransaction(db, async (transaction) => {
        const roomRef = doc(db, 'rooms', room.roomId);
        const roomSnap = await transaction.get(roomRef);
        if (!roomSnap.exists()) return;

        const data = roomSnap.data();
        const gState = data.gameState || {};
        const curBoard: (string | null)[] = gState.board || Array(9).fill(null);
        const curTurn: string = gState.currentTurnUid || room.hostUid;
        const curWinner: string | null = gState.winnerUid || null;

        // Atomic validation to prevent race conditions or duplicate clicks
        if (curTurn !== currentUserUid || curBoard[index] !== null || curWinner) {
          return;
        }

        const isHost = room.hostUid === currentUserUid;
        const symbol = isHost ? 'X' : 'O';
        const nextBoard = [...curBoard];
        nextBoard[index] = symbol;

        let win: string | null = null;
        let line: number[] | null = null;

        for (const combo of WINNING_COMBOS) {
          const [a, b, c] = combo;
          if (nextBoard[a] && nextBoard[a] === nextBoard[b] && nextBoard[a] === nextBoard[c]) {
            win = currentUserUid;
            line = combo;
            break;
          }
        }

        const isDraw = !win && nextBoard.every((cell) => cell !== null);
        const nextScores = { ...(gState.scores || {}) };

        if (win) {
          winResult = win;
          nextScores[win] = (nextScores[win] || 0) + 1;
          nextScoresSnapshot = nextScores;
        }

        const pList = Object.values(data.players || {});
        const pPartner = pList.find((p: any) => p.uid !== currentUserUid);
        const nextTurnUid = pPartner ? (pPartner as any).uid : currentUserUid;
        const now = new Date().toISOString();

        transaction.update(roomRef, {
          'gameState.board': nextBoard,
          'gameState.currentTurnUid': win || isDraw ? curTurn : nextTurnUid,
          'gameState.scores': nextScores,
          'gameState.winnerUid': win ? win : isDraw ? 'draw' : null,
          'gameState.winningLine': line,
          'gameState.round': gState.round || 1,
          updatedAt: now,
        });
      });

      if (winResult) {
        sound.playSuccess();
        fireVictoryFanfare();
        addDoc(collection(db, 'rooms', room.roomId, 'history'), {
          gameId: 'tictactoe',
          gameTitle: 'Tic-Tac-Toe',
          winnerUid: winResult,
          scores: nextScoresSnapshot,
          summary: `${room.players[winResult]?.nickname || 'Player'} won Round ${round}!`,
          completedAt: new Date().toISOString(),
        }).catch(() => {});
      } else {
        sound.playPop();
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.roomId}`);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-md mx-auto">
      {/* Turn & Status Message */}
      <div className="mb-6 text-center">
        {winnerUid ? (
          winnerUid === 'draw' ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-sm font-bold">
              <span>It's a Sweet Tie! Both Hearts Win 💕</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-sm font-bold animate-bounce">
              <Trophy className="w-4 h-4 text-emerald-600" />
              <span>{winnerUid === currentUserUid ? 'You Won This Round! 🎉' : `${room.players[winnerUid]?.nickname || 'Partner'} Won! 🌸`}</span>
            </div>
          )
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100/80 text-purple-900 text-xs font-semibold">
            {isMyTurn ? (
              <span className="flex items-center gap-1.5 text-pink-600 font-bold">
                <Heart className="w-3.5 h-3.5 fill-pink-600 animate-pulse" /> Your Turn ({room.hostUid === currentUserUid ? '❤️ Hearts' : '✨ Sparkles'})
              </span>
            ) : (
              <span className="text-purple-700">
                Waiting for {partnerPlayer?.nickname || 'partner'} to play...
              </span>
            )}
          </div>
        )}
      </div>

      {/* 3x3 Grid */}
      <div className="grid grid-cols-3 gap-3 w-72 h-72 sm:w-84 sm:h-84 p-3 bg-pink-100/60 rounded-3xl border-2 border-pink-200/80 shadow-inner">
        {board.map((cell, idx) => {
          const isWinningCell = winningLine?.includes(idx);
          return (
            <button
              key={idx}
              onClick={() => handleCellClick(idx)}
              disabled={!isMyTurn || cell !== null || !!winnerUid}
              className={`rounded-2xl flex items-center justify-center text-4xl sm:text-5xl font-bold transition-all select-none cursor-pointer ${
                cell === null
                  ? isMyTurn
                    ? 'bg-white hover:bg-pink-50 shadow-xs hover:scale-102 active:scale-98 border border-pink-200'
                    : 'bg-white/80 cursor-not-allowed border border-pink-100'
                  : isWinningCell
                  ? 'bg-gradient-to-tr from-pink-400 to-rose-400 text-white shadow-md animate-pulse'
                  : cell === 'X'
                  ? 'bg-pink-50 text-rose-500 shadow-2xs border border-pink-200'
                  : 'bg-purple-50 text-purple-600 shadow-2xs border border-purple-200'
              }`}
            >
              {cell === 'X' ? '❤️' : cell === 'O' ? '✨' : ''}
            </button>
          );
        })}
      </div>

      {/* Rematch & Next Round Controls */}
      {winnerUid && (
        <div className="mt-6 flex items-center gap-3 animate-fade-in">
          <button
            onClick={() => initGame(false)}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 text-white text-xs font-bold shadow-md hover:opacity-95 transition-opacity flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Next Round</span>
          </button>
          <button
            onClick={() => initGame(true)}
            className="px-4 py-2.5 rounded-2xl border border-pink-300 text-purple-900 text-xs font-semibold hover:bg-pink-50 transition-colors cursor-pointer"
          >
            Reset Scores
          </button>
        </div>
      )}
    </div>
  );
};
