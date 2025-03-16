import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Define project interface
interface Project {
    id: string;
    name: string;
    description: string;
    status: string;
    tags: string[];
    createdAt: string;
}

const ProjectList: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<string>('createdAt');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                // Replace with your actual API endpoint
                const response = await axios.get('/api/projects');
                setProjects(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching projects:', err);
                setError('Failed to load projects. Please try again later.');
                // For demo purposes, set some mock data
                setProjects([
                    {
                        id: '1',
                        name: 'AI Chat Application',
                        description: 'A chatbot using the latest LLM models',
                        status: 'in progress',
                        tags: ['AI', 'React'],
                        createdAt: '2023-10-15'
                    },
                    {
                        id: '2',
                        name: 'E-commerce Platform',
                        description: 'Modern online shopping platform',
                        status: 'completed',
                        tags: ['React', 'Node.js'],
                        createdAt: '2023-09-20'
                    },
                    {
                        id: '3',
                        name: 'Data Visualization Dashboard',
                        description: 'Interactive charts for business metrics',
                        status: 'on hold',
                        tags: ['D3.js', 'Analytics'],
                        createdAt: '2023-11-05'
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    // Sort projects based on selected criteria
    const sortedProjects = [...projects].sort((a, b) => {
        if (sortBy === 'name') {
            return a.name.localeCompare(b.name);
        } else if (sortBy === 'status') {
            return a.status.localeCompare(b.status);
        } else {
            // Default sort by createdAt (newest first)
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
    });

    // Filter projects by status
    const filteredProjects = filterStatus === 'all'
        ? sortedProjects
        : sortedProjects.filter(project => project.status === filterStatus);

    if (loading) {
        return <div className="flex justify-center p-8">Loading projects...</div>;
    }

    if (error && projects.length === 0) {
        return <div className="text-red-500 p-4">{error}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold">Projects</h1>

                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Sort dropdown */}
                    <div>
                        <label htmlFor="sort" className="block text-sm font-medium text-gray-700">Sort by</label>
                        <select
                            id="sort"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="createdAt">Date Created</option>
                            <option value="name">Name</option>
                            <option value="status">Status</option>
                        </select>
                    </div>

                    {/* Filter dropdown */}
                    <div>
                        <label htmlFor="filter" className="block text-sm font-medium text-gray-700">Filter by Status</label>
                        <select
                            id="filter"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="all">All Statuses</option>
                            <option value="in progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="on hold">On Hold</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Project grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.length > 0 ? (
                    filteredProjects.map((project) => (
                        <div
                            key={project.id}
                            className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                        >
                            <div className="flex justify-between items-start">
                                <h2 className="text-xl font-semibold text-gray-800 line-clamp-1">{project.name}</h2>
                                <span className={`px-2 py-1 text-xs rounded-full ${project.status === 'in progress' ? 'bg-blue-100 text-blue-800' :
                                    project.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {project.status}
                                </span>
                            </div>

                            <p className="mt-2 text-gray-600 line-clamp-2">{project.description}</p>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {project.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="bg-gray-100 text-gray-600 px-2 py-1 text-xs rounded"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <a
                                href={`/projects/${project.id}`}
                                className="mt-4 text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                            >
                                View Details
                                <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </a>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-8 text-gray-500">
                        No projects found matching your criteria.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectList; 