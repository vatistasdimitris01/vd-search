import React, { useEffect, useRef } from 'react';
import type { SearchResultItem, SearchType, Promotion } from '../types';

// Declare GSAP as a global variable since it's loaded from a CDN
declare const gsap: any;

interface ResultsDisplayProps {
  loading: boolean;
  error: string | null;
  results: SearchResultItem[] | null;
  promotion: Promotion | null;
  searchType: SearchType;
}

const WebResultSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-[#161b22] rounded-lg p-4 sm:p-6 mb-4 border border-gray-200 dark:border-gray-800 animate-pulse-fast">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
    </div>
);

const ImageResultSkeleton: React.FC = () => (
    <div className="rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse-fast aspect-square"></div>
);

const LoadingAnimation: React.FC<{ searchType: SearchType }> = ({ searchType }) => (
    searchType === 'all' ? (
        <div>
            {Array.from({ length: 5 }).map((_, i) => <WebResultSkeleton key={i} />)}
        </div>
    ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => <ImageResultSkeleton key={i} />)}
        </div>
    )
);

const getDomain = (link: string): string => {
    try {
        return new URL(link).hostname;
    } catch (e) {
        // Fallback for malformed URLs
        const matches = link.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/im);
        return matches ? matches[1] : link;
    }
}

const PromotionResult: React.FC<{ item: Promotion }> = ({ item }) => (
    <a 
        href={item.url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="block group bg-blue-500/10 dark:bg-blue-500/10 rounded-xl p-6 mb-6 border border-blue-500/20 dark:border-blue-500/30 transition-all hover:border-blue-500/40 hover:shadow-lg hover:-translate-y-1"
    >
        <div className="flex flex-col items-start gap-2 mb-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-blue-600 dark:text-[#58a6ff] text-lg sm:text-xl break-words group-hover:underline">
                {item.title}
            </h3>
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-200 dark:bg-blue-800/50 px-2 py-1 rounded-full">Promotion</span>
        </div>
        <p className="text-gray-600 dark:text-[#c9d1d9] mt-1 text-sm">{item.description}</p>
    </a>
);

const WebResult: React.FC<{ item: SearchResultItem }> = ({ item }) => (
  <a
    href={item.link}
    target="_blank"
    rel="noopener noreferrer"
    className="block group bg-white dark:bg-[#161b22] rounded-xl p-6 mb-4 transition-all duration-300 shadow-sm hover:shadow-xl border border-transparent dark:border dark:border-gray-800 dark:hover:border-gray-700 hover:-translate-y-1"
  >
    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{getDomain(item.link)}</p>
    <h3 className="text-blue-600 dark:text-[#58a6ff] text-lg sm:text-xl break-words group-hover:underline mt-1">
      {item.title}
    </h3>
    <p className="text-gray-600 dark:text-[#c9d1d9] mt-2 text-sm">{item.snippet}</p>
  </a>
);

const ImageResult: React.FC<{ item: SearchResultItem }> = ({ item }) => (
  <a href={item.link} target="_blank" rel="noopener noreferrer" className="block group rounded-xl overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all shadow-md hover:shadow-xl">
    <img
      src={item.link}
      alt={item.title}
      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      loading="lazy"
    />
  </a>
);

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ loading, error, results, promotion, searchType }) => {
  const resultsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (resultsRef.current && !loading && typeof gsap !== 'undefined') {
        gsap.fromTo(resultsRef.current.children, 
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out' }
        );
    }
  }, [results, loading, searchType]);

  if (loading) {
    return (
      <div className="w-full max-w-3xl mt-8">
        <LoadingAnimation searchType={searchType} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-3xl mt-8 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-500 text-red-700 dark:text-red-300 p-4 rounded-lg">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  if (results === null) {
    return null;
  }

  if (results.length === 0 && !promotion) {
    return (
      <div className="w-full max-w-3xl mt-8 text-center text-gray-500 dark:text-gray-400">
        <p>No results found.</p>
      </div>
    );
  }

  return (
    <div id="results" className="w-full max-w-3xl mt-8">
      {promotion && searchType === 'all' && <PromotionResult item={promotion} />}
      {searchType === 'all' ? (
        <div ref={resultsRef}>
          {results.map((item) => (
            <WebResult key={item.link} item={item} />
          ))}
        </div>
      ) : (
        <div ref={resultsRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {results.map((item) => (
            <ImageResult key={item.link} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;