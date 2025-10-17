export type SearchType = 'all' | 'image';

export interface SearchResultItem {
  title: string;
  link: string;
  snippet?: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  url: string;
  queries: string[];
}

export interface SearchResponse {
  items?: SearchResultItem[];
  queries?: {
    nextPage?: { startIndex: number }[];
    previousPage?: { startIndex: number }[];
  };
  searchInformation?: {
    totalResults: string;
  };
  error?: {
    message: string;
  };
}
