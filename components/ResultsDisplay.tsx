import React from 'react';
import type { SearchResultItem, SearchType, Promotion } from '../types';

interface ResultsDisplayProps {
  loading: boolean;
  error: string | null;
  results: SearchResultItem[] | null;
  promotion: Promotion | null;
  searchType: SearchType;
}

const LoadingAnimation: React.FC = () => (
    <div className="flex justify-center items-center h-40">
      <div className="flex items-center justify-center space-x-2">
        <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse"></div>
      </div>
    </div>
  );

const PromotionResult: React.FC<{ item: Promotion }> = ({ item }) => (
    <a 
        href={item.url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="block group bg-green-50 dark:bg-green-900/40 rounded-lg p-4 sm:p-6 mb-6 border border-green-300 dark:border-green-700 transition-shadow hover:shadow-md"
    >
        <div className="flex flex-col items-start gap-2 mb-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-blue-600 dark:text-[#58a6ff] text-lg sm:text-xl break-words group-hover:underline">
                {item.title}
            </h3>
            <span className="text-xs font-semibold text-green-700 dark:text-green-300 bg-green-200 dark:bg-green-800/50 px-2 py-1 rounded-full">Promotion</span>
        </div>
        <p className="text-gray-600 dark:text-[#c9d1d9] mt-1 text-sm">{item.description}</p>
    </a>
);

const WebResult: React.FC<{ item: SearchResultItem }> = ({ item }) => (
  <a
    href={item.link}
    target="_blank"
    rel="noopener noreferrer"
    className="block group bg-white dark:bg-[#161b22] rounded-lg p-4 sm:p-6 mb-4 transition-colors hover:bg-gray-50 dark:hover:bg-[#1f2937] border border-gray-200 dark:border-gray-800"
  >
    <h3 className="text-blue-600 dark:text-[#58a6ff] text-lg sm:text-xl break-words group-hover:underline">
      {item.title}
    </h3>
    <p className="text-gray-600 dark:text-[#c9d1d9] mt-2 text-sm">{item.snippet}</p>
  </a>
);

const ImageResult: React.FC<{ item: SearchResultItem }> = ({ item }) => (
  <a href={item.link} target="_blank" rel="noopener noreferrer" className="block group rounded-lg overflow-hidden">
    <img
      src={item.link}
      alt={item.title}
      className="w-full h-full object-cover transition-transform group-hover:scale-105"
      loading="lazy"
    />
  </a>
);

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ loading, error, results, promotion, searchType }) => {
  if (loading) {
    return (
      <div className="w-full max-w-3xl mt-8">
        <LoadingAnimation />
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
        <div>
          {results.map((item) => (
            <WebResult key={item.link} item={item} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {results.map((item) => (
            <ImageResult key={item.link} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;