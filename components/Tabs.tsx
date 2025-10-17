import React from 'react';
import type { SearchType } from '../types';

interface TabsProps {
  currentTab: SearchType;
  onTabChange: (tab: SearchType) => void;
}

const Tab: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`cursor-pointer py-2 px-4 rounded-lg border transition-colors ${
      isActive
        ? 'bg-blue-500 text-white border-blue-500 dark:bg-[#58a6ff] dark:text-white dark:border-[#58a6ff]'
        : 'bg-white dark:bg-[#161b22] text-gray-700 dark:text-gray-200 border-gray-300 dark:border-[#333] hover:bg-gray-100 dark:hover:bg-[#1f2937]'
    }`}
  >
    {label}
  </button>
);

const Tabs: React.FC<TabsProps> = ({ currentTab, onTabChange }) => {
  return (
    <div className="flex justify-center gap-3 sm:gap-4 mt-6">
      <Tab
        label="All"
        isActive={currentTab === 'all'}
        onClick={() => onTabChange('all')}
      />
      <Tab
        label="Images"
        isActive={currentTab === 'image'}
        onClick={() => onTabChange('image')}
      />
    </div>
  );
};

export default Tabs;