import React, { useMemo, useState } from 'react';
import { Search, Bell, User, ChevronDown, Menu, MessageCircle, Send, X, Minus } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

interface HeaderProps {
  pageTitle: string;
  adminName: string;
  onMenuClick: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ pageTitle, adminName, onMenuClick, onLogout }) => {
  const { user, chatConversations, assignChatToCurrentUser, markChatAsRead, sendChatReply } = useAppContext();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [chatSearch, setChatSearch] = useState('');
  const [openChatIds, setOpenChatIds] = useState<string[]>([]);
  const [minimizedChatIds, setMinimizedChatIds] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const notifications = [
    { id: 1, message: 'Pesanan baru masuk #ORD-2024-016', time: '2 menit lalu', unread: true },
    { id: 2, message: 'Stok Benih Jagung hampir habis', time: '10 menit lalu', unread: true },
    { id: 3, message: 'Pembayaran dikonfirmasi #ORD-2024-015', time: '1 jam lalu', unread: false },
    { id: 4, message: 'User baru terdaftar', time: '2 jam lalu', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;
  const visibleChats = useMemo(() => {
    return chatConversations
      .filter((conversation) =>
        user?.role === 'store_admin' && user.storeId ? conversation.storeId === user.storeId : true
      )
      .filter((conversation) => {
        const keyword = chatSearch.toLowerCase();
        if (!keyword) return true;

        return [
          conversation.customerName,
          conversation.customerEmail,
          conversation.topic,
          conversation.tags.join(' '),
        ].some((value) => value.toLowerCase().includes(keyword));
      })
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  }, [chatConversations, chatSearch, user]);
  const unreadChatCount = visibleChats.reduce((total, conversation) => total + conversation.unreadCount, 0);

  const formatTime = (value: string) =>
    new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));

  const openConversationWindow = (conversationId: string) => {
    setOpenChatIds((prev) => {
      const next = prev.includes(conversationId) ? prev : [...prev, conversationId];
      return next.slice(-3);
    });
    setMinimizedChatIds((prev) => prev.filter((id) => id !== conversationId));
    markChatAsRead(conversationId);
  };

  const closeConversationWindow = (conversationId: string) => {
    setOpenChatIds((prev) => prev.filter((id) => id !== conversationId));
    setMinimizedChatIds((prev) => prev.filter((id) => id !== conversationId));
  };

  const toggleMinimizeConversation = (conversationId: string) => {
    setMinimizedChatIds((prev) =>
      prev.includes(conversationId) ? prev.filter((id) => id !== conversationId) : [...prev, conversationId]
    );
  };

  const handleSendReply = (conversationId: string) => {
    const message = drafts[conversationId]?.trim();
    if (!message) return;

    assignChatToCurrentUser(conversationId);
    sendChatReply(conversationId, message);
    setDrafts((prev) => ({ ...prev, [conversationId]: '' }));
  };

  const openedConversations = openChatIds
    .map((id) => chatConversations.find((conversation) => conversation.id === id))
    .filter(Boolean);

  return (
    <>
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{pageTitle}</h1>
          <p className="text-sm text-gray-500">Selamat datang kembali, {adminName}!</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-4 py-2">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari..."
            className="bg-transparent border-none outline-none ml-2 w-48 text-sm"
          />
        </div>

        {/* Chat */}
        <div className="relative">
          <button
            onClick={() => {
              setShowChatPanel((prev) => !prev);
              setShowNotifications(false);
              setShowProfile(false);
            }}
            className="relative w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MessageCircle className="w-6 h-6 text-gray-600" />
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadChatCount}
              </span>
            )}
          </button>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
              setShowChatPanel(false);
            }}
            className="relative w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell className="w-6 h-6 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Notifikasi</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${
                      notif.unread ? 'bg-green-50' : ''
                    }`}
                  >
                    <p className="text-sm text-gray-700">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 text-center border-t border-gray-100">
                <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                  Lihat Semua Notifikasi
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
              setShowChatPanel(false);
            }}
            className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-700">{adminName}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-2">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                  Profil Saya
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                  Pengaturan
                </button>
                <hr className="my-2" />
                <button onClick={onLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                  Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
    {showChatPanel && (
      <>
        <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setShowChatPanel(false)} />
        <aside className="fixed right-0 top-0 h-screen w-full sm:w-[420px] lg:w-[460px] bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Pesan</h2>
              <p className="text-sm text-gray-500">Pilih percakapan untuk membuka jendela chat</p>
            </div>
            <button onClick={() => setShowChatPanel(false)} className="p-2 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="border-b border-gray-100 px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari percakapan..."
                value={chatSearch}
                onChange={(e) => setChatSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm border-none outline-none"
              />
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              {visibleChats.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => {
                    openConversationWindow(conversation.id);
                    setShowChatPanel(false);
                  }}
                  className="w-full text-left px-4 py-3 border-b border-gray-100 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-700 text-white flex items-center justify-center font-semibold shrink-0">
                      {conversation.customerAvatar}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{conversation.customerName}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {conversation.messages[conversation.messages.length - 1]?.content || conversation.topic}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        {conversation.unreadCount > 0 && (
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
                        )}
                        <span className="text-[11px] text-gray-400">{formatTime(conversation.lastMessageAt)}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              {visibleChats.length === 0 && (
                <div className="flex items-center justify-center h-full text-sm text-gray-500 p-6 text-center">
                  Belum ada percakapan yang cocok dengan pencarian.
                </div>
              )}
          </div>
        </aside>
      </>
    )}
    <div className="fixed right-6 bottom-6 z-50 flex items-end gap-3 pointer-events-none">
      {openedConversations.map((conversation) => {
        const minimized = minimizedChatIds.includes(conversation.id);

        return (
          <div
            key={conversation.id}
            className={`pointer-events-auto w-[320px] rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-900/10 overflow-hidden transition-all flex flex-col ${
              minimized ? 'h-16' : 'h-[460px]'
            }`}
          >
            <div className="px-4 py-3 bg-gradient-to-r from-green-700 to-green-600 text-white flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  toggleMinimizeConversation(conversation.id);
                  markChatAsRead(conversation.id);
                }}
                className="min-w-0 flex items-center gap-3 text-left"
              >
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-semibold shrink-0">
                  {conversation.customerAvatar}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold truncate">{conversation.customerName}</p>
                  <p className="text-[11px] text-green-100 truncate">{conversation.topic}</p>
                </div>
              </button>

              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => toggleMinimizeConversation(conversation.id)} className="p-1.5 rounded-lg hover:bg-white/10">
                  {minimized ? <ChevronDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                </button>
                <button onClick={() => closeConversationWindow(conversation.id)} className="p-1.5 rounded-lg hover:bg-white/10">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!minimized && (
              <>
                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-gray-50 px-3 py-3 space-y-3">
                  {conversation.messages.map((message) => {
                    const isCustomer = message.sender === 'customer';
                    const isSystem = message.sender === 'system';

                    if (isSystem) {
                      return (
                        <div key={message.id} className="flex justify-center">
                          <div className="px-3 py-1.5 rounded-full bg-slate-200 text-slate-500 text-[11px] font-medium">
                            {message.content}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={message.id} className={`flex ${isCustomer ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-3 py-2.5 ${isCustomer ? 'bg-white border border-gray-100 text-gray-700' : 'bg-green-600 text-white'}`}>
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <p className={`mt-1 text-[11px] ${isCustomer ? 'text-gray-400' : 'text-green-100'}`}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 border-t border-gray-100 bg-white">
                  <div className="flex items-end gap-2">
                    <textarea
                      value={drafts[conversation.id] ?? ''}
                      onChange={(e) => setDrafts((prev) => ({ ...prev, [conversation.id]: e.target.value }))}
                      rows={2}
                      placeholder="Balas pesan..."
                      className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-sm"
                    />
                    <button
                      onClick={() => handleSendReply(conversation.id)}
                      className="w-11 h-11 rounded-xl bg-green-600 hover:bg-green-700 text-white flex items-center justify-center shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
    </>
  );
};

export default Header;
