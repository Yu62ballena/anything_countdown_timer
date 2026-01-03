import React, { useState, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    TouchSensor
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { Settings, ArrowUpDown } from 'lucide-react';

import { generateJapanHolidays, generateCountryHolidays } from '../lib/holidayGenerators';
import { BASE_EVENTS, SEASONAL_EVENTS } from '../constants/events';
import SettingsModal from './SettingsModal';
import DisplayToggle from './DisplayToggle';
import SortableCountdownCard from './SortableCountdownCard';
import HeroCountdown from './HeroCountdown';

const STORAGE_KEY = 'countdown_settings_v2';

const CountdownList = () => {
    const [displayMode, setDisplayMode] = useState('std');
    const [currentDateStr, setCurrentDateStr] = useState('');

    // State
    const [allEvents, setAllEvents] = useState([]);
    const [eventOrder, setEventOrder] = useState([]);
    const [visibility, setVisibility] = useState({});

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // --- Helper: Generate ALL Events ---
    const generateAllEvents = () => {
        const base = [...BASE_EVENTS, ...SEASONAL_EVENTS].map(e => ({ ...e, category: 'DEFAULT' }));
        const jp = generateJapanHolidays().map(e => ({ ...e, category: 'JP' }));
        const us = generateCountryHolidays('US', '🇺🇸').map(e => ({ ...e, category: 'US' }));
        const gb = generateCountryHolidays('GB', '🇬🇧').map(e => ({ ...e, category: 'GB' }));

        return [...base, ...jp, ...us, ...gb];
    };

    // --- Initialization & Loading ---
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const str = now.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
            setCurrentDateStr(str);
        }, 1000);

        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            let loadedOrder = [];
            let loadedVisibility = {};

            // Generate FULL list of events first
            const fullList = generateAllEvents();
            setAllEvents(fullList);

            if (saved) {
                const parsed = JSON.parse(saved);
                loadedOrder = parsed.order || [];
                loadedVisibility = parsed.visibility || {};
            } else {
                fullList.forEach(ev => {
                    const isDefault = ['DEFAULT', 'JP'].includes(ev.category);
                    if (!isDefault) {
                        loadedVisibility[ev.id] = false;
                    }
                });
            }

            const currentIds = fullList.map(e => e.id);
            let finalOrder = [...loadedOrder];

            // Add missing
            currentIds.forEach(id => {
                if (!finalOrder.includes(id)) finalOrder.push(id);
            });

            // Remove obsolete
            finalOrder = finalOrder.filter(id => currentIds.includes(id));

            setEventOrder(finalOrder);
            setVisibility(loadedVisibility);

        } catch (e) {
            console.error("Failed to load settings", e);
            const fullList = generateAllEvents();
            setAllEvents(fullList);
            setEventOrder(fullList.map(e => e.id));
        }

        return () => clearInterval(interval);
    }, []);

    // --- Persistence ---
    const saveSettings = (newOrder, newVisibility) => {
        const data = {
            order: newOrder,
            visibility: newVisibility
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    };

    // Batch toggle handler for SettingsModal
    const handleCategoryToggle = (category, shouldShow) => {
        const newVis = { ...visibility };
        allEvents.filter(e => e.category === category).forEach(e => {
            if (shouldShow) {
                // To show, we remove the 'false' entry (since undefined means true in our logic)
                delete newVis[e.id];
            } else {
                newVis[e.id] = false;
            }
        });
        setVisibility(newVis);
        saveSettings(eventOrder, newVis);
    };

    // --- Handlers ---
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = eventOrder.indexOf(active.id);
            const newIndex = eventOrder.indexOf(over.id);
            const newOrder = arrayMove(eventOrder, oldIndex, newIndex);

            setEventOrder(newOrder);
            saveSettings(newOrder, visibility);
        }
    };

    const toggleVisibility = (id) => {
        const newVis = { ...visibility };
        if (newVis[id] === false) {
            delete newVis[id];
        } else {
            newVis[id] = false;
        }
        setVisibility(newVis);
        saveSettings(eventOrder, newVis);
    };

    const resetSettings = () => {
        if (window.confirm('現在のプリセットの並び順と表示設定を初期化しますか？')) {
            const defaultOrder = allEvents.map(e => e.id);
            setEventOrder(defaultOrder);

            // Reset visibility: Show Default and JP only
            const defVis = {};
            allEvents.forEach(ev => {
                const isDefault = ['DEFAULT', 'JP'].includes(ev.category);
                if (!isDefault) defVis[ev.id] = false;
            });

            setVisibility(defVis);
            saveSettings(defaultOrder, defVis);
            setIsSettingsOpen(false);
        }
    };

    const toggleDisplayMode = () => {
        setDisplayMode(prev => prev === 'std' ? 'total' : 'std');
    };

    const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

    const handleSortByDate = () => {
        const nextOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        console.log(`[Sort] Toggling to: ${nextOrder} (Current: ${sortOrder})`);
        setSortOrder(nextOrder);

        // Helper to safely get time
        const getTime = (ev) => {
            const getTarget = typeof ev.getTargetDate === 'function' ? ev.getTargetDate : ev.getDynamicTarget;
            if (typeof getTarget !== 'function') return null;
            try {
                const val = getTarget.call(ev);
                // Ensure we get a valid number
                const time = val instanceof Date ? val.getTime() : val;
                return isNaN(time) ? null : time;
            } catch (e) { return null; }
        };

        const sorted = [...allEvents].sort((a, b) => {
            const tA = getTime(a);
            const tB = getTime(b);

            // Handle invalid dates: push to end
            if (tA === null && tB === null) return 0;
            if (tA === null) return 1;
            if (tB === null) return -1;

            // Simple Date Sort
            if (nextOrder === 'asc') {
                return tA - tB; // Oldest -> Newest
            } else {
                return tB - tA; // Newest -> Oldest
            }
        });

        console.log('[Sort] Sorted first 3:', sorted.slice(0, 3).map(e => `${e.name} (${getTime(e)})`));
        console.log('[Sort] Sorted last 3:', sorted.slice(-3).map(e => `${e.name} (${getTime(e)})`));

        const newOrder = sorted.map(e => e.id);
        setEventOrder(newOrder);
        saveSettings(newOrder, visibility);
    };

    // Prepare map for current events
    const eventMap = allEvents.reduce((acc, ev) => {
        acc[ev.id] = ev;
        return acc;
    }, {});

    const visibleEventIds = eventOrder.filter(id => visibility[id] !== false);

    // --- Hero Event Logic (Crash Safe) ---
    const nowMs = new Date().getTime();
    let heroEvent = null;

    // Filter for FUTURE events in the visible list
    const futureEvents = visibleEventIds
        .map(id => eventMap[id])
        .filter(ev => {
            if (!ev) return false;
            // Safer check for date retrieval method
            const getTarget = typeof ev.getTargetDate === 'function' ? ev.getTargetDate : ev.getDynamicTarget;

            if (typeof getTarget !== 'function') return false;

            try {
                // Determine target time safely
                const targetTime = getTarget.call(ev).getTime();
                // Attach for sorting
                ev._tempTargetTime = targetTime;
                return targetTime > nowMs;
            } catch (e) {
                console.warn("Failed to get target date for", ev.name, e);
                return false;
            }
        });

    if (futureEvents.length > 0) {
        // Sort asc by date
        futureEvents.sort((a, b) => a._tempTargetTime - b._tempTargetTime);
        heroEvent = futureEvents[0];

        // Polyfill method for Hero component consumer if needed
        if (heroEvent && !heroEvent.getTargetDate && heroEvent.getDynamicTarget) {
            heroEvent.getTargetDate = heroEvent.getDynamicTarget;
        }
    }

    // Exclude hero from the main grid list
    const listEventIds = visibleEventIds.filter(id => !heroEvent || id !== heroEvent.id);


    return (
        <div className="countdown-list-container">
            <header className="app-header">
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '8px' }}>
                    <button
                        onClick={handleSortByDate}
                        title="日付順に並び替え"
                        className="sort-btn"
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            borderRadius: '50%',
                            padding: '10px',
                            cursor: 'pointer',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backdropFilter: 'blur(5px)'
                        }}
                    >
                        <ArrowUpDown size={24} />
                    </button>
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="settings-btn"
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            borderRadius: '50%',
                            padding: '10px',
                            cursor: 'pointer',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backdropFilter: 'blur(5px)'
                        }}
                    >
                        <Settings size={24} />
                    </button>
                </div>

                <div className="today-display">今日の日付: {currentDateStr}</div>
                <DisplayToggle mode={displayMode} onToggle={toggleDisplayMode} />
            </header>

            {/* Settings Modal */}
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                events={allEvents} // Pass all events for the toggle list
                visibilityState={visibility}
                onToggleVisibility={toggleVisibility}
                onReset={resetSettings}
                onToggleCategory={handleCategoryToggle}
            />

            {/* Hero Section */}
            {heroEvent && (
                <div className="hero-section" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                    <HeroCountdown event={heroEvent} />
                </div>
            )}

            <div className="cards-grid">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={listEventIds}
                        strategy={verticalListSortingStrategy}
                    >
                        {listEventIds.map(id => {
                            const ev = eventMap[id];
                            if (!ev) return null;
                            return (
                                <SortableCountdownCard
                                    key={id}
                                    event={ev}
                                    displayMode={displayMode}
                                />
                            );
                        })}
                    </SortableContext>
                </DndContext>
            </div>
        </div>
    );
};

export default CountdownList;
