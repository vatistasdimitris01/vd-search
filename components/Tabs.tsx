import React, { useState, useEffect, useRef } from 'react';
import type { SearchType } from '../types';

interface TabsProps {
  currentTab: SearchType;
  onTabChange: (tab: SearchType) => void;
}

const Tabs: React.FC<TabsProps> = ({ currentTab, onTabChange }) => {
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({});

  useEffect(() => {
    const activeTabIndex = currentTab === 'all' ? 0 : 1;
    const activeTabEl = tabsRef.current[activeTabIndex];
    if (activeTabEl) {
      setIndicatorStyle({
        left: activeTabEl.offsetLeft,
        width: activeTabEl.offsetWidth,
      });
    }
  }, [currentTab]);
  
  const getTabClassName = (tab: SearchType) => `
    cursor-pointer py-2.5 px-4 text-sm font-medium transition-colors 
    ${currentTab === tab 
      ? 'text-blue-600 dark:text-[#58a6ff]' 
      : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
    }
  `;

  return (
    <div className="relative border-b border-gray-200 dark:border-gray-700 mt-6">
      <div className="flex justify-center gap-3 sm:gap-8">
        <button
          ref={el => tabsRef.current[0] = el}
          onClick={() => onTabChange('all')}
          className={getTabClassName('all')}
        >
          All
        </button>
        <button
          ref={el => tabsRef.current[1] = el}
          onClick={() => onTabChange('image')}
          className={getTabClassName('image')}
        >
          Images
        </button>
      </div>
      <div 
        className="absolute bottom-[-1px] h-[2px] bg-blue-500 dark:bg-[#58a6ff] rounded-full transition-all duration-300 ease-[var(--ease-out-quart)]" 
        style={indicatorStyle}
      ></div>
    </div>
  );
};

export default Tabs;