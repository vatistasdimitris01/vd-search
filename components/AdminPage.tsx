import React, { useState, useEffect, useCallback } from 'react';
import type { Promotion } from '../types';
import { fetchSearchHistory, SearchHistoryItem } from '../services/historyService';
import { fetchAllPromotions } from '../services/promotionService';

interface AdminPageProps {
    initialPromotions: Promotion[];
    onSave: (updatedPromotions: Promotion[]) => Promise<void>;
    onBack: () => void;
}

const MAX_TITLE_LENGTH = 160;
const MAX_URL_LENGTH = 2000;
const MAX_DESC_LENGTH = 200;

const LabeledInput = ({ id, label, value, onChange, maxLength, required, as: Component = 'input', ...props }: any) => (
    <div className="relative">
        <Component
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            maxLength={maxLength}
            required={required}
            className={`block px-3.5 pb-2.5 pt-5 w-full text-sm bg-transparent rounded-lg border border-gray-300 dark:border-gray-600 appearance-none dark:text-white focus:outline-none focus:ring-0 focus:border-blue-600 peer ${Component === 'textarea' ? 'min-h-[100px]' : ''}`}
            placeholder=" " // Important for label transition
            {...props}
        />
        <label
            htmlFor={id}
            className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] start-3.5 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4"
        >
            {label}{required && '*'}
        </label>
        {maxLength && <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1 pr-1">{value.length}/{maxLength}</div>}
    </div>
);

