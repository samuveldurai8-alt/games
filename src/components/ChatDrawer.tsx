import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot 
} from 'firebase/firestore';
import { MessageCircleHeart, X, Send, Sparkles } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { ChatMessage } from '../types';
import { sound } from '../utils/sound';

interface ChatDrawerProps {
  roomId: string;
  currentUserUid: string;
  currentUserName: string;
}

const QUICK_EMOJIS = ['💕', '🌸', '✨', '💋', '🥂', '💍', '🥺', '🔥', '🧸', '🍫'];

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  roomId,
  currentUserUid,
  currentUserName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    isOpenRef.current = isOpen;
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  // Subscribe to real-time chat messages
  useEffect(() => {
    if (!roomId) return;
    const chatRef = collection(db, 'rooms', roomId, 'chat');
    const q = query(chatRef, orderBy('createdAt', 'asc'), limit(60));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded: ChatMessage[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          loaded.push({
            id: docSnap.id,
            senderUid: data.senderUid,
            senderName: data.senderName,
            text: data.text || '',
            emoji: data.emoji || '',
            createdAt: data.createdAt,
          });
        });

        // If new message arrived from partner and drawer is closed, increment unread & play chime
        if (loaded.length > messages.length && loaded.length > 0) {
          const lastMsg = loaded[loaded.length - 1];
          if (lastMsg.senderUid !== currentUserUid) {
            sound.playDing();
            if (!isOpenRef.current) {
              setUnreadCount((prev) => prev + 1);
            }
          }
        }

        setMessages(loaded);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `rooms/${roomId}/chat`);
      }
    );

    return () => unsubscribe();
  }, [roomId, currentUserUid]);

  const handleSendMessage = async (textToSend?: string, emojiToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : inputText).trim();
    const emoji = emojiToSend || '';

    if (!text && !emoji) return;

    try {
      sound.playPop();
      setInputText('');
      const chatRef = collection(db, 'rooms', roomId, 'chat');
      await addDoc(chatRef, {
        senderUid: currentUserUid,
        senderName: currentUserName,
        text: text.slice(0, 500),
        emoji: emoji,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `rooms/${roomId}/chat`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating launcher button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open Love Chat"
        className="fixed bottom-5 right-5 z-40 flex items-center justify-center w-13 h-13 rounded-full bg-gradient-to-tr from-pink-500 via-rose-400 to-purple-500 text-white shadow-xl shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
      >
        <MessageCircleHeart className="w-6 h-6 animate-heart-float" />
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[11px] font-bold shadow-md animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Slide-in Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-40 w-[92vw] sm:w-96 max-h-[520px] h-[75vh] flex flex-col bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-pink-200 overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-pink-100 via-purple-100 to-rose-100 border-b border-pink-200/80">
            <div className="flex items-center gap-2">
              <span className="text-xl">💌</span>
              <div>
                <h4 className="font-heading font-bold text-sm text-purple-950">Room Whisper</h4>
                <p className="text-[11px] text-purple-700/70">Private messages just for you two</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/60 text-purple-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Reaction Sparks */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-pink-50/70 border-b border-pink-100/60 overflow-x-auto no-scrollbar">
            <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleSendMessage('', emoji)}
                className="text-lg hover:scale-125 active:scale-95 transition-transform p-0.5 cursor-pointer"
                title={`Send ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-purple-800/50 p-4">
                <span className="text-3xl mb-1">🌸</span>
                <p className="text-xs">No whispers yet. Send a cute message or react with an emoji!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderUid === currentUserUid;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-purple-800/60 mb-0.5 px-1">
                      {isMe ? 'You' : msg.senderName}
                    </span>
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs shadow-2xs ${
                        isMe
                          ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white rounded-tr-xs'
                          : 'bg-purple-100 text-purple-950 rounded-tl-xs border border-purple-200/60'
                      }`}
                    >
                      {msg.emoji && (
                        <div className="text-2xl mb-1">{msg.emoji}</div>
                      )}
                      {msg.text && (
                        <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input field */}
          <div className="p-2.5 bg-white border-t border-pink-100 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Whisper something sweet..."
              maxLength={500}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-pink-50/60 border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-purple-950 placeholder-purple-400"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim()}
              className="p-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 text-white disabled:opacity-40 hover:opacity-95 transition-opacity cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
