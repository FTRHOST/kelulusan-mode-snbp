import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar.tsx';
import Header from '@/components/Header.tsx';
import DataSiswaPage from '@/components/DataSiswaPage.tsx'; 
import Dashboard from '@/components/Dashboard.tsx'; 
import PengaturanPage from '@/components/PengaturanPage.tsx';
import SKLGeneratorPage from '@/components/SKLGeneratorPage.tsx';
import LoginPage from '@/components/LoginPage.tsx'; // Import LoginPage
import { type Student } from '@/lib/types.ts';
import { fetchStudents } from '@/services/studentService.ts';
import { loadAppConfigFromServer } from '@/lib/constants.ts'; 

export type ActiveView = "dashboard" | "data-siswa" | "jurusan" | "skl-generator" | "pengaturan";

const LOCAL_STORAGE_AUTH_KEY = 'grad_app_is_auth';
const LOCAL_STORAGE_USER_KEY = 'grad_app_user';

const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  const [activeView, setActiveView] = useState<ActiveView>('dashboard'); 
  const [configLoaded, setConfigLoaded] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log('App useEffect: checking localStorage for auth');
    if (typeof window !== 'undefined') {
      const storedAuth = localStorage.getItem(LOCAL_STORAGE_AUTH_KEY);
      const storedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      console.log('Stored auth:', storedAuth, 'Stored user:', storedUser);
      if (storedAuth === 'true' && storedUser) {
        setIsAuthenticated(true);
        setCurrentUser(storedUser);
      }
    }
    console.log('Setting authLoading to false');
    setAuthLoading(false);
  }, []);

  useEffect(() => {
    const initializeAppConfig = async () => {
      await loadAppConfigFromServer(); 
      setConfigLoaded(true); 
    };
    initializeAppConfig();
  }, []);

  useEffect(() => {
    if (!configLoaded || !isAuthenticated) { // Only load if config ready AND authenticated
        if (isAuthenticated && !configLoaded) {
            setLoading(true); // Show loading if authenticated but config not ready
        } else if (!isAuthenticated) {
            setLoading(false); // Not authenticated, no student data to load
            setStudents([]); // Clear students if logged out
            setError(null);
        }
        return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchStudents();
        setStudents(data);
        setError(null);
      } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("Gagal memuat data siswa. Kesalahan tidak diketahui.");
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Sidebar resize logic only if authenticated
    const handleResize = () => {
      if (window.innerWidth < 1024) { 
        // setIsSidebarOpen(false); // Optionally close sidebar on mobile by default
      } else {
        setIsSidebarOpen(true); 
      }
    };

    handleResize(); 
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);

  }, [configLoaded, isAuthenticated]); 

  const handleLogin = (username: string) => {
    setIsAuthenticated(true);
    setCurrentUser(username);
    localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, 'true');
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, username);
    setActiveView('dashboard'); // Default view after login
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    setActiveView('dashboard'); // Reset view, user will be redirected to LoginPage
  };

  const renderContent = () => {
    if (!configLoaded || (loading && (activeView === 'data-siswa' || activeView === 'dashboard' || activeView === 'skl-generator'))) { 
      return <div className="flex justify-center items-center h-full text-lg text-gray-500">Memuat data aplikasi...</div>;
    }
    if (error && (activeView === 'data-siswa' || activeView === 'dashboard' || activeView === 'skl-generator')) { 
      return <div className="p-4 text-center text-red-600 bg-red-100 rounded-md">{error}</div>;
    }

    switch (activeView) {
      case 'dashboard':
        return <Dashboard students={students} />;
      case 'data-siswa':
        return <DataSiswaPage students={students} setStudents={setStudents} />;
      case 'jurusan':
        return <div className="p-6 bg-card-bg rounded-xl shadow-card text-text-primary">Konten Halaman Jurusan</div>;
      case 'skl-generator':
        return <SKLGeneratorPage students={students} />;
      case 'pengaturan':
        return <PengaturanPage />; 
      default:
        return <Dashboard students={students} />; 
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-main-bg">
        <div className="text-lg text-gray-500">Memeriksa sesi pengguna...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-main-bg font-sans text-text-primary">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        activeView={activeView}
        setActiveView={setActiveView}
        onLogout={handleLogout}
        currentUser={currentUser}
      />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'ml-0 lg:ml-0 md:ml-20 sm:ml-20' : 'ml-0' 
        }${isSidebarOpen && window.innerWidth < 1024 ? 'ml-20' : 'ml-0'}
        ${isSidebarOpen ? 'lg:ml-0' : 'ml-0'}
        `}
        style={{ marginLeft: isSidebarOpen && window.innerWidth < 1024 ? '5rem' : '0' }} 
        >
        <Header sidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;