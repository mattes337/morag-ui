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
            data-oid="cu4q8:e"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md" data-oid="7jfhayu">
                <div className="flex justify-between items-center mb-4" data-oid="yal-2oz">
                    <h2 className="text-xl font-semibold" data-oid="cjnvopu">
                        Settings
                    </h2>
                    <button
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-gray-600"
                        data-oid="sonetb5"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            data-oid="cp:phsp"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                                data-oid="jzp8yf8"
                            />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4" data-oid="wq8xmga">
                    {/* Theme Setting */}
                    <div data-oid="_:0qqgi">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="7j1b.fm"
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
                            data-oid="n_ij.o3"
                        >
                            <option value="light" data-oid="tl--24a">
                                Light
                            </option>
                            <option value="dark" data-oid="icqrza7">
                                Dark
                            </option>
                            <option value="system" data-oid="mr_7jj5">
                                System
                            </option>
                        </select>
                    </div>

                    {/* Language Setting */}
                    <div data-oid="-elo_vx">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="o9gj3r."
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
                            data-oid="2-jccjt"
                        >
                            <option value="en" data-oid="-t1ipiv">
                                English
                            </option>
                            <option value="es" data-oid="yz95ixm">
                                Spanish
                            </option>
                            <option value="fr" data-oid="aw3o3v9">
                                French
                            </option>
                            <option value="de" data-oid="kili70e">
                                German
                            </option>
                        </select>
                    </div>

                    {/* Notifications Setting */}
                    <div className="flex items-center justify-between" data-oid="spxreab">
                        <label className="text-sm font-medium text-gray-700" data-oid="6v3weeu">
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
                            data-oid="71og2r4"
                        />
                    </div>

                    {/* Auto Save Setting */}
                    <div className="flex items-center justify-between" data-oid="lqf5.-n">
                        <label className="text-sm font-medium text-gray-700" data-oid="yn5wepw">
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
                            data-oid="m48kn71"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6" data-oid="sulq9-m">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                        data-oid="l:74z.n"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                        data-oid="4p1692."
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
