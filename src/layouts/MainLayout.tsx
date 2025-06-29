import React, { useState, useEffect } from 'react';
import { FileText, MessageSquare, CheckCircle2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Dashboard from '../components/Dashboard';
import DocumentsView from '../components/DocumentsView';
import EditorView from '../components/EditorView';
import TeamView from '../components/TeamView';
import { Activity, Document, TeamMember, TeamActivity, CognitoUser } from '../types';
import ProfileModal from '../components/modals/ProfileModal';
import SettingsModal from '../components/modals/SettingsModal';
import NotificationSettingsModal from '../components/modals/NotificationSettingsModal';
import InviteMemberModal from '@/components/modals/InviteMemberModal';
import DeleteMemberModal from '@/components/modals/DeleteMemberModal';
import { useAuth } from '../auth/AuthContext';
import { useCognitoUsers } from '@/lib/hooks/useCognitoUsers';
import FileEditor from '../components/FileEditor';
import FileVersionHistory from '../components/FileVersionHistory';

interface MainLayoutProps {
  children?: React.ReactNode;
  recentDocuments: Document[];
  recentActivities: Activity[];
  teamMembers: TeamMember[];
  teamActivities: TeamActivity[];
}

const MainLayout: React.FC<MainLayoutProps> = ({
  recentDocuments,
  recentActivities,
  teamMembers,
  teamActivities,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ms_isCollapsed') === 'true';
    }
    return false;
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ms_isDarkMode') === 'true';
    }
    return false;
  });
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ms_activeTab') || 'dashboard';
    }
    return 'dashboard';
  });
  const [expandedFolders, setExpandedFolders] = useState<{ [key: string]: boolean }>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ms_expandedFolders');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return {};
        }
      }
    }
    return {};
  });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showNotificationSettingsModal, setShowNotificationSettingsModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetUser, setDeleteTargetUser] = useState<CognitoUser | null>(null);
  const [showFileEditor, setShowFileEditor] = useState(false);
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const { logout } = useAuth();
  const { users: cognitoUsers, loading: usersLoading, refetch } = useCognitoUsers();

  useEffect(() => {
    localStorage.setItem('ms_isCollapsed', isCollapsed.toString());
  }, [isCollapsed]);
  useEffect(() => {
    localStorage.setItem('ms_isDarkMode', isDarkMode.toString());
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  useEffect(() => {
    localStorage.setItem('ms_activeTab', activeTab);
  }, [activeTab]);
  useEffect(() => {
    localStorage.setItem('ms_expandedFolders', JSON.stringify(expandedFolders));
  }, [expandedFolders]);

  const closeAllPopups = () => {
    setShowNotifications(false);
    setShowUserMenu(false);
    setShowProfileModal(false);
    setShowSettingsModal(false);
    setShowNotificationSettingsModal(false);
    setShowInviteModal(false);
    setShowDeleteModal(false);
    setDeleteTargetUser(null);
    setShowFileEditor(false);
    setCurrentDocumentId(null);
    setShowVersionHistory(false);
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard recentDocuments={recentDocuments} recentActivities={recentActivities} teamMemberCount={cognitoUsers.length} />;
      case 'documents':
        return <DocumentsView 
          documents={recentDocuments} 
          onDocumentClick={(doc) => {
            setCurrentDocumentId(doc.id);
            setShowFileEditor(true);
          }} 
        />;
      case 'editor':
        return <FileEditor 
          documentId={currentDocumentId || undefined}
          onClose={() => {
            setShowFileEditor(false);
            setCurrentDocumentId(null);
          }}
          onSave={(document) => {
            console.log('文件已儲存:', document);
            setShowFileEditor(false);
            setCurrentDocumentId(null);
          }}
        />;
      case 'team':
        return <TeamView 
          members={cognitoUsers} 
          activities={teamActivities} 
          loading={usersLoading} 
          refetch={refetch}
          onInviteClick={() => {
            closeAllPopups();
            setShowInviteModal(true);
          }}
          onDeleteClick={(user) => {
            closeAllPopups();
            setDeleteTargetUser(user);
            setShowDeleteModal(true);
          }}
        />;
      default:
        return <Dashboard recentDocuments={recentDocuments} recentActivities={recentActivities} teamMemberCount={cognitoUsers.length} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        expandedFolders={expandedFolders}
        setExpandedFolders={setExpandedFolders}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          showUserMenu={showUserMenu}
          setShowUserMenu={setShowUserMenu}
          onProfileClick={() => { closeAllPopups(); setShowProfileModal(true); }}
          onSettingsClick={() => { closeAllPopups(); setShowSettingsModal(true); }}
          onNotificationSettingsClick={() => { closeAllPopups(); setShowNotificationSettingsModal(true); }}
          recentActivities={recentActivities}
        />
        <main className="flex-1 min-h-0 h-full flex flex-col px-4 md:px-8 py-4 md:py-8 w-full max-w-7xl mx-auto">
          {renderContent()}
        </main>
      </div>

      <ProfileModal 
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onProfileSaved={refetch}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />

      <NotificationSettingsModal
        isOpen={showNotificationSettingsModal}
        onClose={() => setShowNotificationSettingsModal(false)}
      />

      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        refetch={refetch}
      />

      <DeleteMemberModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteTargetUser(null);
        }}
        refetch={refetch}
        user={deleteTargetUser}
      />

      {currentDocumentId && (
        <FileVersionHistory
          documentId={currentDocumentId}
          isOpen={showVersionHistory}
          onClose={() => setShowVersionHistory(false)}
          onVersionSelect={(version) => {
            console.log('選擇版本:', version);
            setShowVersionHistory(false);
          }}
        />
      )}
    </div>
  );
};

export default MainLayout;

 