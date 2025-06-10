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
        <div className="max-w-4xl mx-auto" data-oid="5kf-a-e">
            <div className="bg-white shadow rounded-lg" data-oid="mbsdj2z">
                <div className="px-6 py-4 border-b border-gray-200" data-oid="a:4jriw">
                    <h1 className="text-2xl font-semibold text-gray-900" data-oid="svs9ffy">
                        Settings
                    </h1>
                    <p className="text-gray-600 mt-1" data-oid="a-l7ttk">
                        Manage your application preferences and configuration
                    </p>
                </div>

                <div className="p-6 space-y-6" data-oid="_:2y4o2">
                    {/* Theme Setting */}
                    <div data-oid=".9b3au4">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="x8llsf3"
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
                            data-oid="zvf4mja"
                        >
                            <option value="light" data-oid="gd6av3c">
                                Light
                            </option>
                            <option value="dark" data-oid="_iqap:h">
                                Dark
                            </option>
                            <option value="system" data-oid="_eswu6g">
                                System
                            </option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1" data-oid="jal:c0e">
                            Choose your preferred color scheme
                        </p>
                    </div>

                    {/* Language Setting */}
                    <div data-oid="6ekmsyt">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="l3hp3_5"
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
                            data-oid="-6:shz7"
                        >
                            <option value="en" data-oid="ytcf2nc">
                                English
                            </option>
                            <option value="es" data-oid="2056d1r">
                                Spanish
                            </option>
                            <option value="fr" data-oid="z2h22yu">
                                French
                            </option>
                            <option value="de" data-oid="kmylcdb">
                                German
                            </option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1" data-oid="lsmn2cy">
                            Select your preferred language
                        </p>
                    </div>

                    {/* Notifications Setting */}
                    <div className="flex items-start" data-oid="oa7fxt.">
                        <div className="flex items-center h-5" data-oid="3o5d-iy">
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
                                data-oid="lzpgxr:"
                            />
                        </div>
                        <div className="ml-3" data-oid="a68wdd9">
                            <label className="text-sm font-medium text-gray-700" data-oid="fdob7ql">
                                Enable Notifications
                            </label>
                            <p className="text-sm text-gray-500" data-oid="h4g-zz2">
                                Receive notifications about system events and updates
                            </p>
                        </div>
                    </div>

                    {/* Auto Save Setting */}
                    <div className="flex items-start" data-oid="9.qwcso">
                        <div className="flex items-center h-5" data-oid="uue-n7d">
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
                                data-oid="tff8lqn"
                            />
                        </div>
                        <div className="ml-3" data-oid="x5nmytg">
                            <label className="text-sm font-medium text-gray-700" data-oid="ccza6:2">
                                Auto Save
                            </label>
                            <p className="text-sm text-gray-500" data-oid="q39qag-">
                                Automatically save changes as you work
                            </p>
                        </div>
                    </div>

                    {/* Default Database Setting */}
                    <div data-oid="a:en898">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="dpnt8:v"
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
                            data-oid="umfeffx"
                        >
                            <option value="" data-oid="04vyxs7">
                                No default
                            </option>
                            <option value="research" data-oid="smdkrto">
                                Research Papers
                            </option>
                            <option value="knowledge" data-oid="obw7vl1">
                                Company Knowledge Base
                            </option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1" data-oid="5enh-6f">
                            Choose a default database for new sessions
                        </p>
                    </div>
                </div>

                <div
                    className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center"
                    data-oid="1yz6:h5"
                >
                    <div data-oid="a-8u4hm">
                        {isSaved && (
                            <span className="text-green-600 text-sm font-medium" data-oid="rsm9ce7">
                                Settings saved successfully!
                            </span>
                        )}
                    </div>
                    <div className="flex space-x-3" data-oid="e0ddq23">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md"
                            data-oid="np3zlpb"
                        >
                            Reset
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                            data-oid="2f3varg"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
