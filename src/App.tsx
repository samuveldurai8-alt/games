import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, runTransaction } from 'firebase/firestore';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { 
  auth, 
  db, 
  signInWithGoogle, 
  signOutUser, 
  handleFirestoreError, 
  OperationType 
} from './firebase';
import { Room } from './types';
import { Header } from './components/Header';
import { SakuraBackground } from './components/SakuraBackground';
import { ChatDrawer } from './components/ChatDrawer';
import { WelcomeView } from './components/WelcomeView';
import { CreateRoomModal } from './components/CreateRoomModal';
import { JoinRoomModal } from './components/JoinRoomModal';
import { LobbyView } from './components/LobbyView';
import { GameRoomWrapper } from './components/GameRoomWrapper';
import { MemoriesView } from './components/MemoriesView';
import { getInitialGameState } from './utils/gameState';

// Games
import { TicTacToeGame } from './components/games/TicTacToeGame';
import { ConnectFourGame } from './components/games/ConnectFourGame';
import { RockPaperScissorsGame } from './components/games/RockPaperScissorsGame';
import { TruthOrDareGame } from './components/games/TruthOrDareGame';
import { ThisOrThatGame } from './components/games/ThisOrThatGame';
import { SwipeMatchGame } from './components/games/SwipeMatchGame';
import { HowWellDoYouKnowMeGame } from './components/games/HowWellDoYouKnowMeGame';
import { MindReaderGame } from './components/games/MindReaderGame';
import { MemoryMatchGame } from './components/games/MemoryMatchGame';
import { QuickTapRaceGame } from './components/games/QuickTapRaceGame';
import { WouldYouRatherGame } from './components/games/WouldYouRatherGame';
import { CoupleQuizGame } from './components/games/CoupleQuizGame';
import { EmojiDecoderGame } from './components/games/EmojiDecoderGame';
import { MysteryCardsGame } from './components/games/MysteryCardsGame';
import { CoupleQuestGame } from './components/games/CoupleQuestGame';
import { DreamDateBuilderGame } from './components/games/DreamDateBuilderGame';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [currentUserUid, setCurrentUserUid] = useState<string | null>(auth.currentUser?.uid || null);
  const [room, setRoom] = useState<Room | null>(null);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(() => localStorage.getItem('loveverse_active_room_id'));
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Modals & View States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCodeFromUrl, setInviteCodeFromUrl] = useState<string>('');
  const [activeView, setActiveView] = useState<'lobby' | 'game' | 'memories'>('lobby');
  const [petalsEnabled, setPetalsEnabled] = useState(true);

  // Listen to Authentication State changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setCurrentUserUid(user ? user.uid : null);
      setIsAuthReady(true);
      if (user && user.displayName && !localStorage.getItem('loveverse_nickname')) {
        localStorage.setItem('loveverse_nickname', user.displayName.split(' ')[0]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      setCurrentUser(user);
      setCurrentUserUid(user.uid);
      if (user.displayName && !localStorage.getItem('loveverse_nickname')) {
        localStorage.setItem('loveverse_nickname', user.displayName.split(' ')[0]);
      }
    } catch (err: any) {
      console.warn('Google sign-in popup closed or error:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setCurrentUser(null);
      setCurrentUserUid(null);
      setRoom(null);
      setActiveRoomId(null);
      localStorage.removeItem('loveverse_active_room_id');
      setActiveView('lobby');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Check URL query parameters for invite link (?room=CODE)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setInviteCodeFromUrl(roomParam.toUpperCase());
      setShowJoinModal(true);
    }
  }, []);

  // Real-time synchronization for active room
  useEffect(() => {
    if (!activeRoomId || !currentUserUid) return;

    const roomRef = doc(db, 'rooms', activeRoomId);
    const unsubscribe = onSnapshot(
      roomRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as Room;
          setRoom(data);
          // If activeGame is set in remote document, update view to game
          if (data.activeGame && activeView !== 'memories') {
            setActiveView('game');
          } else if (!data.activeGame && activeView === 'game') {
            setActiveView('lobby');
          }
        } else {
          // Room deleted or closed
          setRoom(null);
          setActiveRoomId(null);
          localStorage.removeItem('loveverse_active_room_id');
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `rooms/${activeRoomId}`);
      }
    );

    return () => unsubscribe();
  }, [activeRoomId, currentUserUid, activeView]);

  const handleRoomCreatedOrJoined = (roomId: string) => {
    setActiveRoomId(roomId);
    localStorage.setItem('loveverse_active_room_id', roomId);
    setShowCreateModal(false);
    setShowJoinModal(false);
    setActiveView('lobby');
  };

  const handleLeaveRoom = async () => {
    if (activeRoomId && currentUserUid) {
      try {
        localStorage.removeItem('loveverse_active_room_id');
        setRoom(null);
        setActiveRoomId(null);
        setActiveView('lobby');
      } catch {
        // ignore
      }
    }
  };

  const handleLaunchGame = async (gameId: string) => {
    if (!activeRoomId) return;
    try {
      const now = new Date().toISOString();
      const initialGameState = getInitialGameState(gameId, room?.hostUid || currentUserUid!);
      await updateDoc(doc(db, 'rooms', activeRoomId), {
        activeGame: gameId,
        gameState: initialGameState,
        updatedAt: now,
      });
      setActiveView('game');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${activeRoomId}`);
    }
  };

  const handleReturnToLobby = async () => {
    if (activeRoomId) {
      try {
        await updateDoc(doc(db, 'rooms', activeRoomId), {
          activeGame: null,
          gameState: null,
          updatedAt: new Date().toISOString(),
        });
      } catch {
        // ignore
      }
    }
    setActiveView('lobby');
  };

  const handleRematch = async () => {
    if (!activeRoomId || !room?.activeGame) return;
    try {
      const roomRef = doc(db, 'rooms', activeRoomId);
      await runTransaction(db, async (transaction) => {
        const roomDoc = await transaction.get(roomRef);
        if (!roomDoc.exists()) return;
        const data = roomDoc.data();
        const activeGame = data.activeGame;
        if (!activeGame) return;
        const currentGS = data.gameState || {};
        const existingScores = currentGS.scores || {};
        const nextRound = (currentGS.round || 1) + 1;
        const rematchState = getInitialGameState(
          activeGame,
          data.hostUid || room.hostUid,
          existingScores,
          nextRound
        );
        transaction.update(roomRef, {
          gameState: rematchState,
          updatedAt: new Date().toISOString(),
        });
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${activeRoomId}`);
    }
  };

  const currentPlayer = currentUserUid && room?.players ? room.players[currentUserUid] : null;

  return (
    <div className="relative min-h-screen bg-[#FFF8FC] text-plum flex flex-col selection:bg-pink-200">
      {/* Floating Sakura Petals Background */}
      <SakuraBackground enabled={petalsEnabled} />

      {/* Top Header */}
      <Header
        room={room}
        currentUser={currentUser}
        onGoogleSignIn={handleGoogleSignIn}
        onSignOut={handleSignOut}
        onLeaveRoom={handleLeaveRoom}
        onOpenMemories={() => setActiveView('memories')}
        petalsEnabled={petalsEnabled}
        onTogglePetals={() => setPetalsEnabled(!petalsEnabled)}
        activeView={activeView}
        onReturnToLobby={() => setActiveView('lobby')}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full pb-16">
        {!room ? (
          /* Welcome Landing Page */
          <WelcomeView
            currentUser={currentUser}
            onGoogleSignIn={handleGoogleSignIn}
            onCreateRoom={() => {
              if (!currentUserUid) {
                handleGoogleSignIn();
              } else {
                setShowCreateModal(true);
              }
            }}
            onJoinRoom={(presetCode) => {
              if (presetCode) setInviteCodeFromUrl(presetCode);
              if (!currentUserUid) {
                handleGoogleSignIn();
              } else {
                setShowJoinModal(true);
              }
            }}
            inviteCode={inviteCodeFromUrl}
          />
        ) : activeView === 'memories' ? (
          /* Memories & Match History View */
          <MemoriesView
            room={room}
            currentUserUid={currentUserUid!}
            onReturnToLobby={() => setActiveView('lobby')}
          />
        ) : room.activeGame ? (
          /* Active Game View */
          <GameRoomWrapper
            room={room}
            currentUserUid={currentUserUid!}
            gameId={room.activeGame}
            onReturnToLobby={handleReturnToLobby}
            onRematch={handleRematch}
            scores={room.gameState?.scores}
            round={room.gameState?.round}
          >
            {room.activeGame === 'tictactoe' && (
              <TicTacToeGame room={room} currentUserUid={currentUserUid!} onRematch={handleRematch} />
            )}
            {room.activeGame === 'connectfour' && (
              <ConnectFourGame room={room} currentUserUid={currentUserUid!} onRematch={handleRematch} />
            )}
            {room.activeGame === 'rps' && (
              <RockPaperScissorsGame room={room} currentUserUid={currentUserUid!} onRematch={handleRematch} />
            )}
            {room.activeGame === 'truthordare' && (
              <TruthOrDareGame room={room} currentUserUid={currentUserUid!} />
            )}
            {room.activeGame === 'thisorthat' && (
              <ThisOrThatGame room={room} currentUserUid={currentUserUid!} onRematch={handleRematch} />
            )}
            {room.activeGame === 'swipematch' && (
              <SwipeMatchGame room={room} currentUserUid={currentUserUid!} onRematch={handleRematch} />
            )}
            {room.activeGame === 'howwelldoyouknowme' && (
              <HowWellDoYouKnowMeGame room={room} currentUserUid={currentUserUid!} onRematch={handleRematch} />
            )}
            {room.activeGame === 'mindreader' && (
              <MindReaderGame room={room} currentUserUid={currentUserUid!} onRematch={handleRematch} />
            )}
            {room.activeGame === 'memorymatch' && (
              <MemoryMatchGame room={room} currentUserUid={currentUserUid!} onRematch={handleRematch} />
            )}
            {room.activeGame === 'quicktap' && (
              <QuickTapRaceGame room={room} currentUserUid={currentUserUid!} onRematch={handleRematch} />
            )}
            {room.activeGame === 'wouldyourather' && (
              <WouldYouRatherGame room={room} currentUserUid={currentUserUid!} onRematch={handleRematch} />
            )}
            {room.activeGame === 'couplequiz' && (
              <CoupleQuizGame room={room} currentUserUid={currentUserUid!} onRematch={handleRematch} />
            )}
            {room.activeGame === 'emojidecoder' && (
              <EmojiDecoderGame room={room} currentUserUid={currentUserUid!} onRematch={handleRematch} />
            )}
            {room.activeGame === 'mysterycards' && (
              <MysteryCardsGame room={room} currentUserUid={currentUserUid!} onRematch={handleRematch} />
            )}
            {room.activeGame === 'couplequest' && (
              <CoupleQuestGame room={room} currentUserUid={currentUserUid!} onRematch={handleRematch} />
            )}
            {room.activeGame === 'dreamdate' && (
              <DreamDateBuilderGame room={room} currentUserUid={currentUserUid!} onRematch={handleRematch} />
            )}
          </GameRoomWrapper>
        ) : (
          /* Lobby View */
          <LobbyView
            room={room}
            currentUserUid={currentUserUid!}
            onLaunchGame={handleLaunchGame}
          />
        )}
      </main>

      {/* Real-time Couple Room Chat Drawer */}
      {room && currentUserUid && (
        <ChatDrawer
          roomId={room.roomId}
          currentUserUid={currentUserUid}
          currentUserName={currentPlayer?.nickname || 'Love'}
        />
      )}

      {/* Create Room Modal */}
      {showCreateModal && currentUserUid && (
        <CreateRoomModal
          currentUserUid={currentUserUid}
          onClose={() => setShowCreateModal(false)}
          onRoomCreated={handleRoomCreatedOrJoined}
        />
      )}

      {/* Join Room Modal */}
      {showJoinModal && currentUserUid && (
        <JoinRoomModal
          currentUserUid={currentUserUid}
          initialCode={inviteCodeFromUrl}
          onClose={() => setShowJoinModal(false)}
          onRoomJoined={handleRoomCreatedOrJoined}
        />
      )}
    </div>
  );
}
