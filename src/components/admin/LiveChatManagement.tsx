import React, { useMemo, useState } from 'react';
import {
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Filter,
  MessageSquare,
  PhoneCall,
  Search,
  Send,
  Store,
  Zap,
} from 'lucide-react';
import { ChatConversation } from '@/data/adminData';
import { useAppContext } from '@/contexts/AppContext';
import { isStoreScopedRole } from '@/lib/rbac';

const filterOptions = [
  { id: 'all', label: 'Semua' },
  { id: 'waiting', label: 'Menunggu' },
  { id: 'active', label: 'Aktif' },
  { id: 'resolved', label: 'Selesai' },
  { id: 'mine', label: 'Tugas Saya' },
] as const;

type FilterOption = (typeof filterOptions)[number]['id'];

const formatTime = (value: string) =>
  new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

const formatFullTime = (value: string) =>
  new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

const LiveChatManagement: React.FC = () => {
  const {
    user,
    chatConversations,
    assignChatToCurrentUser,
    resolveChat,
    sendChatReply,
    markChatAsRead,
  } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [selectedConversationId, setSelectedConversationId] = useState<string>(chatConversations[0]?.id ?? '');
  const [reply, setReply] = useState('');

  const visibleConversations = useMemo(() => {
    const normalizedKeyword = searchTerm.toLowerCase();

    return chatConversations
      .filter((conversation) => {
        if (isStoreScopedRole(user?.role) && user?.storeId && conversation.storeId !== user.storeId) {
          return false;
        }

        if (activeFilter === 'mine') {
          return conversation.assignedAdmin === user?.name;
        }

        if (activeFilter !== 'all' && activeFilter !== conversation.status) {
          return false;
        }

        if (!normalizedKeyword) return true;

        return [
          conversation.customerName,
          conversation.customerEmail,
          conversation.topic,
          conversation.linkedOrderId,
          conversation.tags.join(' '),
        ]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedKeyword));
      })
      .sort((a, b) => {
        const statusRank = { waiting: 0, active: 1, resolved: 2 };
        const priorityRank = { high: 0, medium: 1, low: 2 };

        if (statusRank[a.status] !== statusRank[b.status]) {
          return statusRank[a.status] - statusRank[b.status];
        }

        if (priorityRank[a.priority] !== priorityRank[b.priority]) {
          return priorityRank[a.priority] - priorityRank[b.priority];
        }

        return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
      });
  }, [activeFilter, chatConversations, searchTerm, user]);

  const selectedConversation =
    visibleConversations.find((conversation) => conversation.id === selectedConversationId) ??
    visibleConversations[0] ??
    null;

  const stats = useMemo(() => {
    const available = chatConversations.filter((conversation) =>
      isStoreScopedRole(user?.role) && user?.storeId ? conversation.storeId === user.storeId : true
    );

    return [
      {
        label: 'Antrean Menunggu',
        value: available.filter((conversation) => conversation.status === 'waiting').length,
        icon: Clock3,
        tone: 'bg-amber-50 text-amber-700 border-amber-100',
      },
      {
        label: 'Chat Aktif',
        value: available.filter((conversation) => conversation.status === 'active').length,
        icon: MessageSquare,
        tone: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      },
      {
        label: 'Prioritas Tinggi',
        value: available.filter((conversation) => conversation.priority === 'high' && conversation.status !== 'resolved').length,
        icon: Zap,
        tone: 'bg-rose-50 text-rose-700 border-rose-100',
      },
      {
        label: 'Ditangani Saya',
        value: available.filter((conversation) => conversation.assignedAdmin === user?.name).length,
        icon: BadgeCheck,
        tone: 'bg-sky-50 text-sky-700 border-sky-100',
      },
    ];
  }, [chatConversations, user]);

  const handleAssignToMe = () => {
    if (!selectedConversation || !user) return;
    assignChatToCurrentUser(selectedConversation.id);
  };

  const handleResolve = () => {
    if (!selectedConversation) return;
    resolveChat(selectedConversation.id);
  };

  const handleSendReply = () => {
    if (!selectedConversation || !reply.trim() || !user) return;
    sendChatReply(selectedConversation.id, reply);
    setReply('');
  };

  const quickReplies = [
    'Baik, kami bantu cek terlebih dahulu ya.',
    'Mohon tunggu sebentar, admin sedang verifikasi data pesanan Anda.',
    'Bisa kirim nomor pesanan atau foto produknya agar kami tindak lanjuti?',
  ];

  const statusBadge = (status: ChatConversation['status']) => {
    const styles = {
      waiting: 'bg-amber-100 text-amber-700',
      active: 'bg-emerald-100 text-emerald-700',
      resolved: 'bg-slate-100 text-slate-700',
    };
    const labels = {
      waiting: 'Menunggu',
      active: 'Aktif',
      resolved: 'Selesai',
    };

    return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>{labels[status]}</span>;
  };

  const priorityBadge = (priority: ChatConversation['priority']) => {
    const styles = {
      low: 'bg-slate-100 text-slate-700',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-rose-100 text-rose-700',
    };
    const labels = {
      low: 'Rendah',
      medium: 'Sedang',
      high: 'Tinggi',
    };

    return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles[priority]}`}>{labels[priority]}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`rounded-2xl border p-5 shadow-sm ${stat.tone}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium opacity-80">{stat.label}</p>
                  <p className="mt-3 text-3xl font-bold">{stat.value}</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-white/80 flex items-center justify-center shadow-sm">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[380px_minmax(0,1fr)] gap-6">
        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Live Chat</h2>
                <p className="text-sm text-gray-500">Pantau antrean dan tangani beberapa pelanggan sekaligus.</p>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                {visibleConversations.length} percakapan
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama, topik, order, atau tag..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {filterOptions.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === filter.id ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
            {visibleConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => {
                  setSelectedConversationId(conversation.id);
                  markChatAsRead(conversation.id);
                }}
                className={`w-full text-left px-5 py-4 border-b border-gray-100 transition-colors ${
                  selectedConversation?.id === conversation.id ? 'bg-green-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-green-500 to-green-700 text-white flex items-center justify-center font-semibold shrink-0">
                    {conversation.customerAvatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-gray-900 truncate">{conversation.customerName}</p>
                      <span className="text-xs text-gray-400 shrink-0">{formatTime(conversation.lastMessageAt)}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-1">{conversation.topic}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {statusBadge(conversation.status)}
                      {priorityBadge(conversation.priority)}
                      {conversation.unreadCount > 0 && (
                        <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold">
                          {conversation.unreadCount} baru
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2 text-xs text-gray-500">
                      <span className="truncate">{conversation.assignedAdmin ? `Ditangani ${conversation.assignedAdmin}` : 'Belum di-assign'}</span>
                      <span className="uppercase font-semibold">{conversation.channel}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}

            {visibleConversations.length === 0 && (
              <div className="px-5 py-12 text-center text-gray-500">
                <Filter className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                Tidak ada percakapan yang cocok dengan filter saat ini.
              </div>
            )}
          </div>
        </section>

        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden min-h-[680px] flex flex-col">
          {selectedConversation ? (
            <>
              <div className="p-5 border-b border-gray-100 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 text-white flex items-center justify-center font-bold text-lg shrink-0">
                    {selectedConversation.customerAvatar}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold text-gray-900">{selectedConversation.customerName}</h2>
                      {statusBadge(selectedConversation.status)}
                      {priorityBadge(selectedConversation.priority)}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{selectedConversation.customerEmail}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100">
                        <Store className="w-4 h-4" />
                        {selectedConversation.storeId ? `Toko ${selectedConversation.storeId}` : 'Semua Toko'}
                      </span>
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100">
                        <PhoneCall className="w-4 h-4" />
                        {selectedConversation.channel.toUpperCase()}
                      </span>
                      {selectedConversation.linkedOrderId && (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100">
                          Order {selectedConversation.linkedOrderId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleAssignToMe}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium flex items-center gap-2"
                  >
                    <BadgeCheck className="w-4 h-4" />
                    Ambil Chat
                  </button>
                  <button
                    onClick={handleResolve}
                    className="px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Tandai Selesai
                  </button>
                </div>
              </div>

              <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap gap-2">
                {selectedConversation.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                    {tag}
                  </span>
                ))}
                <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                  {selectedConversation.assignedAdmin ? `PIC: ${selectedConversation.assignedAdmin}` : 'Belum ada PIC'}
                </span>
              </div>

              <div className="flex-1 bg-gradient-to-b from-gray-50 to-white p-5 overflow-y-auto custom-scrollbar space-y-4">
                {selectedConversation.messages.map((message) => {
                  const isCustomer = message.sender === 'customer';
                  const isSystem = message.sender === 'system';

                  if (isSystem) {
                    return (
                      <div key={message.id} className="flex justify-center">
                        <div className="px-4 py-2 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">
                          {message.content}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={message.id} className={`flex ${isCustomer ? 'justify-start' : 'justify-end'}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                          isCustomer ? 'bg-white border border-gray-100 text-gray-700' : 'bg-green-600 text-white'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <div className={`mt-2 text-[11px] ${isCustomer ? 'text-gray-400' : 'text-green-100'}`}>
                          {message.authorName ? `${message.authorName} • ` : ''}
                          {formatFullTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-5 border-t border-gray-100 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((item) => (
                    <button
                      key={item}
                      onClick={() => setReply(item)}
                      className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm text-gray-600 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-3">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={3}
                    placeholder="Ketik balasan untuk pelanggan..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  />
                  <button
                    onClick={handleSendReply}
                    className="px-5 py-3 rounded-2xl bg-gray-900 hover:bg-black text-white font-medium flex items-center justify-center gap-2 min-w-36"
                  >
                    <Send className="w-4 h-4" />
                    Kirim
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6 text-gray-500">
              <MessageSquare className="w-10 h-10 mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-700">Belum ada percakapan dipilih</h3>
              <p className="mt-2 max-w-md">Pilih salah satu chat dari panel kiri untuk mulai membantu pelanggan.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default LiveChatManagement;
