export interface Player {
  uid: string;
  nickname: string;
  avatarId: string;
  seatIndex: number; // 0 for host, 1 for guest
  isReady: boolean;
  lastSeenAt: string;
}

export type RoomStatus = 'waiting' | 'ready' | 'in_game' | 'closed';

export interface Room {
  roomId: string;
  roomCode: string;
  hostUid: string;
  status: RoomStatus;
  playerUids: string[];
  players: Record<string, Player>;
  activeGame: string | null;
  gameState: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
}

export interface ChatMessage {
  id: string;
  senderUid: string;
  senderName: string;
  text?: string;
  emoji?: string;
  createdAt: string;
}

export interface GameRecord {
  id: string;
  gameId: string;
  gameTitle: string;
  winnerUid?: string | null;
  scores?: Record<string, number>;
  summary: string;
  completedAt: string;
}

export interface SavedMemory {
  id: string;
  type: 'dream_date' | 'quiz_match' | 'adventure_story' | 'favorite_answer' | 'custom_moment';
  title: string;
  content: Record<string, any>;
  creatorUid: string;
  createdAt: string;
}

export type GameCategory = 
  | 'competitive'
  | 'truth_or_dare'
  | 'compatibility'
  | 'mystery'
  | 'memory_and_mind'
  | 'coop_adventure'
  | 'quick_challenge';

export interface GameDefinition {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: GameCategory;
  categoryName: string;
  iconName: string;
  estimatedMinutes: number;
  mode: 'turn_based' | 'simultaneous' | 'coop';
  badgeColor: string;
}

export interface AvatarOption {
  id: string;
  emoji: string;
  label: string;
  bgGradient: string;
}
