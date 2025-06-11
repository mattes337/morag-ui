'use client';

import { useApp } from '../../contexts/AppContext';
import { UserSettings } from '../../types';
import { useState } from 'react';

export default function SettingsPage() {
    const { userSettings, setUserSettings } = useApp();
    const [localSettings, setLocalSettings] = useState<UserSettings>(userSettings);
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = () => {
        setUserSettings(localSettings);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const handleReset = () => {
        setLocalSettings(userSettings);
    };

    return (
        <div className="max-w-4xl mx-auto" data-oid="92l8-.h">
            <div className="bg-white shadow rounded-lg" data-oid="wcjyaq2">
                <div className="px-6 py-4 border-b border-gray-200" data-oid="1j1a8b_">
                    <h1 className="text-2xl font-semibold text-gray-900" data-oid="uvonjxk">
                        Settings
                    </h1>
                    <p className="text-gray-600 mt-1" data-oid="3tzi90y">
                        Manage your application preferences and configuration
                    </p>
                </div>

                <div className="p-6 space-y-6" data-oid="q5c2euh">
                    {/* Theme Setting */}
                    <div data-oid="a.:b.nd">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="j1_cqma"
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
                            className="w-full max-w-xs border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            data-oid="z46sz8m"
                        >
                            <option value="light" data-oid="t.oz0s4">
                                Light
                            </option>
                            <option value="dark" data-oid="araf9yq">
                                Dark
                            </option>
                            <option value="system" data-oid="q8:ocai">
                                System
                            </option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1" data-oid="yea74l7">
                            Choose your preferred color scheme
                        </p>
                    </div>

                    {/* Language Setting */}
                    <div data-oid="i3ny6l1">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="dv0b1t5"
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
                            className="w-full max-w-xs border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            data-oid="4ly:fef"
                        >
                            <option value="en" data-oid="7yf.9rd">
                                English
                            </option>
                            <option value="es" data-oid="j3:oqy_">
                                Spanish
                            </option>
                            <option value="fr" data-oid="89dzwqb">
                                French
                            </option>
                            <option value="de" data-oid="_.5dgpp">
                                German
                            </option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1" data-oid="857iql7">
                            Select your preferred language
                        </p>
                    </div>

                    {/* Notifications Setting */}
                    <div className="flex items-start" data-oid="ep7z1v9">
                        <div className="flex items-center h-5" data-oid="g2owx8_">
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
                                data-oid="moiu-hi"
                            />
                        </div>
                        <div className="ml-3" data-oid="r0ze8um">
                            <label className="text-sm font-medium text-gray-700" data-oid="ct9l7i3">
                                Enable Notifications
                            </label>
                            <p className="text-sm text-gray-500" data-oid="by79_a3">
                                Receive notifications about system events and updates
                            </p>
                        </div>
                    </div>

                    {/* Auto Save Setting */}
                    <div className="flex items-start" data-oid="ccfy85.">
                        <div className="flex items-center h-5" data-oid="2t57c80">
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
                                data-oid="p4txm:d"
                            />
                        </div>
                        <div className="ml-3" data-oid="0.q34zy">
                            <label className="text-sm font-medium text-gray-700" data-oid="ik51bb2">
                                Auto Save
                            </label>
                            <p className="text-sm text-gray-500" data-oid="9u5q3w9">
                                Automatically save changes as you work
                            </p>
                        </div>
                    </div>

                    {/* Default Database Setting */}
                    <div data-oid="zny:xm0">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="1:-b0dn"
                        >
                            Default Database
                        </label>
                        <select
                            value={localSettings.defaultDatabase || ''}
                            onChange={(e) =>
                                setLocalSettings({
                                    ...localSettings,
                                    defaultDatabase: e.target.value || undefined,
                                })
                            }
                            className="w-full max-w-xs border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            data-oid="nca5exk"
                        >
                            <option value="" data-oid="adzoh..">
                                No default
                            </option>
                            <option value="research" data-oid="l:k1slg">
                                Research Papers
                            </option>
                            <option value="knowledge" data-oid="o.i.3m9">
                                Company Knowledge Base
                            </option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1" data-oid="27a135r">
                            Choose a default database for new sessions
                        </p>
                    </div>
                </div>

                <div
                    className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center"
                    data-oid="c5ohnou"
                >
                    <div data-oid="j3zs.-s">
                        {isSaved && (
                            <span className="text-green-600 text-sm font-medium" data-oid="ykbs9fz">
                                Settings saved successfully!
                            </span>
                        )}
                    </div>
                    <div className="flex space-x-3" data-oid="z:mxwq7">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md"
                            data-oid="qkjd5_t"
                        >
                            Reset
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                            data-oid="jpupqc7"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
