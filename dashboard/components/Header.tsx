
import React from 'react';
import { SchoolLogoIcon, MenuIcon } from './icons.tsx';

interface HeaderProps {
  sidebarToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarToggle }) => {
  return (
    <header className="flex items-center justify-between h-20 px-6 bg-header-bg border-b border-gray-200 shadow-sm">
      <div className="flex items-center">
        <button onClick={sidebarToggle} className="text-gray-500 focus:outline-none lg:hidden mr-4">
          <MenuIcon className="h-6 w-6" />
        </button>
        <SchoolLogoIcon className="h-8 w-8 text-brand-primary mr-3 hidden sm:block" />
        <h1 className="text-xl sm:text-2xl font-semibold text-text-primary">
          Data Kelulusan Siswa <span className="hidden md:inline">MA NU 01 Banyuputih</span>
        </h1>
      </div>
    </header>
  );
};

export default Header;