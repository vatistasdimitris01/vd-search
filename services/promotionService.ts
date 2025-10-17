import { supabase } from './supabaseClient';
import type { Promotion } from '../types';

let promotionsCache: Promotion[] | null = null;
let queriesMap: Map<string, Promotion> | null = null;

const buildQueriesMap = (promotions: Promotion[]) => {
    const newMap = new Map<string, Promotion>();
    for (const promo of promotions) {
        for (const query of promo.queries) {
            newMap.set(query.toLowerCase().trim(), promo);
        }
    }
    queriesMap = newMap;
};

export const fetchAllPromotions = async (): Promise<Promotion[]> => {
    const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching promotions:', error);
        throw error;
    }
    
    // Cache the results for other functions to use
    promotionsCache = data || [];
    buildQueriesMap(promotionsCache);

    return JSON.parse(JSON.stringify(promotionsCache));
};

export const findPromotion = async (query: string): Promise<Promotion | null> => {
    // If cache is not populated yet, fetch all promotions first
    if (!promotionsCache) {
        await fetchAllPromotions();
    }
    
    return queriesMap?.get(query.toLowerCase().trim()) || null;
};

export const savePromotions = async (updatedPromotions: Promotion[]): Promise<void> => {
    const initialPromotions = promotionsCache || []; // Use cache from last fetch
    const initialIds = new Set(initialPromotions.map(p => p.id));

    const toInsert = updatedPromotions
        .filter(p => p.id.startsWith('new-'))
        .map(({ id, ...rest }) => rest); // Remove temporary client-side ID

    const toUpdate = updatedPromotions.filter(p => {
        if (p.id.startsWith('new-')) return false;
        const initial = initialPromotions.find(ip => ip.id === p.id);
        // Stringify to compare arrays and objects easily
        return initial && JSON.stringify(initial) !== JSON.stringify(p);
    });

    const toDelete = initialPromotions.filter(p => 
        !updatedPromotions.some(up => up.id === p.id)
    );

    const promises = [];

    if (toInsert.length > 0) {
        promises.push(supabase.from('promotions').insert(toInsert));
    }

    if (toUpdate.length > 0) {
        toUpdate.forEach(promo => {
            promises.push(supabase.from('promotions').update(promo).eq('id', promo.id));
        });
    }

    if (toDelete.length > 0) {
        const deleteIds = toDelete.map(p => p.id);
        promises.push(supabase.from('promotions').delete().in('id', deleteIds));
    }

    const results = await Promise.all(promises);

    results.forEach(res => {
        if (res.error) {
            console.error('Error saving promotions:', res.error);
            // In a real app, you might want to handle this more gracefully
            throw res.error;
        }
    });

    // Invalidate cache after saving
    promotionsCache = null;
    queriesMap = null;
};
