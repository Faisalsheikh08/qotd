import React, { useMemo } from 'react';

const MonthCalendar = ({ month, year, values = [] }) => {
    // Create a map of dates to counts for O(1) lookup
    const countMap = useMemo(() => {
        const map = {};
        values.forEach(({ date, count }) => {
            map[date] = count;
        });
        return map;
    }, [values]);

    // Calculate max count for color intensity
    const maxCount = useMemo(() => {
        return Math.max(...values.map(v => v.count), 1);
    }, [values]);

    // Generate calendar days
    const { days, firstDayOfWeek } = useMemo(() => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const firstDayOfWeek = firstDay.getDay();
        const daysInMonth = lastDay.getDate();

        const days = [];
        // Add empty slots for days before month starts
        for (let i = 0; i < firstDayOfWeek; i++) {
            days.push(null);
        }
        // Add days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }
        return { days, firstDayOfWeek };
    }, [month, year]);

    const getColorClass = (day) => {
        if (!day) return '';

        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const count = countMap[dateStr];

        if (!count) {
            return 'bg-gray-100';
        }

        // Calculate intensity (0 to 1)
        const intensity = Math.min(count / maxCount, 1);

        // lime color scale: light to dark
        if (intensity < 0.25) return 'bg-lime-300 text-black';
        if (intensity < 0.5) return 'bg-lime-400 text-white';
        if (intensity < 0.75) return 'bg-lime-500 text-white';
        return 'bg-lime-600 text-white';
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayLabels = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="p-4 bg-white rounded-lg shadow max-w-72">
            <div className="mb-2">
                <h2 className="text-lg font-semibold text-gray-800">
                    {monthNames[month]} {year}
                </h2>
            </div>

            {/* Day labels */}
            <div className="grid grid-cols-7 gap-1 mb-1">
                {dayLabels.map(label => (
                    <div key={label} className="text-center text-sm font-medium text-gray-600 py-2">
                        {label}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, idx) => (
                    <div
                        key={idx}
                        className={`aspect-square rounded flex items-center justify-center text-sm font-medium transition-colors duration-200 select-none ${day ? 'cursor-pointer hover:opacity-80' : ''} ${getColorClass(day)} `}>
                        {day && <span className={day && countMap[`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`] > 0 ? '' : 'text-gray-700'}>{day}</span>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MonthCalendar;
