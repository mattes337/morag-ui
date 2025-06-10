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
        <div className="max-w-4xl mx-auto" data-oid="tyn78u3">
            <div className="bg-white shadow rounded-lg" data-oid="38klgl4">
                <div className="px-6 py-4 border-b border-gray-200" data-oid="1hty9p_">
                    <h1 className="text-2xl font-semibold text-gray-900" data-oid="41zzun7">
                        Settings
                    </h1>
                    <p className="text-gray-600 mt-1" data-oid="3hch9wi">
                        Manage your application preferences and configuration
                    </p>
                </div>

                <div className="p-6 space-y-6" data-oid="zo.9j5l">
                    {/* Theme Setting */}
                    <div data-oid="62.fod8">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="g3pozum"
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
                            data-oid="l69t8s0"
                        >
                            <option value="light" data-oid="eq_59qo">
                                Light
                            </option>
                            <option value="dark" data-oid="pe7bdfd">
                                Dark
                            </option>
                            <option value="system" data-oid="lupzj9s">
                                System
                            </option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1" data-oid="f9ehtdq">
                            Choose your preferred color scheme
                        </p>
                    </div>

                    {/* Language Setting */}
                    <div data-oid="w4w50-4">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="e-ip00r"
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
                            data-oid="tvnc0n-"
                        >
                            <option value="en" data-oid="guj349p">
                                English
                            </option>
                            <option value="es" data-oid="auez_sa">
                                Spanish
                            </option>
                            <option value="fr" data-oid="eqt0pqj">
                                French
                            </option>
                            <option value="de" data-oid="a4k:kjf">
                                German
                            </option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1" data-oid="b._41vw">
                            Select your preferred language
                        </p>
                    </div>

                    {/* Notifications Setting */}
                    <div className="flex items-start" data-oid="rzcp2z-">
                        <div className="flex items-center h-5" data-oid="w1zvat3">
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
                                data-oid="74jolc9"
                            />
                        </div>
                        <div className="ml-3" data-oid=":ox:c-m">
                            <label className="text-sm font-medium text-gray-700" data-oid="xdle.5n">
                                Enable Notifications
                            </label>
                            <p className="text-sm text-gray-500" data-oid="sdh-57m">
                                Receive notifications about system events and updates
                            </p>
                        </div>
                    </div>

                    {/* Auto Save Setting */}
                    <div className="flex items-start" data-oid="0-nprdr">
                        <div className="flex items-center h-5" data-oid="igv2arz">
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
                                data-oid="xw423s7"
                            />
                        </div>
                        <div className="ml-3" data-oid=":lnvj:9">
                            <label className="text-sm font-medium text-gray-700" data-oid="q5d6kcy">
                                Auto Save
                            </label>
                            <p className="text-sm text-gray-500" data-oid="-njyu:k">
                                Automatically save changes as you work
                            </p>
                        </div>
                    </div>

                    {/* Default Database Setting */}
                    <div data-oid="68_9b3y">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="lxpb4o6"
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
                            data-oid="hgg:r40"
                        >
                            <option value="" data-oid="ajus3v7">
                                No default
                            </option>
                            <option value="research" data-oid="a6-q2lh">
                                Research Papers
                            </option>
                            <option value="knowledge" data-oid="1c.g-e4">
                                Company Knowledge Base
                            </option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1" data-oid="y._7hf0">
                            Choose a default database for new sessions
                        </p>
                    </div>
                </div>

                <div
                    className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center"
                    data-oid="y-bd67_"
                >
                    <div data-oid="_pwwkxp">
                        {isSaved && (
                            <span className="text-green-600 text-sm font-medium" data-oid="5tcrq:r">
                                Settings saved successfully!
                            </span>
                        )}
                    </div>
                    <div className="flex space-x-3" data-oid="x:580qv">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md"
                            data-oid="q:.u6t7"
                        >
                            Reset
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                            data-oid="s--ws4j"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
