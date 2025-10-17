import { API_KEY, CX } from '../constants';
import type { SearchResponse, SearchType } from '../types';

export const fetchResults = async (
  query: string,
  start: number,
  searchType: SearchType,
  countryCode?: string
): Promise<SearchResponse> => {
  const searchTypeParam = searchType === 'image' ? '&searchType=image' : '';
  const countryParam = countryCode ? `&gl=${countryCode}` : '';
  const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX}&q=${encodeURIComponent(
    query
  )}&start=${start}${searchTypeParam}${countryParam}`;

  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const fetchSuggestions = (query: string): Promise<string[]> => {
  if (!query.trim()) return Promise.resolve([]);

  return new Promise((resolve, reject) => {
    // Generate a unique callback name to avoid conflicts
    const callbackName = `googleSuggestionsCallback_${Date.now()}`;
    const script = document.createElement('script');
    script.id = `suggestionScript_${callbackName}`;

    // Define the global callback function
    (window as any)[callbackName] = (data: any) => {
      // Clean up the script and the global callback function
      delete (window as any)[callbackName];
      document.body.removeChild(script);

      // Resolve the promise with the suggestions
      if (Array.isArray(data) && data.length > 1 && Array.isArray(data[1])) {
        resolve(data[1]);
      } else {
        resolve([]);
      }
    };

    script.src = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}&callback=${callbackName}`;
    script.onerror = (err) => {
      // Clean up on error
      delete (window as any)[callbackName];
      document.body.removeChild(script);
      console.error("Failed to fetch suggestions:", err);
      // Resolve with empty array instead of rejecting to prevent crashes
      resolve([]);
    };

    document.body.appendChild(script);
  });
};