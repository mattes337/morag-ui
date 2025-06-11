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
            data-oid="y1oar9w"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md" data-oid="_a-mbig">
                <div className="flex justify-between items-center mb-4" data-oid="ocj93vu">
                    <h2 className="text-xl font-semibold" data-oid="c_62l15">
                        Settings
                    </h2>
                    <button
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-gray-600"
                        data-oid="teekq2e"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            data-oid=".9tawfs"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                                data-oid="exr-k.6"
                            />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4" data-oid="5bzt7r0">
                    {/* Theme Setting */}
                    <div data-oid="w8g:yih">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="4bspt5h"
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
                            data-oid="otvqt4d"
                        >
                            <option value="light" data-oid="y76uwmw">
                                Light
                            </option>
                            <option value="dark" data-oid="1qb68ia">
                                Dark
                            </option>
                            <option value="system" data-oid="mcfjrwx">
                                System
                            </option>
                        </select>
                    </div>

                    {/* Language Setting */}
                    <div data-oid="vcnfl9-">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="hvkdih9"
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
                            data-oid="xwl96r."
                        >
                            <option value="en" data-oid="8iagu47">
                                English
                            </option>
                            <option value="es" data-oid="z74jch4">
                                Spanish
                            </option>
                            <option value="fr" data-oid="0j_n0s.">
                                French
                            </option>
                            <option value="de" data-oid="0hw.-r-">
                                German
                            </option>
                        </select>
                    </div>

                    {/* Notifications Setting */}
                    <div className="flex items-center justify-between" data-oid="dck06ez">
                        <label className="text-sm font-medium text-gray-700" data-oid="y61ff4l">
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
                            data-oid="f7.38hr"
                        />
                    </div>

                    {/* Auto Save Setting */}
                    <div className="flex items-center justify-between" data-oid="8g__8dw">
                        <label className="text-sm font-medium text-gray-700" data-oid="74:uwkj">
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
                            data-oid="-uuw2uf"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6" data-oid="0z7z4f0">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                        data-oid="dq_z30q"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                        data-oid="clg7k22"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
