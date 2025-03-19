function App() {
    return (
        <div className="bg-slate-100 min-h-screen text-neutral-800 p-8 font-sans">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-blue-600 mb-4">Idea Hub</h1>
                    <p className="text-xl mb-8">Manage and visualize your projects with AI-powered relevance matching.</p>
                </div>

                <div className="border border-neutral-200 rounded-lg p-6 mb-4">
                    <h2 className="text-2xl font-semibold mb-2">Project Management</h2>
                    <p>Create, view, and organize projects with tagging and status tracking</p>
                </div>

                <div className="border border-neutral-200 rounded-lg p-6 mb-4">
                    <h2 className="text-2xl font-semibold mb-2">Integrations</h2>
                    <p>Link GitHub repositories and local folders to your projects</p>
                </div>

                <div className="border border-neutral-200 rounded-lg p-6">
                    <h2 className="text-2xl font-semibold mb-2">AI-Powered Matching</h2>
                    <p>Find relevant projects for new developments and vice versa</p>
                </div>
            </div>
        </div>
    );
}

export default App; 