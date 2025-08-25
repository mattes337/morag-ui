'use client';

import { useEffect, useState } from 'react';

export default function SwaggerUI() {
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch API status to get default credentials
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

  useEffect(() => {
    // Dynamically load Swagger UI
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js';
    script.onload = () => {
      // Initialize Swagger UI
      (window as any).SwaggerUIBundle({
        url: '/api/openapi',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          (window as any).SwaggerUIBundle.presets.apis,
          (window as any).SwaggerUIBundle.presets.standalone
        ],
        plugins: [
          (window as any).SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        tryItOutEnabled: true,
        requestInterceptor: (request: any) => {
          // Add default headers
          request.headers['Content-Type'] = 'application/json';
          return request;
        },
        responseInterceptor: (response: any) => {
          return response;
        }
      });
    };
    document.head.appendChild(script);

    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css';
    document.head.appendChild(link);

    return () => {
      // Cleanup
      document.head.removeChild(script);
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Morag API Documentation</h1>
          {loading ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <p className="text-gray-600">Loading API status...</p>
            </div>
          ) : apiStatus ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Getting Started</h2>
              <div className="text-blue-800 space-y-2">
                {apiStatus.defaultCredentials ? (
                  <>
                    <p><strong>Default API Key:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{apiStatus.defaultCredentials.api.defaultKey}</code></p>
                    {apiStatus.defaultCredentials.api.genericKey !== 'Not configured' && (
                      <p><strong>Generic API Key:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{apiStatus.defaultCredentials.api.genericKey}</code></p>
                    )}
                    <p><strong>Authentication:</strong> Add <code className="bg-blue-100 px-2 py-1 rounded">Authorization: Bearer your-api-key</code> header</p>
                    <p><strong>Base URL:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{typeof window !== 'undefined' ? window.location.origin : ''}/api</code></p>
                    {apiStatus.database.isEmpty && (
                      <div className="bg-yellow-100 border border-yellow-300 rounded p-2 mt-2">
                        <p className="text-yellow-800 text-sm"><strong>Note:</strong> Database is empty. Default credentials will be created on first API call.</p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <p><strong>API Key Required:</strong> Contact your administrator for an API key</p>
                    <p><strong>Authentication:</strong> Add <code className="bg-blue-100 px-2 py-1 rounded">Authorization: Bearer your-api-key</code> header</p>
                    <p><strong>Base URL:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{typeof window !== 'undefined' ? window.location.origin : ''}/api</code></p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">Failed to load API status. Please refresh the page.</p>
            </div>
          )}
        </div>
        <div id="swagger-ui"></div>
      </div>
    </div>
  );
}