const AdminPage: React.FC<AdminPageProps> = ({ initialPromotions, onSave, onBack }) => {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formState, setFormState] = useState<Omit<Promotion, 'id'>>({ title: '', description: '', url: '', queries: [] });
    const [newQuery, setNewQuery] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'promotions' | 'history'>('promotions');
    const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        setPromotions(initialPromotions);
    }, [initialPromotions]);

    const loadHistory = useCallback(async () => {
        setHistoryLoading(true);
        try {
            const historyData = await fetchSearchHistory();
            setSearchHistory(historyData);
        } catch (err) {
            console.error("Failed to load search history", err);
            alert('Failed to load search history.');
        } finally {
            setHistoryLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'history') {
            loadHistory();
        }
    }, [activeTab, loadHistory]);

    const handleRefresh = async () => {
        if (isRefreshing) return;
        setIsRefreshing(true);

        if (activeTab === 'promotions') {
            try {
                const data = await fetchAllPromotions();
                setPromotions(data);
            } catch (err) {
                 console.error("Failed to refresh promotions", err);
                 alert('Failed to refresh promotions.');
            }
        } else if (activeTab === 'history') {
            await loadHistory();
        }
        
        setIsRefreshing(false);
    };

    const handleEdit = (promo: Promotion) => {
        setEditingId(promo.id);
        setFormState({ ...promo });
    };
    
    const handleCancel = () => {
        setEditingId(null);
        setFormState({ title: '', description: '', url: '', queries: [] });
        setNewQuery('');
    };

    const handleSave = (id: string) => {
        if (!formState.title || !formState.url) {
            alert('Title and URL are required.');
            return;
        }
        setPromotions(promotions.map(p => p.id === id ? { ...formState, id } : p));
        handleCancel();
    };
    
    const handleAddNew = () => {
        const newId = `new-${crypto.randomUUID()}`;
        const newPromo: Promotion = { id: newId, title: '', description: '', url: '', queries: [] };
        setPromotions([newPromo, ...promotions]);
        handleEdit(newPromo);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this promotion?')) {
            setPromotions(promotions.filter(p => p.id !== id));
            if (editingId === id) {
                handleCancel();
            }
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState({ ...formState, [name]: value });
    };

    const handleAddQuery = () => {
        const trimmedQuery = newQuery.trim();
        if (trimmedQuery && !formState.queries.includes(trimmedQuery) && formState.queries.length < 100) {
            setFormState(prevState => ({
                ...prevState,
                queries: [...prevState.queries, trimmedQuery]
            }));
            setNewQuery('');
        }
    };

    const handleRemoveQuery = (queryToRemove: string) => {
        setFormState(prevState => ({
            ...prevState,
            queries: prevState.queries.filter(q => q !== queryToRemove)
        }));
    };

    const handleFinalSave = async () => {
        setIsSaving(true);
        try {
            await onSave(promotions);
        } catch (error) {
            alert('Failed to save promotions. Check the console for details.');
        } finally {
            setIsSaving(false);
        }
    };
    
    const btnPrimary = "inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";
    const btnSecondary = "inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600";

    const TabButton = ({ tab, label }: { tab: 'promotions' | 'history', label: string }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-md border-b-2 transition-colors ${
                activeTab === tab 
                ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
        >
            {label}
        </button>
    );

    const renderPromotionView = (promo: Promotion) => (
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center">
            <div className="break-words min-w-0">
                <h2 className="font-bold text-lg text-blue-600 dark:text-blue-400">{promo.title}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{promo.url}</p>
                <p className="text-xs text-gray-500 mt-2"><b>Queries:</b> {promo.queries.join(', ')}</p>
            </div>
            <div className="flex gap-2 justify-self-start md:justify-self-end">
                <button onClick={() => handleEdit(promo)} className={btnSecondary}>Edit</button>
                <button onClick={() => handleDelete(promo.id)} aria-label="Delete" className="p-2 text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>
        </div>
    );

    const renderEditForm = (promo: Promotion) => (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 sm:p-6 rounded-b-lg space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Edit promotion</h2>
            
            {/* Live Preview */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview:</label>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-blue-600 dark:text-[#58a6ff] text-lg break-words">{formState.title || 'Promotion title'}</h3>
                    <p className="text-green-600 dark:text-green-400 text-sm break-all">{formState.url || 'https://example.com/'}</p>
                    <p className="text-gray-600 dark:text-[#c9d1d9] mt-2 text-sm">{formState.description || 'Promotion description text will appear here.'}</p>
                </div>
            </div>

            {/* Trigger Query Input */}
            <div>
                <label htmlFor="trigger-query" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Promotion triggering query
                </label>
                <div className="flex">
                    <input
                        id="trigger-query"
                        type="text"
                        value={newQuery}
                        onChange={(e) => setNewQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddQuery(); }}}
                        className="flex-grow w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 rounded-l-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., AI"
                    />
                    <button type="button" onClick={handleAddQuery} className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md bg-gray-50 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500">Add</button>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Add queries that will trigger this promotion. Max 100 queries. {formState.queries.length}/100</p>
                <div className="mt-2 flex flex-wrap gap-2 empty:hidden min-h-[28px]">
                    {formState.queries.map(q => (
                        <span key={q} className="inline-flex items-center py-1 pl-3 pr-2 rounded-full text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                            {q}
                            <button type="button" onClick={() => handleRemoveQuery(q)} className="ml-1.5 flex-shrink-0 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none rounded-full p-0.5 hover:bg-gray-300 dark:hover:bg-gray-600">
                                <span className="sr-only">Remove query</span>
                                <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </span>
                    ))}
                </div>
            </div>
            
            {/* Form Fields */}
            <div className="space-y-4">
                <LabeledInput
                    id="title"
                    label="Promotion title"
                    value={formState.title}
                    onChange={handleInputChange}
                    maxLength={MAX_TITLE_LENGTH}
                    required
                />
                <LabeledInput
                    id="url"
                    label="Promotion link"
                    type="url"
                    value={formState.url}
                    onChange={handleInputChange}
                    maxLength={MAX_URL_LENGTH}
                    required
                />
                <LabeledInput
                    as="textarea"
                    id="description"
                    label="Promotion description"
                    value={formState.description}
                    onChange={handleInputChange}
                    maxLength={MAX_DESC_LENGTH}
                />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
                <button onClick={handleCancel} className={btnSecondary}>Cancel</button>
                <button onClick={() => handleSave(promo.id)} className={btnPrimary}>Save Changes</button>
            </div>
        </div>
    );

    const renderPromotionsTab = () => (
        <>
            <div className="text-right">
                <button onClick={handleAddNew} className={btnPrimary}>Add New Promotion</button>
            </div>
            <div className="space-y-4">
                {promotions.map(promo => (
                    <div key={promo.id} className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                        {editingId === promo.id ? renderEditForm(promo) : renderPromotionView(promo)}
                    </div>
                ))}
            </div>
            <footer className="mt-8 text-center">
                <button 
                    onClick={handleFinalSave} 
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg disabled:opacity-50 disabled:cursor-wait w-full sm:w-auto"
                >
                    {isSaving ? 'Saving...' : 'Save All Changes to Database'}
                </button>
            </footer>
        </>
    );

    const renderHistoryTab = () => (
        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
            {historyLoading ? (
                <p className="p-6 text-center">Loading history...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Query</th>
                                <th scope="col" className="px-6 py-3">Timestamp</th>
                                <th scope="col" className="px-6 py-3">Location</th>
                                <th scope="col" className="px-6 py-3">Country Code</th>
                                <th scope="col" className="px-6 py-3">Coordinates</th>
                                <th scope="col" className="px-6 py-3">IP Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            {searchHistory.map(item => (
                                <tr key={item.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/20">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{item.query}</td>
                                    <td className="px-6 py-4">{new Date(item.created_at).toLocaleString()}</td>
                                    <td className="px-6 py-4">{item.city || 'N/A'}, {item.country || 'N/A'}</td>
                                    <td className="px-6 py-4">{item.country_code || 'N/A'}</td>
                                    <td className="px-6 py-4">{item.latitude && item.longitude ? `${Number(item.latitude).toFixed(4)}, ${Number(item.longitude).toFixed(4)}` : 'N/A'}</td>
                                    <td className="px-6 py-4">{item.ip_address}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    const isDataLoading = isRefreshing || (activeTab === 'history' && historyLoading);

    return (
        <div className="bg-gray-100 dark:bg-[#0d1117] text-gray-900 dark:text-white min-h-screen w-full p-4 sm:p-8 font-sans">
            <header className="flex items-center justify-between mb-8 max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold">Admin Panel</h1>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleRefresh} 
                        disabled={isDataLoading} 
                        className={`${btnSecondary} flex items-center gap-2 disabled:opacity-50 disabled:cursor-wait`}
                        aria-label="Refresh data"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isDataLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4a14.95 14.95 0 0114.394 9.193M20 20a14.95 14.95 0 01-14.394-9.193" />
                        </svg>
                        <span>Refresh</span>
                    </button>
                    <button onClick={onBack} className={btnSecondary}>Back to Search</button>
                </div>
            </header>
            <main className="max-w-5xl mx-auto space-y-6">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                        <TabButton tab="promotions" label="Promotions" />
                        <TabButton tab="history" label="Search History" />
                    </nav>
                </div>
                <div className="mt-6">
                    {activeTab === 'promotions' ? renderPromotionsTab() : renderHistoryTab()}
                </div>
            </main>
        </div>
    );
};

export default AdminPage;