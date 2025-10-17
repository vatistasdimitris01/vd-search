import { supabase } from './supabaseClient';

interface LocationData {
    ip: string;
    city: string;
    country: string;
    country_code: string;
    latitude?: number;
    longitude?: number;
}

export const saveSearchQuery = async (query: string, location: LocationData) => {
    if (!query) return;
    
    const { error } = await supabase.from('search_history').insert({
        query,
        ip_address: location.ip,
        city: location.city,
        country: location.country,
        country_code: location.country_code,
        latitude: location.latitude,
        longitude: location.longitude,
    });

    if (error) {
        console.error('Error saving search query:', error);
    }
};

export interface SearchHistoryItem {
    id: string;
    created_at: string;
    query: string;
    ip_address: string;
    city: string;
    country: string;
    country_code: string;
    latitude: number;
    longitude: number;
}


export const fetchSearchHistory = async (): Promise<SearchHistoryItem[]> => {
    const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100); // Limit to last 100 searches for performance

    if (error) {
        console.error('Error fetching search history:', error);
        throw error;
    }

    return data || [];
};