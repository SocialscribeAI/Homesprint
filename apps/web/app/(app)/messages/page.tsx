'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MessageSquare,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Info,
  Check,
  CheckCheck,
  Clock,
  ArrowLeft,
  Image as ImageIcon,
  Smile,
} from 'lucide-react';
import clsx from 'clsx';

// Mock data
const mockThreads = [
  {
    id: '1',
    participant: {
      id: 'user1',
      name: 'Sarah Cohen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      online: true,
    },
    listing: {
      id: 'listing1',
      title: 'Sunny room in Nachlaot',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=100&h=100&fit=crop',
    },
    lastMessage: {
      text: 'Great! I can show you the place tomorrow at 2 PM. Does that work for you?',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      isOwn: false,
      read: false,
    },
    unreadCount: 2,
  },
  {
    id: '2',
    participant: {
      id: 'user2',
      name: 'David Levy',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      online: false,
    },
    listing: {
      id: 'listing2',
      title: 'Modern studio in Baka',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=100&h=100&fit=crop',
    },
    lastMessage: {
      text: 'Thanks for your interest! Let me know if you have any questions.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isOwn: false,
      read: true,
    },
    unreadCount: 0,
  },
  {
    id: '3',
    participant: {
      id: 'user3',
      name: 'Rachel Green',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      online: true,
    },
    listing: {
      id: 'listing3',
      title: 'Cozy apartment in Katamon',
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100&h=100&fit=crop',
    },
    lastMessage: {
      text: 'I sent you the lease agreement. Please review and let me know!',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isOwn: false,
      read: true,
    },
    unreadCount: 0,
  },
];

const mockMessages = [
  {
    id: '1',
    senderId: 'user1',
    text: 'Hi! I saw your listing for the room in Nachlaot. Is it still available?',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: '2',
    senderId: 'me',
    text: 'Yes, it is! Would you like to schedule a viewing?',
    timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: '3',
    senderId: 'user1',
    text: 'That would be great! When are you available?',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: '4',
    senderId: 'me',
    text: 'I\'m free tomorrow afternoon or Wednesday morning. What works better for you?',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: true,
  },
  {
    id: '5',
    senderId: 'user1',
    text: 'Great! I can show you the place tomorrow at 2 PM. Does that work for you?',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
  },
];

