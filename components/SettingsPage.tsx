import React from 'react';

interface SettingsPageProps {
    onClose: () => void;
    onAdminClick: () => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

const BackIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
);


const AdminIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.007 1.11-1.226l.28-.1c.34-.124.718-.124 1.058 0l.28.1c.55.219 1.02.684 1.11 1.226l.068.418c.46.283.92.618 1.343 1.003l.342.342c.435.435.748.958.9 1.518l.058.28c.124.34.124.718 0 1.058l-.058.28c-.152.56-.465 1.083-.9 1.518l-.342.342c-.423.385-.883.72-1.343 1.003l-.068.418c-.09.542-.56 1.007-1.11 1.226l-.28.1c-.34.124-.718-.124-1.058 0l-.28-.1c-.55-.219-1.02-.684-1.11-1.226l-.068-.418c-.46-.283-.92-.618-1.343-1.003l-.342-.342c-.435-.435-.748-.958-.9-1.518l-.058-.28c-.124-.34-.124-.718 0-1.058l.058.28c.152.56.465 1.083.9-1.518l.342.342c.423-.385.883.72 1.343-1.003l.068-.418M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

const ThemeIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
);


const SettingsPage: React.FC<SettingsPageProps> = ({ onClose, onAdminClick, theme, toggleTheme }) => {
    return (
        <div className="bg-gray-100 dark:bg-[#0d1117] text-gray-900 dark:text-white min-h-screen w-full p-4 sm:p-8 font-sans">
            <header className="flex items-center mb-8 max-w-2xl mx-auto">
                <button 
                    onClick={onClose} 
                    className="p-2 mr-4 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Go back"
                >
                    <BackIcon />
                </button>
                <h1 className="text-3xl font-bold">Settings</h1>
            </header>
            <main className="max-w-2xl mx-auto bg-white dark:bg-[#161b22] rounded-2xl shadow-lg p-6 space-y-2">
                <button onClick={onAdminClick} className="w-full flex items-center gap-4 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors text-left">
                    <AdminIcon />
                    <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">Manage Promotions</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Add, edit, or remove custom promotions.</p>
                    </div>
                </button>
                
                <div className="w-full flex items-center justify-between gap-4 p-4 rounded-lg">
                    <div className="flex items-center gap-4">
                        <ThemeIcon />
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-200">Theme</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark mode.</p>
                        </div>
                    </div>
                    <label htmlFor="theme-toggle" className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="theme-toggle" className="sr-only peer" checked={theme === 'dark'} onChange={toggleTheme} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-offset-white dark:peer-focus:ring-offset-[#161b22] peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </main>
        </div>
    );
};

export default SettingsPage;