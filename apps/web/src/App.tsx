import React from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import Projects from './pages/Projects'
import SearchResults from './pages/SearchResults'
import { Link } from 'react-router-dom'

const App: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-indigo-600">
                        <Link to="/">Idea Hub</Link>
                    </h1>
                    <nav className="flex space-x-4">
                        <Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link>
                        <Link to="/projects" className="text-gray-600 hover:text-gray-900">Projects</Link>
                        <Link to="/search" className="text-gray-600 hover:text-gray-900">Search</Link>
                    </nav>
                </div>
            </header>

            <main>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/search" element={<SearchResults />} />
                    {/* Add more routes as needed */}
                </Routes>
            </main>
        </div>
    )
}

export default App 