'use client';

interface HeaderProps {
    apiHealthy: boolean | null;
    onConfigClick: () => void;
}

export function Header({ apiHealthy, onConfigClick }: HeaderProps) {
    return (
        <header className="bg-white border-b border-gray-200" data-oid="9b.et-5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-oid="alp_49j">
                <div className="flex justify-between items-center py-6" data-oid="junorlo">
                    <div className="flex items-center space-x-4" data-oid="phr-0nt">
                        <h1 className="text-3xl font-bold text-gray-900" data-oid="o6vop1f">
                            MoRAG
                        </h1>
                        <span className="text-sm text-gray-500" data-oid="m:_spt0">
                            Management Interface
                        </span>
                    </div>
                    <div className="flex items-center space-x-4" data-oid="s_ensf0">
                        <span className="text-sm text-gray-600" data-oid="zwk6asf">
                            Vector Database & RAG Management
                        </span>
                        <div className="flex items-center space-x-2" data-oid="api-status">
                            <div
                                className={`w-2 h-2 rounded-full ${apiHealthy === true ? 'bg-green-500' : apiHealthy === false ? 'bg-red-500' : 'bg-yellow-500'}`}
                                data-oid="status-indicator"
                            ></div>
                            <span className="text-xs text-gray-500" data-oid="status-text">
                                API{' '}
                                {apiHealthy === true
                                    ? 'Connected'
                                    : apiHealthy === false
                                      ? 'Disconnected'
                                      : 'Checking...'}
                            </span>
                            <button
                                onClick={onConfigClick}
                                className="text-xs text-blue-600 hover:text-blue-800"
                                data-oid="config-btn"
                            >
                                Configure
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
