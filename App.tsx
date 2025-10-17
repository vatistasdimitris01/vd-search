import React, { useState, useCallback, useEffect } from 'react';
import type { SearchResultItem, SearchType, Promotion } from './types';
import { fetchResults } from './services/searchService';
import { fetchAllPromotions, findPromotion, savePromotions } from './services/promotionService';
import { saveSearchQuery } from './services/historyService';
import SearchInput from './components/SearchInput';
import Tabs from './components/Tabs';
import ResultsDisplay from './components/ResultsDisplay';
import Pagination from './components/Pagination';
import AnimatedTitle from './components/AnimatedTitle';
import AdminPage from './components/AdminPage';
import PasswordPage from './components/PasswordModal';
import SettingsPage from './components/SettingsPage';
import ScrollToTopButton from './components/ScrollToTopButton';

interface UserLocation {
    ip: string;
    city: string;
    country: string;
    country_code: string;
    latitude?: number;
    longitude?: number;
}

const HomeButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button
        onClick={onClick}
        className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        aria-label="Go to homepage"
    >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.125 1.125 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
    </button>
);

const SettingsButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button
        onClick={onClick}
        className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        aria-label="Open settings"
    >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
        </svg>
    </button>
);


const App: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<SearchResultItem[] | null>(null);
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [allPromotions, setAllPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<SearchType>('all');
  const [startIndex, setStartIndex] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [view, setView] = useState<'search' | 'admin' | 'settings' | 'password'>('search');
  const [isAdmin, setIsAdmin] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);


  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
        const storedTheme = window.localStorage.getItem('theme');
        if (storedTheme === 'light' || storedTheme === 'dark') {
            return storedTheme;
        }
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
    }
    return 'light';
  });

  useEffect(() => {
    const fetchLocation = async () => {
        // First, fetch IP-based location for city/country and as a fallback.
        let ipLocation: UserLocation | null = null;
        try {
            const response = await fetch('https://ipapi.co/json/');
            if (response.ok) {
                const data = await response.json();
                ipLocation = {
                    ip: data.ip,
                    city: data.city,
                    country: data.country_name,
                    country_code: data.country_code,
                    latitude: data.latitude,
                    longitude: data.longitude,
                };
            }
        } catch (e) {
            console.error("Could not fetch IP-based location", e);
        }

        // Then, try to get more accurate coordinates from the browser's Geolocation API.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Success: Merge high-accuracy coordinates with IP location info.
                    setUserLocation({
                        ...(ipLocation || { ip: 'N/A', city: 'N/A', country: 'N/A', country_code: 'N/A' }),
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (geoError) => {
                    // Error or permission denied: Fall back to IP-based location.
                    console.warn(`Geolocation error (${geoError.code}): ${geoError.message}`);
                    if (ipLocation) {
                        setUserLocation(ipLocation);
                    }
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000, // 10 seconds
                    maximumAge: 0, // Force a fresh location check
                }
            );
        } else {
            // Geolocation not supported: Fall back to IP-based location.
            console.warn("Geolocation is not supported by this browser.");
            if (ipLocation) {
                setUserLocation(ipLocation);
            }
        }
    };

    fetchLocation();
}, []);


  useEffect(() => {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const checkScroll = () => {
        if (window.scrollY > 300) {
            setShowScrollToTop(true);
        } else {
            setShowScrollToTop(false);
        }
    };
    window.addEventListener('scroll', checkScroll);
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleTheme = () => {
      setTheme(prevTheme => {
          const newTheme = prevTheme === 'light' ? 'dark' : 'light';
          localStorage.setItem('theme', newTheme);
          return newTheme;
      });
  };

  const handleAdminClick = () => {
    if (isAdmin) {
      setView('admin');
    } else {
      setView('password');
    }
  };

  const handlePasswordSubmit = (password: string) => {
    // Make password check case-insensitive and trim whitespace
    if (password.trim().toLowerCase() === 'batman') {
      setIsAdmin(true);
      setView('admin');
    } else {
      alert('Incorrect password.');
      setView('settings');
    }
  };

  useEffect(() => {
    if (view === 'admin') {
      fetchAllPromotions().then(setAllPromotions);
    }
  }, [view]);

  const executeSearch = useCallback(async (q: string, start: number, tab: SearchType) => {
    if (!q.trim()) return;

    if (userLocation) {
      saveSearchQuery(q.trim(), userLocation);
    }

    setLoading(true);
    setError(null);
    setQuery(q);
    setStartIndex(start);
    setCurrentTab(tab);

    try {
      const [promo, data] = await Promise.all([
        findPromotion(q),
        fetchResults(q, start, tab, userLocation?.country_code),
      ]);

      setPromotion(promo);

      if (data.error) {
        throw new Error(data.error.message);
      }
      setResults(data.items || []);
      const totalResults = Number(data.searchInformation?.totalResults || '0');
      const calculatedTotalPages = Math.min(10, Math.ceil(totalResults / 10));
      setTotalPages(calculatedTotalPages);

    } catch (err) {
      console.error(err);
      const message = (err as Error).message.toLowerCase();
      let errorMessage: string;

      if (message.includes('quota exceeded')) {
        errorMessage = 'The free daily search limit has been reached. Please try again tomorrow.';
      } else if (message.includes('api key not valid')) {
        errorMessage = 'Error: The API Key is not valid. Please check the configuration.';
      } else {
        errorMessage = 'An error occurred while fetching results. Please try again later.';
      }
      
      setError(errorMessage);
      setResults([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [userLocation]);

  const handleSearch = (newQuery: string) => {
    executeSearch(newQuery, 1, currentTab);
  };

  const handleTabChange = (newTab: SearchType) => {
    if (query) {
      executeSearch(query, 1, newTab);
    } else {
      setCurrentTab(newTab);
    }
  };

  const handlePageChange = (pageNumber: number) => {
    if (query) {
      const newStartIndex = (pageNumber - 1) * 10 + 1;
      executeSearch(query, newStartIndex, currentTab);
    }
  };

  const handleGoHome = () => {
    setResults(null);
    setPromotion(null);
    setQuery('');
    setStartIndex(1);
    setTotalPages(0);
    setError(null);
    setCurrentTab('all');
    setView('search');
  };
  
  const handleSavePromotions = async (updatedPromotions: Promotion[]) => {
    await savePromotions(updatedPromotions);
    alert('Promotions saved successfully!');
    setView('search');
  };

  const hasSearched = results !== null;
  const currentPage = Math.floor(startIndex / 10) + 1;

  if (view === 'password') {
    return <PasswordPage
              onSubmit={handlePasswordSubmit}
              onBack={() => setView('settings')}
           />;
  }

  if (view === 'settings') {
    return <SettingsPage 
        onClose={() => setView('search')} 
        onAdminClick={handleAdminClick}
        theme={theme}
        toggleTheme={toggleTheme}
    />;
  }

  if (view === 'admin') {
    return <AdminPage 
             initialPromotions={allPromotions} 
             onSave={handleSavePromotions}
             onBack={() => setView('search')}
           />;
  }

  return (
    <div className={`relative bg-white dark:bg-[#0d1117] text-gray-900 dark:text-white flex flex-col items-center min-h-screen p-4 sm:p-8 font-sans transition-colors duration-300 ${hasSearched ? 'justify-start pt-20 sm:pt-12' : 'justify-center'}`}>

      <div className="absolute top-4 left-4">
        {hasSearched && <HomeButton onClick={handleGoHome} />}
      </div>
      <div className="absolute top-4 right-4 flex items-center gap-2">
          <SettingsButton onClick={() => setView('settings')} />
      </div>
      
      <div className="w-full max-w-2xl flex-shrink-0">
        <AnimatedTitle 
            text="vd search"
            className={`text-center font-bold text-gray-800 dark:text-gray-200 transition-all duration-300 ${hasSearched ? 'text-3xl mb-4' : 'text-5xl sm:text-6xl mb-8'}`}
        />
        
        <SearchInput 
          value={query}
          onChange={setQuery}
          onSearch={handleSearch} 
          disabled={loading} 
        />
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
            Search results may be enhanced based on your location.
        </p>

        {hasSearched && (
          <Tabs currentTab={currentTab} onTabChange={handleTabChange} />
        )}
      </div>

      {hasSearched && (
        <ResultsDisplay
          loading={loading}
          error={error}
          results={results}
          promotion={promotion}
          searchType={currentTab}
        />
      )}
      
      {hasSearched && !loading && results && results.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
      <ScrollToTopButton isVisible={showScrollToTop && hasSearched} onClick={scrollToTop} />
    </div>
  );
};

export default App;