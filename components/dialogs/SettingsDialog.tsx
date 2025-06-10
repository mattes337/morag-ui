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
            data-oid="10k5_uq"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md" data-oid="eqjz_bx">
                <div className="flex justify-between items-center mb-4" data-oid="5po7:au">
                    <h2 className="text-xl font-semibold" data-oid="cq0eywd">
                        Settings
                    </h2>
                    <button
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-gray-600"
                        data-oid="72703wv"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            data-oid="4a5q3sr"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                                data-oid="2:ihny_"
                            />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4" data-oid="e57uz8:">
                    {/* Theme Setting */}
                    <div data-oid="fhtu:dy">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="jb3.7qy"
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
                            data-oid="h3evdx:"
                        >
                            <option value="light" data-oid="2rq2a3:">
                                Light
                            </option>
                            <option value="dark" data-oid="prd0ixv">
                                Dark
                            </option>
                            <option value="system" data-oid="w8e3_yc">
                                System
                            </option>
                        </select>
                    </div>

                    {/* Language Setting */}
                    <div data-oid="9sdqy7v">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="g-c1si6"
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
                            data-oid="9dosvk-"
                        >
                            <option value="en" data-oid="0slbvot">
                                English
                            </option>
                            <option value="es" data-oid="d7sdop-">
                                Spanish
                            </option>
                            <option value="fr" data-oid="sd_xisp">
                                French
                            </option>
                            <option value="de" data-oid="miod24h">
                                German
                            </option>
                        </select>
                    </div>

                    {/* Notifications Setting */}
                    <div className="flex items-center justify-between" data-oid="-htstoj">
                        <label className="text-sm font-medium text-gray-700" data-oid=".m97rst">
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
                            data-oid="i8_ktxp"
                        />
                    </div>

                    {/* Auto Save Setting */}
                    <div className="flex items-center justify-between" data-oid=":tl9tzt">
                        <label className="text-sm font-medium text-gray-700" data-oid="h4-:m7l">
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
                            data-oid="vjxfql:"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6" data-oid="vljk690">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                        data-oid="rym1g16"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                        data-oid="zciaqym"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
