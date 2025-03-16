import React from 'react'

const HomePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="bg-primary shadow-md p-4">
                <div className="container mx-auto">
                    <h1 className="text-2xl font-bold text-white">Idea Hub</h1>
                </div>
            </header>

            <main className="flex-grow container mx-auto p-4">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Welcome to Idea Hub</h2>
                    <p className="text-gray-700 mb-4">
                        Manage and visualize your projects with AI-powered relevance matching.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <FeatureCard
                            title="Project Management"
                            description="Create, view, and organize projects with tagging and status tracking"
                        />
                        <FeatureCard
                            title="Integrations"
                            description="Link GitHub repositories and local folders to your projects"
                        />
                        <FeatureCard
                            title="AI-Powered Matching"
                            description="Find relevant projects for new developments and vice versa"
                        />
                    </div>
                </div>
            </main>

            <footer className="bg-gray-800 text-white p-4 text-center">
                <p>© {new Date().getFullYear()} Idea Hub - AI-Powered Project Management</p>
            </footer>
        </div>
    )
}

interface FeatureCardProps {
    title: string
    description: string
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description }) => {
    return (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-primary transition-colors">
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    )
}

export default HomePage 