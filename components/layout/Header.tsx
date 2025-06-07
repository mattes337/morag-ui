'use client';

interface HeaderProps {
    apiHealthy: boolean | null;
    onConfigClick: () => void;
}

export function Header({ apiHealthy, onConfigClick }: HeaderProps) {
    return (
        <header className="bg-white border-b border-gray-200" data-oid="oh73c.5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-oid="mbrui0s">
                <div className="flex justify-between items-center py-6" data-oid="zukjck5">
                    <div className="flex items-center space-x-4" data-oid="ds5z2fo">
                        <h1 className="text-3xl font-bold text-gray-900" data-oid="-1nc7e_">
                            MoRAG
                        </h1>
                        <span className="text-sm text-gray-500" data-oid="sn--95e">
                            Management Interface
                        </span>
                    </div>
                    <div className="flex items-center space-x-4" data-oid="4run6bl">
                        <span className="text-sm text-gray-600" data-oid="nco4m5_">
                            Vector Database & RAG Management
                        </span>
                        <div className="flex items-center space-x-2" data-oid="_yn69zu">
                            <div
                                className={`w-2 h-2 rounded-full ${apiHealthy === true ? 'bg-green-500' : apiHealthy === false ? 'bg-red-500' : 'bg-yellow-500'}`}
                                data-oid="8k6ufpb"
                            ></div>
                            <span className="text-xs text-gray-500" data-oid="-7dy2jz">
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
                                data-oid="3saq-:4"
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
