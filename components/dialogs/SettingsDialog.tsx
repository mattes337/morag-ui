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
            data-oid="df2c-05"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md" data-oid="dchu6e:">
                <div className="flex justify-between items-center mb-4" data-oid=":3p8pu-">
                    <h2 className="text-xl font-semibold" data-oid="09zh1es">
                        Settings
                    </h2>
                    <button
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-gray-600"
                        data-oid=":s58nto"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            data-oid="tymn6ip"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                                data-oid="p1btrl7"
                            />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4" data-oid="oysw-qe">
                    {/* Theme Setting */}
                    <div data-oid="vx23u5e">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="tf70q0g"
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
                            data-oid="qo_wyct"
                        >
                            <option value="light" data-oid="-u_i_9f">
                                Light
                            </option>
                            <option value="dark" data-oid=":0dhe6a">
                                Dark
                            </option>
                            <option value="system" data-oid="kvl-jp4">
                                System
                            </option>
                        </select>
                    </div>

                    {/* Language Setting */}
                    <div data-oid="zn:dtm.">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="hkcdkwd"
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
                            data-oid="g_hd7l6"
                        >
                            <option value="en" data-oid="j_4-.kc">
                                English
                            </option>
                            <option value="es" data-oid="lrww-n8">
                                Spanish
                            </option>
                            <option value="fr" data-oid="jeb76sv">
                                French
                            </option>
                            <option value="de" data-oid="v5_txd9">
                                German
                            </option>
                        </select>
                    </div>

                    {/* Notifications Setting */}
                    <div className="flex items-center justify-between" data-oid="mb9odn:">
                        <label className="text-sm font-medium text-gray-700" data-oid="ynved5-">
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
                            data-oid="z2zu9aa"
                        />
                    </div>

                    {/* Auto Save Setting */}
                    <div className="flex items-center justify-between" data-oid="y6mqd.g">
                        <label className="text-sm font-medium text-gray-700" data-oid="sac5ad.">
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
                            data-oid="gia8yg."
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6" data-oid="_7_e51t">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                        data-oid="3rzlm-j"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                        data-oid=":13mnyy"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
