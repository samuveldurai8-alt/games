import React, { useEffect } from 'react';
import { doc, updateDoc, addDoc, collection, runTransaction } from 'firebase/firestore';
import { Sparkles, Heart, RotateCcw, Trophy, ArrowDown } from 'lucide-react';
import { Room } from '../../types';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { sound } from '../../utils/sound';
import { fireVictoryFanfare } from '../../utils/confetti';

interface ConnectFourProps {
  room: Room;
  currentUserUid: string;
  onRematch?: () => void;
}

const ROWS = 6;
const COLS = 7;

function checkWin(board: (string | null)[][], row: number, col: number, symbol: string): boolean {
  const directions = [
    [0, 1],   // horizontal
    [1, 0],   // vertical
    [1, 1],   // diagonal down-right
    [1, -1],  // diagonal up-right
  ];

  for (const [dr, dc] of directions) {
    let count = 1;

    // Check forward
    let r = row + dr;
    let c = col + dc;
    while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === symbol) {
      count++;
      r += dr;
      c += dc;
    }

    // Check backward
    r = row - dr;
    c = col - dc;
    while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === symbol) {
      count++;
      r -= dr;
      c -= dc;
    }

    if (count >= 4) return true;
  }
  return false;
}

export const ConnectFourGame: React.FC<ConnectFourProps> = ({ room, currentUserUid, onRematch }) => {
  const gameState = room.gameState || {};
  const grid: (string | null)[][] = gameState.grid || Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
  const currentTurnUid: string = gameState.currentTurnUid || room.hostUid;
  const scores: Record<string, number> = gameState.scores || {};
  const winnerUid: string | 'draw' | null = gameState.winnerUid || null;
  const round: number = gameState.round || 1;

  const playersList = Object.values(room.players || {});
  const partnerPlayer = playersList.find((p) => p.uid !== currentUserUid);
  const isMyTurn = currentTurnUid === currentUserUid && !winnerUid;

  useEffect(() => {
    if (!room.gameState || !room.gameState.grid) {
      if (room.hostUid === currentUserUid) {
        initGame();
      }
    }
  }, [room.gameState, room.hostUid, currentUserUid]);

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
          grid: Array(ROWS).fill(null).map(() => Array(COLS).fill(null)),
          currentTurnUid: room.hostUid,
          scores: initialScores,
          winnerUid: null,
          round: resetScores ? 1 : round + 1,
        },
        updatedAt: now,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.roomId}`);
    }
  };

  const handleDropDisc = async (colIndex: number) => {
    if (!isMyTurn || winnerUid) return;

    const roomRef = doc(db, 'rooms', room.roomId);
    try {
      let outcome = 'none';

      await runTransaction(db, async (transaction) => {
        const freshSnap = await transaction.get(roomRef);
        if (!freshSnap.exists()) return;
        const freshData = freshSnap.data() as Room;
        const currentGS = freshData.gameState || {};

        if (currentGS.winnerUid) return;
        if (currentGS.currentTurnUid !== currentUserUid) return;

        const currentGrid: (string | null)[][] = currentGS.grid || Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
        let targetRow = -1;
        for (let r = ROWS - 1; r >= 0; r--) {
          if (currentGrid[r][colIndex] === null) {
            targetRow = r;
            break;
          }
        }
        if (targetRow === -1) return; // Column full

        const isHost = freshData.hostUid === currentUserUid;
        const symbol = isHost ? 'R' : 'P';
        const nextGrid = currentGrid.map((row) => [...row]);
        nextGrid[targetRow][colIndex] = symbol;

        const hasWon = checkWin(nextGrid, targetRow, colIndex, symbol);
        const isDraw = !hasWon && nextGrid[0].every((cell) => cell !== null);
        const currentScores = { ...(currentGS.scores || {}) };
        const currentRound = currentGS.round || 1;

        if (hasWon) {
          outcome = 'win';
          currentScores[currentUserUid] = (currentScores[currentUserUid] || 0) + 1;
        } else if (isDraw) {
          outcome = 'draw';
        }

        const pList = Object.values(freshData.players || {});
        const partner = pList.find((p) => p.uid !== currentUserUid);
        const nextTurnUid = partner ? partner.uid : currentUserUid;
        const now = new Date().toISOString();

        transaction.update(roomRef, {
          gameState: {
            grid: nextGrid,
            currentTurnUid: hasWon || isDraw ? currentUserUid : nextTurnUid,
            scores: currentScores,
            winnerUid: hasWon ? currentUserUid : isDraw ? 'draw' : null,
            round: currentRound,
          },
          updatedAt: now,
        });
      });

      if (outcome === 'win') {
        sound.playSuccess();
        fireVictoryFanfare();
        addDoc(collection(db, 'rooms', room.roomId, 'history'), {
          gameId: 'connectfour',
          gameTitle: 'Connect Four',
          winnerUid: currentUserUid,
          scores: { ...scores, [currentUserUid]: (scores[currentUserUid] || 0) + 1 },
          summary: `${room.players[currentUserUid]?.nickname || 'Player'} connected four discs in Round ${round}!`,
          completedAt: new Date().toISOString(),
        }).catch(() => {});
      } else if (outcome === 'draw') {
        sound.playDing();
      } else {
        sound.playPop();
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${room.roomId}`);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto">
      {/* Turn indicator */}
      <div className="mb-4 text-center">
        {winnerUid ? (
          winnerUid === 'draw' ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-sm font-bold">
              <span>Board Full! It's a Tie 💕</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-sm font-bold animate-bounce">
              <Trophy className="w-4 h-4 text-emerald-600" />
              <span>{winnerUid === currentUserUid ? 'You Connected Four! 🎉' : `${room.players[winnerUid]?.nickname || 'Partner'} Won! 🌸`}</span>
            </div>
          )
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100/80 text-purple-900 text-xs font-semibold">
            {isMyTurn ? (
              <span className="flex items-center gap-1.5 text-pink-600 font-bold">
                <Heart className="w-3.5 h-3.5 fill-pink-600 animate-pulse" /> Your Turn ({room.hostUid === currentUserUid ? '🔴 Rose Token' : '🟣 Lavender Token'})
              </span>
            ) : (
              <span className="text-purple-700">
                Waiting for {partnerPlayer?.nickname || 'partner'} to drop a disc...
              </span>
            )}
          </div>
        )}
      </div>

      {/* Drop Buttons for each column */}
      <div className="grid grid-cols-7 gap-2 w-full max-w-sm mb-2 px-2">
        {Array.from({ length: COLS }).map((_, col) => {
          const colFull = grid[0][col] !== null;
          return (
            <button
              key={col}
              onClick={() => handleDropDisc(col)}
              disabled={!isMyTurn || colFull || !!winnerUid}
              className={`py-1.5 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                isMyTurn && !colFull && !winnerUid
                  ? 'bg-pink-200/80 hover:bg-pink-300 text-purple-900 hover:scale-105 active:scale-95 shadow-2xs'
                  : 'bg-transparent text-transparent cursor-not-allowed'
              }`}
              title={`Drop in column ${col + 1}`}
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          );
        })}
      </div>

      {/* Connect Four Grid */}
      <div className="w-full max-w-sm p-3.5 bg-gradient-to-b from-purple-800 to-indigo-900 rounded-3xl shadow-xl border-4 border-purple-950/40">
        <div className="grid grid-cols-7 gap-2">
          {grid.map((row, rIdx) =>
            row.map((cell, cIdx) => (
              <div
                key={`${rIdx}-${cIdx}`}
                onClick={() => handleDropDisc(cIdx)}
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shadow-inner cursor-pointer transition-transform ${
                  cell === null
                    ? 'bg-purple-950/70 border border-purple-800 hover:bg-purple-900/60'
                    : cell === 'R'
                    ? 'bg-gradient-to-tr from-rose-500 to-pink-400 border-2 border-rose-300 shadow-md scale-95'
                    : 'bg-gradient-to-tr from-indigo-400 to-purple-300 border-2 border-indigo-200 shadow-md scale-95'
                }`}
              >
                {cell === 'R' ? '❤️' : cell === 'P' ? '💜' : ''}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Rematch & Controls */}
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
