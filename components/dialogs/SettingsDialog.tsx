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
            data-oid=":4ca58s"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md" data-oid="a5qyjph">
                <div className="flex justify-between items-center mb-4" data-oid="sfr49q5">
                    <h2 className="text-xl font-semibold" data-oid=":w:w:36">
                        Settings
                    </h2>
                    <button
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-gray-600"
                        data-oid="lexcc.i"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            data-oid="0wp1dj."
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                                data-oid="6zwkdog"
                            />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4" data-oid="t1zq9el">
                    {/* Theme Setting */}
                    <div data-oid="r182v-.">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="ogdndkw"
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
                            data-oid=".v4py8b"
                        >
                            <option value="light" data-oid="v:.hv9j">
                                Light
                            </option>
                            <option value="dark" data-oid="g-occqc">
                                Dark
                            </option>
                            <option value="system" data-oid="atlenh2">
                                System
                            </option>
                        </select>
                    </div>

                    {/* Language Setting */}
                    <div data-oid="eg3u8ss">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="xo4tjgm"
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
                            data-oid="dcq8j62"
                        >
                            <option value="en" data-oid="yvadv.r">
                                English
                            </option>
                            <option value="es" data-oid="w_g9-7n">
                                Spanish
                            </option>
                            <option value="fr" data-oid="58444j5">
                                French
                            </option>
                            <option value="de" data-oid="q::7ms1">
                                German
                            </option>
                        </select>
                    </div>

                    {/* Notifications Setting */}
                    <div className="flex items-center justify-between" data-oid="g0lbwt8">
                        <label className="text-sm font-medium text-gray-700" data-oid="g5o8iei">
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
                            data-oid="dq:cqeg"
                        />
                    </div>

                    {/* Auto Save Setting */}
                    <div className="flex items-center justify-between" data-oid="i5wq0uw">
                        <label className="text-sm font-medium text-gray-700" data-oid="agt1id6">
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
                            data-oid="s893zl3"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6" data-oid="1gx6lxc">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                        data-oid="7aq53wz"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                        data-oid="-hn_xgg"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
