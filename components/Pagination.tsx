import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const handlePrev = () => onPageChange(currentPage - 1);
  const handleNext = () => onPageChange(currentPage + 1);

  const buttonClasses = "inline-flex items-center gap-2 py-2 px-4 sm:px-5 rounded-full cursor-pointer transition-colors border bg-white dark:bg-[#161b22] text-gray-800 dark:text-white border-gray-300 dark:border-[#444] hover:bg-gray-100 dark:hover:bg-[#1f2937] disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="flex justify-center items-center flex-wrap gap-4 mt-8">
      <button
        onClick={handlePrev}
        disabled={currentPage <= 1}
        className={buttonClasses}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Previous
      </button>

      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={handleNext}
        disabled={currentPage >= totalPages}
        className={buttonClasses}
      >
        Next
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default Pagination;