'use client';

interface HeaderProps {
    apiHealthy: boolean | null;
    onConfigClick: () => void;
}

export function Header({ apiHealthy, onConfigClick }: HeaderProps) {
    return (
        <header className="bg-white border-b border-gray-200" data-oid="bcmxm-h">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-oid="92.ne:b">
                <div className="flex justify-between items-center py-6" data-oid="ufv21jq">
                    <div className="flex items-center space-x-4" data-oid="xd0w94l">
                        <h1 className="text-3xl font-bold text-gray-900" data-oid=".g4.vz6">
                            MoRAG
                        </h1>
                        <span className="text-sm text-gray-500" data-oid="1dfs_:3">
                            Management Interface
                        </span>
                    </div>
                    <div className="flex items-center space-x-4" data-oid="epw09wv">
                        <span className="text-sm text-gray-600" data-oid="9zpzr77">
                            Vector Database & RAG Management
                        </span>
                        <div className="flex items-center space-x-2" data-oid=".crej:4">
                            <div
                                className={`w-2 h-2 rounded-full ${apiHealthy === true ? 'bg-green-500' : apiHealthy === false ? 'bg-red-500' : 'bg-yellow-500'}`}
                                data-oid="xm_wsnf"
                            ></div>
                            <span className="text-xs text-gray-500" data-oid="nrc1hjs">
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
                                data-oid="m8cfxne"
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
