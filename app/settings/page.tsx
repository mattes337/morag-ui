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
        <div className="max-w-4xl mx-auto" data-oid="25b1l7_">
            <div className="bg-white shadow rounded-lg" data-oid="59k007f">
                <div className="px-6 py-4 border-b border-gray-200" data-oid="u3v_3wm">
                    <h1 className="text-2xl font-semibold text-gray-900" data-oid="rondj-a">
                        Settings
                    </h1>
                    <p className="text-gray-600 mt-1" data-oid="0899exb">
                        Manage your application preferences and configuration
                    </p>
                </div>

                <div className="p-6 space-y-6" data-oid="hemeuzk">
                    {/* Theme Setting */}
                    <div data-oid="5yk0z16">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="a-lv-k9"
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
                            data-oid="j32s-m6"
                        >
                            <option value="light" data-oid="pcrk1to">
                                Light
                            </option>
                            <option value="dark" data-oid="7b0z_7x">
                                Dark
                            </option>
                            <option value="system" data-oid="_l1hjt-">
                                System
                            </option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1" data-oid="y5zcyq3">
                            Choose your preferred color scheme
                        </p>
                    </div>

                    {/* Language Setting */}
                    <div data-oid="d47a:s.">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="h3qh8iw"
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
                            data-oid="d0mc387"
                        >
                            <option value="en" data-oid="cmmstgl">
                                English
                            </option>
                            <option value="es" data-oid="8og16rh">
                                Spanish
                            </option>
                            <option value="fr" data-oid="8yv-a4l">
                                French
                            </option>
                            <option value="de" data-oid="v49gpq2">
                                German
                            </option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1" data-oid="-9d2cbb">
                            Select your preferred language
                        </p>
                    </div>

                    {/* Notifications Setting */}
                    <div className="flex items-start" data-oid="-1nobdt">
                        <div className="flex items-center h-5" data-oid="an82m8e">
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
                                data-oid="n3z16e6"
                            />
                        </div>
                        <div className="ml-3" data-oid="rdmrjku">
                            <label className="text-sm font-medium text-gray-700" data-oid="o50d3nv">
                                Enable Notifications
                            </label>
                            <p className="text-sm text-gray-500" data-oid="_g34x7t">
                                Receive notifications about system events and updates
                            </p>
                        </div>
                    </div>

                    {/* Auto Save Setting */}
                    <div className="flex items-start" data-oid="m2w4pyn">
                        <div className="flex items-center h-5" data-oid="xunau9i">
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
                                data-oid="zhv_ql2"
                            />
                        </div>
                        <div className="ml-3" data-oid="m:h50x9">
                            <label className="text-sm font-medium text-gray-700" data-oid="bxj177.">
                                Auto Save
                            </label>
                            <p className="text-sm text-gray-500" data-oid="iwn-ihb">
                                Automatically save changes as you work
                            </p>
                        </div>
                    </div>

                    {/* Default Database Setting */}
                    <div data-oid="0nibgqn">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="9z1h30:"
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
                            data-oid="blqeinx"
                        >
                            <option value="" data-oid="v7h9rkq">
                                No default
                            </option>
                            <option value="research" data-oid="w7217wd">
                                Research Papers
                            </option>
                            <option value="knowledge" data-oid=":ozu5-x">
                                Company Knowledge Base
                            </option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1" data-oid="7s4jv6y">
                            Choose a default database for new sessions
                        </p>
                    </div>
                </div>

                <div
                    className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center"
                    data-oid="gv35r7c"
                >
                    <div data-oid="14-wd3j">
                        {isSaved && (
                            <span className="text-green-600 text-sm font-medium" data-oid="yjs4.7e">
                                Settings saved successfully!
                            </span>
                        )}
                    </div>
                    <div className="flex space-x-3" data-oid="1dcdlnb">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md"
                            data-oid="2mw7-k."
                        >
                            Reset
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                            data-oid="rp22hvh"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
