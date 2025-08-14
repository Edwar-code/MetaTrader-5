
'use client';

import React from 'react';
import { 
    WheelCrosshairIcon, 
    WheelFunctionIcon, 
    WheelObjectsIcon, 
    WheelSettingsIcon, 
    WheelTrendlineIcon 
} from './TimeframeWheelIcons';

interface TimeframeWheelProps {
    isOpen: boolean;
    onClose: () => void;
    selectedInterval: string;
    onSelectInterval: (interval: string) => void;
}

const wheelItems = [
    { label: 'M1', value: '1m', type: 'time' },
    { label: 'M5', value: '5m', type: 'time' },
    { label: 'M15', value: '15m', type: 'time' },
    { label: 'M30', value: '30m', type: 'time' },
    { label: 'H1', value: '1h', type: 'time' },
    { label: 'H4', value: '4h', type: 'time' },
    { label: 'D1', value: '1d', type: 'time' },
    { label: 'W1', value: '1W', type: 'time' },
    { label: 'MN', value: '1M', type: 'time' },
    { icon: <WheelObjectsIcon />, value: 'objects', type: 'tool' },
    { icon: <WheelFunctionIcon />, value: 'functions', type: 'tool' },
    { icon: <WheelSettingsIcon />, value: 'settings', type: 'tool' },
    { icon: <WheelCrosshairIcon />, value: 'crosshair', type: 'tool' },
    { icon: <WheelTrendlineIcon />, value: 'trendline', type: 'tool' },
];

const RADIUS = 110; // Main circle radius in px
const ITEM_RADIUS = 20; // Radius of each item circle

export function TimeframeWheel({ isOpen, onClose, selectedInterval, onSelectInterval }: TimeframeWheelProps) {
    if (!isOpen) return null;

    const handleSelect = (value: string, type: string) => {
        if (type === 'time') {
            onSelectInterval(value);
        } else {
            console.log('Tool selected:', value);
            onClose();
        }
    };

    return (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-transparent" onClick={onClose}>
            <div className="relative" onClick={(e) => e.stopPropagation()}>
                {/* Main blue circle */}
                <div
                    className="absolute rounded-full"
                    style={{
                        width: `${RADIUS * 2}px`,
                        height: `${RADIUS * 2}px`,
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'hsl(var(--primary))',
                        opacity: 0.9,
                    }}
                ></div>

                {/* Inner transparent circle with border */}
                <div
                    className="absolute rounded-full border-2 border-white/50"
                    style={{
                        width: `${(RADIUS - 35) * 2}px`,
                        height: `${(RADIUS - 35) * 2}px`,
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}
                ></div>


                {/* Items on the wheel */}
                <div
                    className="relative rounded-full"
                    style={{
                        width: `${RADIUS * 2}px`,
                        height: `${RADIUS * 2}px`,
                    }}
                >
                    {wheelItems.map((item, index) => {
                        const angle = (index / wheelItems.length) * 2 * Math.PI - Math.PI / 2; // Subtract PI/2 to start from top
                        const x = RADIUS + RADIUS * Math.cos(angle) - ITEM_RADIUS;
                        const y = RADIUS + RADIUS * Math.sin(angle) - ITEM_RADIUS;

                        const isSelected = item.type === 'time' && item.value === selectedInterval;

                        return (
                            <div
                                key={item.value}
                                className={`absolute flex items-center justify-center rounded-full cursor-pointer transition-transform duration-150 hover:scale-110`}
                                style={{
                                    left: `${x}px`,
                                    top: `${y}px`,
                                    width: `${ITEM_RADIUS * 2}px`,
                                    height: `${ITEM_RADIUS * 2}px`,
                                }}
                                onClick={() => handleSelect(item.value, item.type)}
                            >
                                <div
                                    className={`flex items-center justify-center w-full h-full rounded-full ${isSelected ? 'bg-white' : 'bg-transparent'}`}
                                >
                                    <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-white'}`}>
                                        {item.label || item.icon}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
