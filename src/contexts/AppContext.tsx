import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';
import { ChatConversation, User, dummyChatConversations, dummyUsers } from '@/data/adminData';

interface AppContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  user: User | null;
  chatConversations: ChatConversation[];
  login: (email: string) => boolean;
  logout: () => void;
  assignChatToCurrentUser: (conversationId: string) => void;
  resolveChat: (conversationId: string) => void;
  sendChatReply: (conversationId: string, message: string) => void;
  markChatAsRead: (conversationId: string) => void;
}

const defaultAppContext: AppContextType = {
  sidebarOpen: false,
  toggleSidebar: () => { },
  user: null,
  chatConversations: [],
  login: () => false,
  logout: () => { },
  assignChatToCurrentUser: () => { },
  resolveChat: () => { },
  sendChatReply: () => { },
  markChatAsRead: () => { },
};

const AppContext = createContext<AppContextType>(defaultAppContext);

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [chatConversations, setChatConversations] = useState<ChatConversation[]>(dummyChatConversations);

  useEffect(() => {
    // Check for existing session
    const session = localStorage.getItem('admin_session');
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        // Validate against dummyUsers to get full user object including role
        const validUser = dummyUsers.find(u => u.email === sessionData.email);
        if (validUser) {
          setUser(validUser);
        } else {
          // If user not found in dummy data (e.g. data changed), clear session
          localStorage.removeItem('admin_session');
        }
      } catch (e) {
        console.error("Invalid session data", e);
        localStorage.removeItem('admin_session');
      }
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const login = (email: string): boolean => {
    const foundUser = dummyUsers.find(u => u.email === email && (u.role === 'super_admin' || u.role === 'store_admin'));

    if (foundUser) {
      if (foundUser.status !== 'active') {
        toast({
          title: "Akun Tidak Aktif",
          description: "Akun Anda sedang tidak aktif atau dibanned.",
          variant: "destructive"
        });
        return false;
      }

      setUser(foundUser);
      localStorage.setItem('admin_session', JSON.stringify({
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role,
        storeId: foundUser.storeId,
        loginTime: new Date().toISOString(),
      }));

      toast({
        title: "Login Berhasil",
        description: `Selamat datang kembali, ${foundUser.name}`,
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('admin_session');
    toast({
      title: "Logout Berhasil",
      description: "Anda telah keluar dari sistem.",
    });
  };

  const updateConversation = (
    conversationId: string,
    updater: (conversation: ChatConversation) => ChatConversation
  ) => {
    setChatConversations((prev) =>
      prev.map((conversation) => (conversation.id === conversationId ? updater(conversation) : conversation))
    );
  };

  const assignChatToCurrentUser = (conversationId: string) => {
    if (!user) return;

    updateConversation(conversationId, (conversation) => ({
      ...conversation,
      status: conversation.status === 'waiting' ? 'active' : conversation.status,
      assignedAdmin: user.name,
      messages: [
        ...conversation.messages,
        {
          id: uuidv4(),
          sender: 'system',
          content: `Chat diambil oleh ${user.name}.`,
          timestamp: new Date().toISOString(),
        },
      ],
    }));
  };

  const resolveChat = (conversationId: string) => {
    updateConversation(conversationId, (conversation) => ({
      ...conversation,
      status: 'resolved',
      unreadCount: 0,
      messages: [
        ...conversation.messages,
        {
          id: uuidv4(),
          sender: 'system',
          content: 'Percakapan ditandai selesai oleh admin.',
          timestamp: new Date().toISOString(),
        },
      ],
    }));
  };

  const sendChatReply = (conversationId: string, message: string) => {
    if (!user || !message.trim()) return;

    updateConversation(conversationId, (conversation) => ({
      ...conversation,
      status: conversation.status === 'waiting' ? 'active' : conversation.status,
      assignedAdmin: conversation.assignedAdmin || user.name,
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      messages: [
        ...conversation.messages,
        {
          id: uuidv4(),
          sender: 'admin',
          content: message.trim(),
          timestamp: new Date().toISOString(),
          authorName: user.name,
        },
      ],
    }));
  };

  const markChatAsRead = (conversationId: string) => {
    updateConversation(conversationId, (conversation) => ({
      ...conversation,
      unreadCount: 0,
    }));
  };

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        user,
        chatConversations,
        login,
        logout,
        assignChatToCurrentUser,
        resolveChat,
        sendChatReply,
        markChatAsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
