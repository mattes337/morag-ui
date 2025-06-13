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
        <div className="max-w-4xl mx-auto" data-oid="0wucsdi">
            <div className="bg-white shadow rounded-lg" data-oid="vlf77yo">
                <div className="px-6 py-4 border-b border-gray-200" data-oid="2.brprq">
                    <h1 className="text-2xl font-semibold text-gray-900" data-oid="70dugi-">
                        Settings
                    </h1>
                    <p className="text-gray-600 mt-1" data-oid=":4xznlh">
                        Manage your application preferences and configuration
                    </p>
                </div>

                <div className="p-6 space-y-6" data-oid="me-xzwv">
                    {/* Theme Setting */}
                    <div data-oid="1j:jre3">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="es-oe::"
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
                            data-oid="e28z4p:"
                        >
                            <option value="light" data-oid="gfdes3h">
                                Light
                            </option>
                            <option value="dark" data-oid="c149pn5">
                                Dark
                            </option>
                            <option value="system" data-oid="0zj168g">
                                System
                            </option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1" data-oid=".s:g5oa">
                            Choose your preferred color scheme
                        </p>
                    </div>

                    {/* Language Setting */}
                    <div data-oid="7tdbah.">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="_w95p16"
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
                            data-oid="hw3o-fs"
                        >
                            <option value="en" data-oid="s.liqnc">
                                English
                            </option>
                            <option value="es" data-oid="im2x8ch">
                                Spanish
                            </option>
                            <option value="fr" data-oid="-ee7w_l">
                                French
                            </option>
                            <option value="de" data-oid="01y1hbq">
                                German
                            </option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1" data-oid="o-n8ijk">
                            Select your preferred language
                        </p>
                    </div>

                    {/* Notifications Setting */}
                    <div className="flex items-start" data-oid="wczcwz_">
                        <div className="flex items-center h-5" data-oid="maxf447">
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
                                data-oid="n3p0pu_"
                            />
                        </div>
                        <div className="ml-3" data-oid="ah14jep">
                            <label className="text-sm font-medium text-gray-700" data-oid="k-7zzcd">
                                Enable Notifications
                            </label>
                            <p className="text-sm text-gray-500" data-oid="vpzrc1-">
                                Receive notifications about system events and updates
                            </p>
                        </div>
                    </div>

                    {/* Auto Save Setting */}
                    <div className="flex items-start" data-oid="uj8mev-">
                        <div className="flex items-center h-5" data-oid="z9jwdb7">
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
                                data-oid="i479-cn"
                            />
                        </div>
                        <div className="ml-3" data-oid="mysem:i">
                            <label className="text-sm font-medium text-gray-700" data-oid="ep35dg_">
                                Auto Save
                            </label>
                            <p className="text-sm text-gray-500" data-oid="rk1j2:7">
                                Automatically save changes as you work
                            </p>
                        </div>
                    </div>

                    {/* Default Database Setting */}
                    <div data-oid="7d62rrw">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="xgvyll3"
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
                            data-oid="-u3l6fr"
                        >
                            <option value="" data-oid="m4hq7c6">
                                No default
                            </option>
                            <option value="research" data-oid="b_i5vt-">
                                Research Papers
                            </option>
                            <option value="knowledge" data-oid="fey72gx">
                                Company Knowledge Base
                            </option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1" data-oid="4ttb_y8">
                            Choose a default database for new sessions
                        </p>
                    </div>
                </div>

                <div
                    className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center"
                    data-oid="gyuo00c"
                >
                    <div data-oid="9k-2r43">
                        {isSaved && (
                            <span className="text-green-600 text-sm font-medium" data-oid="j4b.f33">
                                Settings saved successfully!
                            </span>
                        )}
                    </div>
                    <div className="flex space-x-3" data-oid="3qu1e9:">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md"
                            data-oid="4qk8auv"
                        >
                            Reset
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                            data-oid="54mrtj8"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
