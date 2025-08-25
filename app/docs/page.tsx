'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DocsPage() {
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/status?credentials=true')
      .then(res => res.json())
      .then(data => {
        setApiStatus(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch API status:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading API documentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Morag API Documentation</h1>
          
          <div className="prose max-w-none">
            <p className="text-lg text-gray-600 mb-8">
              Welcome to the Morag API! This documentation will help you get started with automating document processing and management.
            </p>

            {/* Quick Start Section */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">🚀 Quick Start</h2>
              
              {apiStatus?.defaultCredentials ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Default Credentials</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-blue-800 mb-2">API Access</h4>
                      <p className="text-sm text-blue-700 mb-1">Default API Key:</p>
                      <code className="bg-blue-100 px-2 py-1 rounded text-sm">{apiStatus.defaultCredentials.api.defaultKey}</code>
                      
                      {apiStatus.defaultCredentials.api.genericKey !== 'Not configured' && (
                        <>
                          <p className="text-sm text-blue-700 mb-1 mt-3">Generic API Key (Automation):</p>
                          <code className="bg-blue-100 px-2 py-1 rounded text-sm">{apiStatus.defaultCredentials.api.genericKey}</code>
                        </>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800 mb-2">Web UI Access</h4>
                      <p className="text-sm text-blue-700 mb-1">Email:</p>
                      <code className="bg-blue-100 px-2 py-1 rounded text-sm">{apiStatus.defaultCredentials.ui.email}</code>
                      <p className="text-sm text-blue-700 mb-1 mt-2">Password:</p>
                      <code className="bg-blue-100 px-2 py-1 rounded text-sm">{apiStatus.defaultCredentials.ui.password}</code>
                    </div>
                  </div>
                  
                  {apiStatus.database.isEmpty && (
                    <div className="bg-yellow-100 border border-yellow-300 rounded p-3 mt-4">
                      <p className="text-yellow-800 text-sm">
                        <strong>Note:</strong> Database is empty. These credentials will be created automatically on first API call.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">API Key Required</h3>
                  <p className="text-amber-800">Contact your administrator to get an API key for accessing the Morag API.</p>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Test the API</h3>
                <p className="text-gray-600 mb-3">Try this example request:</p>
                <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
{apiStatus?.defaultCredentials ? 
`curl -H "Authorization: Bearer ${apiStatus.defaultCredentials.api.defaultKey}" \\
     ${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/api/realms` :
`curl -H "Authorization: Bearer YOUR_API_KEY" \\
     ${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/api/realms`}
                </pre>
              </div>
            </section>

            {/* Navigation Section */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">📚 Documentation</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Link href="/swagger" className="block bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 transition-colors">
                  <h3 className="font-semibold text-blue-900 mb-2">🔧 Interactive API Explorer</h3>
                  <p className="text-blue-700 text-sm">Test API endpoints directly in your browser with Swagger UI</p>
                </Link>
                
                <a href="/api/openapi" target="_blank" className="block bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-4 transition-colors">
                  <h3 className="font-semibold text-green-900 mb-2">📋 OpenAPI Specification</h3>
                  <p className="text-green-700 text-sm">Download the complete API specification for code generation</p>
                </a>
              </div>
            </section>

            {/* API Overview */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">🔗 API Endpoints</h2>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">User Management</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li><code className="bg-gray-100 px-2 py-1 rounded">GET /api/users</code> - List users</li>
                    <li><code className="bg-gray-100 px-2 py-1 rounded">POST /api/users</code> - Create user (onboard)</li>
                    <li><code className="bg-gray-100 px-2 py-1 rounded">DELETE /api/users/[email]</code> - Delete user (offboard)</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Document Management</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li><code className="bg-gray-100 px-2 py-1 rounded">GET /api/documents</code> - List documents</li>
                    <li><code className="bg-gray-100 px-2 py-1 rounded">POST /api/documents</code> - Upload document</li>
                    <li><code className="bg-gray-100 px-2 py-1 rounded">DELETE /api/documents/[id]</code> - Delete document</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Job Management</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li><code className="bg-gray-100 px-2 py-1 rounded">GET /api/processing-jobs</code> - List jobs</li>
                    <li><code className="bg-gray-100 px-2 py-1 rounded">POST /api/processing-jobs</code> - Start job</li>
                    <li><code className="bg-gray-100 px-2 py-1 rounded">DELETE /api/processing-jobs</code> - Stop jobs</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Database Status */}
            {apiStatus && (
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">📊 System Status</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{apiStatus.database.users}</div>
                      <div className="text-sm text-gray-600">Users</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{apiStatus.database.realms}</div>
                      <div className="text-sm text-gray-600">Realms</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{apiStatus.database.apiKeys}</div>
                      <div className="text-sm text-gray-600">API Keys</div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Footer */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">🆘 Need Help?</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <ul className="space-y-2 text-gray-600">
                  <li>• Check the <Link href="/swagger" className="text-blue-600 hover:underline">interactive API explorer</Link></li>
                  <li>• Review the <a href="/api/openapi" className="text-blue-600 hover:underline">OpenAPI specification</a></li>
                  <li>• Contact your system administrator</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
