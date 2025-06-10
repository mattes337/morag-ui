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
            data-oid="q7exwb6"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md" data-oid="n2bj86:">
                <div className="flex justify-between items-center mb-4" data-oid="ixt77ed">
                    <h2 className="text-xl font-semibold" data-oid="q:3rjki">
                        Settings
                    </h2>
                    <button
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-gray-600"
                        data-oid="g04_uyb"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            data-oid="t0pmfvy"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                                data-oid="plmh-r7"
                            />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4" data-oid="35at0pl">
                    {/* Theme Setting */}
                    <div data-oid="3b4n542">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="pubnbun"
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
                            data-oid="z.xvw3i"
                        >
                            <option value="light" data-oid=":dfeyt1">
                                Light
                            </option>
                            <option value="dark" data-oid="rb::knv">
                                Dark
                            </option>
                            <option value="system" data-oid="fve:q75">
                                System
                            </option>
                        </select>
                    </div>

                    {/* Language Setting */}
                    <div data-oid="_jnvf-7">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="lqopual"
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
                            data-oid="5tinkc_"
                        >
                            <option value="en" data-oid="o2ok3ht">
                                English
                            </option>
                            <option value="es" data-oid="66iha3a">
                                Spanish
                            </option>
                            <option value="fr" data-oid=":hj9adf">
                                French
                            </option>
                            <option value="de" data-oid="ahqs4iz">
                                German
                            </option>
                        </select>
                    </div>

                    {/* Notifications Setting */}
                    <div className="flex items-center justify-between" data-oid="z89-3.d">
                        <label className="text-sm font-medium text-gray-700" data-oid="-d2ngs3">
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
                            data-oid="l2ixp0f"
                        />
                    </div>

                    {/* Auto Save Setting */}
                    <div className="flex items-center justify-between" data-oid="8a0uw1x">
                        <label className="text-sm font-medium text-gray-700" data-oid="48fh.-e">
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
                            data-oid="xe:ph35"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6" data-oid=".:86-w1">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                        data-oid="sfu7fdd"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                        data-oid="t.elsv4"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
