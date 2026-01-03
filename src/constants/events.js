import { getNext3DayWeekend } from '../lib/holidayUtils';
import { getNextWeekend } from '../lib/dateCalculations';

// Base "Fun" Events that are always available or part of the "Default" set
export const BASE_EVENTS = [
    {
        id: 'new-year',
        emoji: '🎍',
        name: 'お正月',
        getTargetDate: (year) => new Date(year, 0, 1, 0, 0, 0),
        hasSpecialEffect: true,
        color: '#ff6b6b'
    },
    {
        id: 'year-remaining',
        emoji: '📊',
        name: '今年の残り時間',
        getTargetDate: (year) => new Date(year, 11, 31, 23, 59, 59, 999),
        hasSpecialEffect: false,
        color: '#54a0ff'
    },
    {
        id: 'weekend',
        emoji: '📅',
        name: '週末',
        isDynamic: true,
        getDynamicTarget: getNextWeekend,
        hasSpecialEffect: false,
        color: '#4b7bec'
    },
    {
        id: '3-day-weekend',
        emoji: '🎌',
        name: '次の3連休',
        isDynamic: true,
        getDynamicTarget: getNext3DayWeekend,
        hasSpecialEffect: false,
        color: '#a55eea'
    },
];

export const SEASONAL_EVENTS = [
    {
        id: 'valentine',
        emoji: '💝',
        name: 'バレンタイン',
        getTargetDate: (year) => new Date(year, 1, 14, 0, 0, 0),
        hasSpecialEffect: false,
        color: '#fa8231'
    },
    {
        id: 'golden-week',
        emoji: '🌸',
        name: 'ゴールデンウィーク',
        getTargetDate: (year) => new Date(year, 4, 3, 0, 0, 0),
        hasSpecialEffect: false,
        color: '#2bcbba'
    },
    {
        id: 'halloween',
        emoji: '🎃',
        name: 'ハロウィン',
        getTargetDate: (year) => new Date(year, 9, 31, 0, 0, 0),
        hasSpecialEffect: false,
        color: '#fd9644'
    },
    {
        id: 'christmas',
        emoji: '🎄',
        name: 'クリスマス',
        getTargetDate: (year) => new Date(year, 11, 25, 0, 0, 0),
        hasSpecialEffect: false,
        color: '#20bf6b'
    }
];

// For backward compatibility during migration
export const EVENTS = [...BASE_EVENTS, ...SEASONAL_EVENTS];
