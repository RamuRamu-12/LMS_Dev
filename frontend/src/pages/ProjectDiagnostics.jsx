import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

const ProjectDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDiagnostics = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/realtime-projects/diagnose`);
        const data = await response.json();
        setDiagnostics(data.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDiagnostics();
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading diagnostics...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center text-red-600">
            <h2 className="text-2xl font-bold mb-2">Error</h2>
            <p>{error}</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Project Diagnostics</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Path Information</h2>
            <div className="space-y-2">
              <p><strong>Projects Path:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{diagnostics.projectsPath}</code></p>
              <p><strong>Path Exists:</strong> <span className={diagnostics.pathExists ? 'text-green-600' : 'text-red-600'}>
                {diagnostics.pathExists ? '✓ Yes' : '✗ No'}
              </span></p>
              <p><strong>Environment Variable:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{diagnostics.envPath}</code></p>
            </div>
          </div>

          {diagnostics.errors && diagnostics.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-red-800 mb-4">Errors</h2>
              <ul className="list-disc list-inside space-y-2">
                {diagnostics.errors.map((err, index) => (
                  <li key={index} className="text-red-700">{err}</li>
                ))}
              </ul>
            </div>
          )}

          {diagnostics.directoryContents && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Directory Contents</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {diagnostics.directoryContents.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.isDirectory ? '📁 Directory' : item.isFile ? '📄 File' : 'Unknown'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {diagnostics.discoveredProjects && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Discovered Projects</h2>
              {diagnostics.discoveredProjects.length === 0 ? (
                <p className="text-gray-600">No projects found.</p>
              ) : (
                <div className="space-y-4">
                  {diagnostics.discoveredProjects.map((project, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">{project.name}</h3>
                        <span className={project.hasIndexHtml ? 'text-green-600' : 'text-red-600'}>
                          {project.hasIndexHtml ? '✓ Has index.html' : '✗ Missing index.html'}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><strong>ID:</strong> {project.id}</p>
                        <p><strong>Folder:</strong> {project.folderName}</p>
                        <p><strong>Path:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-xs">{project.path}</code></p>
                        <p><strong>Index Path:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-xs">{project.indexPath}</code></p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProjectDiagnostics;

