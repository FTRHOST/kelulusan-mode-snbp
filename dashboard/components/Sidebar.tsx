import React from 'react';
import { DashboardIcon, StudentsIcon, MajorIcon, SettingsIcon, SklIcon, LogoutIcon, SchoolLogoIcon } from './icons.tsx';
import { IconProps } from '../types.ts';
import { ActiveView } from '../App.tsx';

interface NavItemProps {
  icon: React.FC<IconProps>;
  label: string;
  viewId: ActiveView;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, isActive, onClick }) => {
  const baseClasses = 'flex items-center w-full py-3 rounded-lg transition-all duration-150 text-left';
  const layoutClasses = 'px-2 lg:px-4 group-hover:px-4 justify-center lg:justify-start group-hover:justify-start';
  const activeClasses = isActive
    ? 'bg-sidebar-active-bg text-sidebar-active-text font-semibold shadow-sm'
    : 'text-sidebar-text hover:bg-gray-100 hover:text-gray-800';

  return (
    <button
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={`${baseClasses} ${layoutClasses} ${activeClasses}`}
    >
      <Icon className="w-5 h-5 shrink-0 transition-all lg:mr-3 group-hover:mr-3" />
      <span className="whitespace-nowrap transition-all duration-200 opacity-0 w-0 overflow-hidden lg:opacity-100 lg:w-auto group-hover:opacity-100 group-hover:w-auto group-hover:delay-150">{label}</span>
    </button>
  );
};

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onLogout: () => void; // Added for logout functionality
  currentUser: string | null; // Added to display current user
}

interface NavItemConfig {
  viewId: ActiveView;
  label: string;
  icon: React.FC<IconProps>;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, activeView, setActiveView, onLogout, currentUser }) => {
  const sidebarNavigationConfigs: NavItemConfig[] = [
    { viewId: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { viewId: 'data-siswa', label: 'Data Siswa', icon: StudentsIcon },
    { viewId: 'skl-generator', label: 'SKL Generator', icon: SklIcon },
    { viewId: 'pengaturan', label: 'Pengaturan', icon: SettingsIcon },
  ];

  return (
    <div className={`
        fixed inset-y-0 left-0 z-30 flex flex-col h-full bg-sidebar-bg shadow-lg 
        transition-all duration-300 ease-in-out group overflow-hidden
        lg:relative lg:translate-x-0 lg:w-64 
        ${isOpen 
            ? 'translate-x-0 w-20 hover:w-64 lg:w-64' 
            : '-translate-x-full w-64' 
        }`}
    >
      <div className="flex items-center h-20 border-b border-gray-200 px-4 shrink-0 justify-center lg:justify-start group-hover:justify-start">
         <SchoolLogoIcon className="h-8 w-8 text-brand-primary shrink-0" />
        <span className="ml-2 text-xl font-bold text-gray-800 whitespace-nowrap transition-all duration-200 opacity-0 w-0 overflow-hidden lg:opacity-100 lg:w-auto group-hover:opacity-100 group-hover:w-auto group-hover:delay-150">AppLogo</span>
      </div>

      <nav className="flex-grow space-y-2 overflow-y-auto py-4 px-2 lg:px-4 group-hover:px-4">
        {sidebarNavigationConfigs.map((item) => (
          <NavItem
            key={item.viewId}
            icon={item.icon}
            label={item.label}
            viewId={item.viewId}
            isActive={activeView === item.viewId}
            onClick={() => setActiveView(item.viewId)}
          />
        ))}
      </nav>

      <div className="border-t border-gray-200 py-4 px-2 lg:px-4 group-hover:px-4">
        <div className="flex items-center justify-center lg:justify-start group-hover:justify-start">
          <div className="transition-all duration-200 opacity-0 w-0 overflow-hidden lg:opacity-100 lg:w-auto group-hover:opacity-100 group-hover:w-auto group-hover:delay-150 lg:mr-3 group-hover:mr-3">
            <p className="text-sm font-medium text-gray-800 whitespace-nowrap truncate" title={currentUser || 'Pengguna Admin'}>{currentUser || 'Pengguna Admin'}</p>
            <p className="text-xs text-gray-500 whitespace-nowrap">Administrator</p>
          </div>
          <button 
            onClick={onLogout}
            className="ml-auto text-gray-500 hover:text-gray-700 transition-opacity duration-200 opacity-0 lg:opacity-100 group-hover:opacity-100 group-hover:delay-150" 
            aria-label="Logout"
            >
            <LogoutIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;