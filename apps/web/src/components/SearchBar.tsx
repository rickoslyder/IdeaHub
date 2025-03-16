import React, { useState } from 'react';
import axios from 'axios';

interface SearchResult {
    id: string;
    name: string;
    type: 'project' | 'development';
    description?: string;
    content?: string;
    matchScore: number;
}

interface SearchBarProps {
    onResultsFound?: (results: SearchResult[]) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onResultsFound = () => { } }) => {
    const [query, setQuery] = useState<string>('');
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!query.trim()) return;

        try {
            setIsSearching(true);
            setSearchError(null);

            // Replace with your actual search API endpoint
            const response = await axios.get(`/api/search?q=${encodeURIComponent(query)}`);

            onResultsFound(response.data);
        } catch (err) {
            console.error('Search error:', err);
            setSearchError('Failed to perform search. Please try again.');

            // Mock results for development purposes
            const mockResults: SearchResult[] = [
                {
                    id: '1',
                    name: 'AI Chat Application',
                    type: 'project',
                    description: 'A chatbot using the latest LLM models',
                    matchScore: 0.92
                },
                {
                    id: '2',
                    name: 'Transformer-based text generation',
                    type: 'development',
                    content: 'New techniques for efficient transformer models with reduced memory footprint',
                    matchScore: 0.87
                },
                {
                    id: '3',
                    name: 'GPT-4 Integration Guide',
                    type: 'project',
                    description: 'Documentation on how to integrate GPT-4 into applications',
                    matchScore: 0.78
                }
            ];

            onResultsFound(mockResults);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search projects and developments..."
                        className="w-full px-4 py-2 pl-10 pr-16 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </div>
                    <button
                        type="submit"
                        disabled={isSearching || !query.trim()}
                        className="absolute inset-y-0 right-0 px-4 py-2 bg-indigo-600 text-white rounded-r-lg disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    >
                        {isSearching ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            "Search"
                        )}
                    </button>
                </div>
            </form>

            {searchError && (
                <div className="mt-2 text-red-500 text-sm">
                    {searchError}
                </div>
            )}
        </div>
    );
};

export default SearchBar; 