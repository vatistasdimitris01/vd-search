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

  const buttonClasses = "py-2 px-4 sm:px-5 rounded-lg cursor-pointer transition-colors border bg-white dark:bg-[#161b22] text-gray-800 dark:text-white border-gray-300 dark:border-[#444] hover:bg-gray-100 dark:hover:bg-[#1f2937] disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="flex justify-center flex-wrap gap-4 mt-8">
      <button
        onClick={handlePrev}
        disabled={currentPage <= 1}
        className={buttonClasses}
      >
        Previous
      </button>
      <button
        onClick={handleNext}
        disabled={currentPage >= totalPages}
        className={buttonClasses}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;