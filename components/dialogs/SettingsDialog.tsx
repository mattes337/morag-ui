'use client';

import { useApp } from '../../contexts/AppContext';
import { UserSettings } from '../../types';
import { useState } from 'react';

export function SettingsDialog() {
    const { showSettingsDialog, setShowSettingsDialog, userSettings, setUserSettings } = useApp();

    const [localSettings, setLocalSettings] = useState<UserSettings>(userSettings);

    if (!showSettingsDialog) return null;

    const handleSave = () => {
        setUserSettings(localSettings);
        setShowSettingsDialog(false);
    };

    const handleCancel = () => {
        setLocalSettings(userSettings);
        setShowSettingsDialog(false);
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            data-oid="8mwx06t"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md" data-oid="jjlbxw4">
                <div className="flex justify-between items-center mb-4" data-oid="irk1kud">
                    <h2 className="text-xl font-semibold" data-oid="mca6t9r">
                        Settings
                    </h2>
                    <button
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-gray-600"
                        data-oid="1h.k7ro"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            data-oid="pi:g402"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                                data-oid="7qyva0h"
                            />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4" data-oid="asgs..d">
                    {/* Theme Setting */}
                    <div data-oid="azyfx:4">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="2z..nrd"
                        >
                            Theme
                        </label>
                        <select
                            value={localSettings.theme}
                            onChange={(e) =>
                                setLocalSettings({
                                    ...localSettings,
                                    theme: e.target.value as 'light' | 'dark' | 'system',
                                })
                            }
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            data-oid="34o1hdz"
                        >
                            <option value="light" data-oid="bi6tf5-">
                                Light
                            </option>
                            <option value="dark" data-oid="yukw6xj">
                                Dark
                            </option>
                            <option value="system" data-oid="v9_7d7s">
                                System
                            </option>
                        </select>
                    </div>

                    {/* Language Setting */}
                    <div data-oid="yhajlzv">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="qd:cgab"
                        >
                            Language
                        </label>
                        <select
                            value={localSettings.language}
                            onChange={(e) =>
                                setLocalSettings({
                                    ...localSettings,
                                    language: e.target.value,
                                })
                            }
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            data-oid="g.9bw.x"
                        >
                            <option value="en" data-oid="y1otdtj">
                                English
                            </option>
                            <option value="es" data-oid="7u7eqx4">
                                Spanish
                            </option>
                            <option value="fr" data-oid="sqx.9.b">
                                French
                            </option>
                            <option value="de" data-oid="hoy99tj">
                                German
                            </option>
                        </select>
                    </div>

                    {/* Notifications Setting */}
                    <div className="flex items-center justify-between" data-oid="t75bqmp">
                        <label className="text-sm font-medium text-gray-700" data-oid="lbwdu9:">
                            Enable Notifications
                        </label>
                        <input
                            type="checkbox"
                            checked={localSettings.notifications}
                            onChange={(e) =>
                                setLocalSettings({
                                    ...localSettings,
                                    notifications: e.target.checked,
                                })
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            data-oid="ur3mq9b"
                        />
                    </div>

                    {/* Auto Save Setting */}
                    <div className="flex items-center justify-between" data-oid="aqiqo9h">
                        <label className="text-sm font-medium text-gray-700" data-oid="2ihb:9o">
                            Auto Save
                        </label>
                        <input
                            type="checkbox"
                            checked={localSettings.autoSave}
                            onChange={(e) =>
                                setLocalSettings({
                                    ...localSettings,
                                    autoSave: e.target.checked,
                                })
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            data-oid="2hf:5mb"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6" data-oid="k.2fwuh">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                        data-oid="6g2:._f"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                        data-oid="6ewbvmt"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
