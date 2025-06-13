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
            data-oid="psshd79"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md" data-oid="wxfs4-9">
                <div className="flex justify-between items-center mb-4" data-oid="a4pa1mi">
                    <h2 className="text-xl font-semibold" data-oid="gse6ay-">
                        Settings
                    </h2>
                    <button
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-gray-600"
                        data-oid="--izg-g"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            data-oid="1j.4ruh"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                                data-oid="6_vy7hk"
                            />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4" data-oid="9okzcq-">
                    {/* Theme Setting */}
                    <div data-oid=".j89sg:">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="5_c1yji"
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
                            data-oid="m7t6aoo"
                        >
                            <option value="light" data-oid="xfbcl62">
                                Light
                            </option>
                            <option value="dark" data-oid="66b8:d1">
                                Dark
                            </option>
                            <option value="system" data-oid="he4p0fa">
                                System
                            </option>
                        </select>
                    </div>

                    {/* Language Setting */}
                    <div data-oid="3sma8i1">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="beicf1o"
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
                            data-oid="iud.ohn"
                        >
                            <option value="en" data-oid="ls69.3m">
                                English
                            </option>
                            <option value="es" data-oid="3.gq.if">
                                Spanish
                            </option>
                            <option value="fr" data-oid="1ad8sth">
                                French
                            </option>
                            <option value="de" data-oid="t:xa171">
                                German
                            </option>
                        </select>
                    </div>

                    {/* Notifications Setting */}
                    <div className="flex items-center justify-between" data-oid="b7u7-lb">
                        <label className="text-sm font-medium text-gray-700" data-oid="95-qtm:">
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
                            data-oid="hppiblg"
                        />
                    </div>

                    {/* Auto Save Setting */}
                    <div className="flex items-center justify-between" data-oid="3nv.l4.">
                        <label className="text-sm font-medium text-gray-700" data-oid="c3noz0n">
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
                            data-oid="53kwuju"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6" data-oid="521l8f6">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                        data-oid="3zjzj1_"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                        data-oid="k7_6gd8"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
