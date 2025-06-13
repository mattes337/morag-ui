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
            data-oid="yk2hkqn"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md" data-oid="tzd38rz">
                <div className="flex justify-between items-center mb-4" data-oid="qvej_74">
                    <h2 className="text-xl font-semibold" data-oid="3p9o9ek">
                        Settings
                    </h2>
                    <button
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-gray-600"
                        data-oid="q5uja6l"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            data-oid="k4yy:z1"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                                data-oid="8r9sdz1"
                            />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4" data-oid="me8.9qr">
                    {/* Theme Setting */}
                    <div data-oid="uc7sv7.">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="98co:da"
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
                            data-oid="sgowdm."
                        >
                            <option value="light" data-oid="n3ort4t">
                                Light
                            </option>
                            <option value="dark" data-oid="038qjse">
                                Dark
                            </option>
                            <option value="system" data-oid="-mjul73">
                                System
                            </option>
                        </select>
                    </div>

                    {/* Language Setting */}
                    <div data-oid="yhg_p7u">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="ha21m1o"
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
                            data-oid="rx7cxtf"
                        >
                            <option value="en" data-oid="-6.-2pu">
                                English
                            </option>
                            <option value="es" data-oid="oj-bap-">
                                Spanish
                            </option>
                            <option value="fr" data-oid="z9ez0:f">
                                French
                            </option>
                            <option value="de" data-oid=":ze99dl">
                                German
                            </option>
                        </select>
                    </div>

                    {/* Notifications Setting */}
                    <div className="flex items-center justify-between" data-oid="km8p-zo">
                        <label className="text-sm font-medium text-gray-700" data-oid="i6joeoh">
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
                            data-oid="50spmuv"
                        />
                    </div>

                    {/* Auto Save Setting */}
                    <div className="flex items-center justify-between" data-oid=":kx2rpa">
                        <label className="text-sm font-medium text-gray-700" data-oid="jc9:24b">
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
                            data-oid="hkjj2c0"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6" data-oid="svpist4">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                        data-oid="g4glqz."
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                        data-oid="80qun1i"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
