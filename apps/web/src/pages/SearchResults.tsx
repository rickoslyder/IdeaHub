import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';

interface SearchResult {
    id: string;
    name: string;
    type: 'project' | 'development';
    description?: string;
    content?: string;
    matchScore: number;
}

const SearchResults: React.FC = () => {
    const [results, setResults] = useState<SearchResult[]>([]);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Search</h1>

            <SearchBar onResultsFound={setResults} />

            <div className="mt-8">
                {results.length > 0 ? (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold">Search Results ({results.length})</h2>

                        <div className="divide-y divide-gray-200">
                            {results.map((result) => (
                                <div key={`${result.type}-${result.id}`} className="py-4">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 mt-1">
                                            {result.type === 'project' ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    Project
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Development
                                                </span>
                                            )}
                                        </div>

                                        <div className="ml-4 flex-1">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                <a
                                                    href={result.type === 'project' ? `/projects/${result.id}` : `/developments/${result.id}`}
                                                    className="hover:underline"
                                                >
                                                    {result.name}
                                                </a>
                                            </h3>

                                            <p className="mt-1 text-sm text-gray-600">
                                                {result.description || result.content}
                                            </p>

                                            <div className="mt-2 flex items-center text-sm text-gray-500">
                                                <span className="inline-flex items-center">
                                                    <svg className="mr-1.5 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11.414l5.707-5.707-1.414-1.414L10 11.586 7.707 9.293 6.293 10.707 10 14.414z" clipRule="evenodd" />
                                                    </svg>
                                                    Match Score: {Math.round(result.matchScore * 100)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="mt-16 text-center text-gray-500">
                        <p>Search for projects and developments to see results here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResults; 