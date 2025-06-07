'use client';

interface HeaderProps {
    apiHealthy: boolean | null;
    onConfigClick: () => void;
}

export function Header({ apiHealthy, onConfigClick }: HeaderProps) {
    return (
        <header className="bg-white border-b border-gray-200" data-oid="i4m1.:3">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-oid="26:7x1:">
                <div className="flex justify-between items-center py-6" data-oid="w2gs_xk">
                    <div className="flex items-center space-x-4" data-oid="kuiz4zd">
                        <h1 className="text-3xl font-bold text-gray-900" data-oid="qgrmq_h">
                            MoRAG
                        </h1>
                        <span className="text-sm text-gray-500" data-oid="bng0em6">
                            Management Interface
                        </span>
                    </div>
                    <div className="flex items-center space-x-4" data-oid="84i3zy7">
                        <span className="text-sm text-gray-600" data-oid="d2-nay5">
                            Vector Database & RAG Management
                        </span>
                        <div className="flex items-center space-x-2" data-oid="eb8xliz">
                            <div
                                className={`w-2 h-2 rounded-full ${apiHealthy === true ? 'bg-green-500' : apiHealthy === false ? 'bg-red-500' : 'bg-yellow-500'}`}
                                data-oid="woq_ov5"
                            ></div>
                            <span className="text-xs text-gray-500" data-oid="pm5vgrf">
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
                                data-oid="5es0hpn"
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
