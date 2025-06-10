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
        <div className="max-w-4xl mx-auto" data-oid="jpj_04d">
            <div className="bg-white shadow rounded-lg" data-oid="4e9lu6k">
                <div className="px-6 py-4 border-b border-gray-200" data-oid="ryt9ewq">
                    <h1 className="text-2xl font-semibold text-gray-900" data-oid="ia_5e0n">
                        Settings
                    </h1>
                    <p className="text-gray-600 mt-1" data-oid="by9-yqa">
                        Manage your application preferences and configuration
                    </p>
                </div>

                <div className="p-6 space-y-6" data-oid="qhem-_r">
                    {/* Theme Setting */}
                    <div data-oid="gh_gm5r">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="onn5_k:"
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
                            data-oid="uzax3pi"
                        >
                            <option value="light" data-oid="o7pgd4l">
                                Light
                            </option>
                            <option value="dark" data-oid="0nx6:32">
                                Dark
                            </option>
                            <option value="system" data-oid="g5fn3oz">
                                System
                            </option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1" data-oid=".ledonp">
                            Choose your preferred color scheme
                        </p>
                    </div>

                    {/* Language Setting */}
                    <div data-oid=".lwmbo6">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="d94h0oq"
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
                            data-oid="jt81j2y"
                        >
                            <option value="en" data-oid="4ac1wxc">
                                English
                            </option>
                            <option value="es" data-oid="r04gn7a">
                                Spanish
                            </option>
                            <option value="fr" data-oid="0lnqvmd">
                                French
                            </option>
                            <option value="de" data-oid="zuknrua">
                                German
                            </option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1" data-oid="lhi5u42">
                            Select your preferred language
                        </p>
                    </div>

                    {/* Notifications Setting */}
                    <div className="flex items-start" data-oid="9l_sj2i">
                        <div className="flex items-center h-5" data-oid="x47pcoh">
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
                                data-oid="wkhjq.m"
                            />
                        </div>
                        <div className="ml-3" data-oid="_sc:.vj">
                            <label className="text-sm font-medium text-gray-700" data-oid="6kz.-yk">
                                Enable Notifications
                            </label>
                            <p className="text-sm text-gray-500" data-oid="ck2kqb_">
                                Receive notifications about system events and updates
                            </p>
                        </div>
                    </div>

                    {/* Auto Save Setting */}
                    <div className="flex items-start" data-oid="9fdvgue">
                        <div className="flex items-center h-5" data-oid="dvc1cq:">
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
                                data-oid="1azf-jf"
                            />
                        </div>
                        <div className="ml-3" data-oid="5am:kyr">
                            <label className="text-sm font-medium text-gray-700" data-oid="nzv85zw">
                                Auto Save
                            </label>
                            <p className="text-sm text-gray-500" data-oid="l65u1hx">
                                Automatically save changes as you work
                            </p>
                        </div>
                    </div>

                    {/* Default Database Setting */}
                    <div data-oid="zp56zik">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="k0c_wxk"
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
                            data-oid="_vwxjgv"
                        >
                            <option value="" data-oid="dm0zvp4">
                                No default
                            </option>
                            <option value="research" data-oid="m124vz3">
                                Research Papers
                            </option>
                            <option value="knowledge" data-oid="7kj0vsv">
                                Company Knowledge Base
                            </option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1" data-oid="oxj4e8c">
                            Choose a default database for new sessions
                        </p>
                    </div>
                </div>

                <div
                    className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center"
                    data-oid="p1rgtvm"
                >
                    <div data-oid="xe3_99s">
                        {isSaved && (
                            <span className="text-green-600 text-sm font-medium" data-oid="25nu1rv">
                                Settings saved successfully!
                            </span>
                        )}
                    </div>
                    <div className="flex space-x-3" data-oid="qe2nb6y">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md"
                            data-oid="196v3qg"
                        >
                            Reset
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                            data-oid="4g5axkx"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