export default function MessagesPage() {
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);

  const filteredThreads = mockThreads.filter(
    (thread) =>
      thread.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.listing.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentThread = mockThreads.find((t) => t.id === selectedThread);

  const handleSelectThread = (threadId: string) => {
    setSelectedThread(threadId);
    setShowMobileChat(true);
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    // In production, send to API
    console.log('Sending:', messageText);
    setMessageText('');
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex-1 flex bg-white rounded-3xl shadow-float overflow-hidden">
        {/* Thread List */}
        <div
          className={clsx(
            'w-full lg:w-80 xl:w-96 border-r border-sandstone flex flex-col',
            showMobileChat ? 'hidden lg:flex' : 'flex'
          )}
        >
          {/* Header */}
          <div className="p-4 border-b border-sandstone">
            <h1 className="text-xl font-bold text-midnight mb-4">Messages</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-midnight/40" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-sandstone/50 rounded-xl border-0 focus:ring-2 focus:ring-mint text-sm"
              />
            </div>
          </div>

          {/* Thread List */}
          <div className="flex-1 overflow-y-auto">
            {filteredThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-sandstone flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-midnight/30" />
                </div>
                <p className="text-midnight/60">No conversations yet</p>
              </div>
            ) : (
              filteredThreads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => handleSelectThread(thread.id)}
                  className={clsx(
                    'w-full p-4 flex items-start gap-3 hover:bg-sandstone/50 transition-colors text-left',
                    selectedThread === thread.id && 'bg-sandstone/50'
                  )}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={thread.participant.avatar}
                      alt={thread.participant.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {thread.participant.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-mint rounded-full border-2 border-white" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-midnight truncate">
                        {thread.participant.name}
                      </p>
                      <span className="text-xs text-midnight/40 flex-shrink-0">
                        {formatTime(thread.lastMessage.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-midnight/50 truncate mb-1">
                      {thread.listing.title}
                    </p>
                    <p
                      className={clsx(
                        'text-sm truncate',
                        thread.unreadCount > 0 ? 'text-midnight font-medium' : 'text-midnight/60'
                      )}
                    >
                      {thread.lastMessage.isOwn && 'You: '}
                      {thread.lastMessage.text}
                    </p>
                  </div>

                  {/* Unread Badge */}
                  {thread.unreadCount > 0 && (
                    <span className="flex-shrink-0 w-5 h-5 bg-mint text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {thread.unreadCount}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div
          className={clsx(
            'flex-1 flex flex-col',
            !showMobileChat && !selectedThread ? 'hidden lg:flex' : 'flex'
          )}
        >
          {currentThread ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-sandstone flex items-center gap-4">
                <button
                  onClick={() => setShowMobileChat(false)}
                  className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-sandstone transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-midnight" />
                </button>

                <img
                  src={currentThread.participant.avatar}
                  alt={currentThread.participant.name}
                  className="w-10 h-10 rounded-full object-cover"
                />

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-midnight">{currentThread.participant.name}</p>
                  <p className="text-xs text-midnight/50 truncate">
                    {currentThread.listing.title}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-sandstone transition-colors text-midnight/60 hover:text-midnight">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-sandstone transition-colors text-midnight/60 hover:text-midnight">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-sandstone transition-colors text-midnight/60 hover:text-midnight">
                    <Info className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Listing Preview */}
                <Link
                  href={`/listing/${currentThread.listing.id}`}
                  className="flex items-center gap-3 p-3 bg-sandstone/50 rounded-xl mx-auto max-w-sm hover:bg-sandstone transition-colors"
                >
                  <img
                    src={currentThread.listing.image}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-midnight truncate">
                      {currentThread.listing.title}
                    </p>
                    <p className="text-xs text-mint">View listing →</p>
                  </div>
                </Link>

                {/* Messages */}
                {mockMessages.map((message) => {
                  const isOwn = message.senderId === 'me';
                  return (
                    <div
                      key={message.id}
                      className={clsx('flex', isOwn ? 'justify-end' : 'justify-start')}
                    >
                      <div
                        className={clsx(
                          'max-w-[75%] px-4 py-3 rounded-2xl',
                          isOwn
                            ? 'bg-mint text-white rounded-br-md'
                            : 'bg-sandstone text-midnight rounded-bl-md'
                        )}
                      >
                        <p className="text-sm">{message.text}</p>
                        <div
                          className={clsx(
                            'flex items-center gap-1 mt-1',
                            isOwn ? 'justify-end' : 'justify-start'
                          )}
                        >
                          <span
                            className={clsx(
                              'text-xs',
                              isOwn ? 'text-white/70' : 'text-midnight/40'
                            )}
                          >
                            {message.timestamp.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                          {isOwn && (
                            message.read ? (
                              <CheckCheck className="w-3.5 h-3.5 text-white/70" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-white/70" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-sandstone">
                <div className="flex items-end gap-2">
                  <div className="flex-1 bg-sandstone/50 rounded-2xl p-2">
                    <textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      rows={1}
                      className="w-full bg-transparent border-0 focus:ring-0 resize-none text-sm px-2 py-1 placeholder:text-midnight/40"
                    />
                    <div className="flex items-center gap-1 px-2">
                      <button className="p-1.5 rounded-lg hover:bg-sandstone transition-colors text-midnight/40 hover:text-midnight">
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-sandstone transition-colors text-midnight/40 hover:text-midnight">
                        <ImageIcon className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-sandstone transition-colors text-midnight/40 hover:text-midnight">
                        <Smile className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    className={clsx(
                      'p-3 rounded-xl transition-all',
                      messageText.trim()
                        ? 'bg-mint text-white hover:bg-mint/90'
                        : 'bg-sandstone text-midnight/30'
                    )}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-sandstone flex items-center justify-center mb-4">
                <MessageSquare className="w-10 h-10 text-midnight/30" />
              </div>
              <h3 className="text-lg font-bold text-midnight mb-2">Your Messages</h3>
              <p className="text-midnight/60 max-w-sm">
                Select a conversation to start chatting, or apply for a listing to start a new
                conversation with the owner.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
