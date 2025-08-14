
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

const RADIUS = 140; // Main circle radius in px
const ITEM_RADIUS = 20; // Radius of each item circle
const ICON_RING_RADIUS = RADIUS - 22; // Radius for positioning icons on the blue ring

export function TimeframeWheel({ isOpen, onClose, selectedInterval, onSelectInterval }: TimeframeWheelProps) {
    if (!isOpen) return null;

    const handleSelect = (value: string, type: string) => {
        if (type === 'time') {
            onSelectInterval(value);
        } else {
            console.log('Tool selected:', value);
            onClose(); // Close for tools as well
        }
    };

    return (
        <div className="absolute inset-0 z-30 flex items-center justify-center" onClick={onClose}>
            <div className="relative" style={{ width: `${(RADIUS + ITEM_RADIUS) * 2}px`, height: `${(RADIUS + ITEM_RADIUS) * 2}px` }} onClick={(e) => e.stopPropagation()}>
                
                {/* Blue Ring for icons */}
                <div
                    className="absolute rounded-full bg-primary"
                     style={{
                        width: `${RADIUS * 2}px`,
                        height: `${RADIUS * 2}px`,
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}
                ></div>

                {/* Inner transparent circle with border */}
                <div
                    className="absolute rounded-full border-2 border-primary/50 bg-card"
                    style={{
                        width: `${(RADIUS - 50) * 2}px`,
                        height: `${(RADIUS - 50) * 2}px`,
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}
                ></div>


                {/* Items on the wheel */}
                <div
                    className="relative rounded-full"
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                >
                    {wheelItems.map((item, index) => {
                        const angle = (index / wheelItems.length) * 2 * Math.PI - Math.PI / 2; // Subtract PI/2 to start from top
                        const x = RADIUS + ITEM_RADIUS + ICON_RING_RADIUS * Math.cos(angle);
                        const y = RADIUS + ITEM_RADIUS + ICON_RING_RADIUS * Math.sin(angle);

                        return (
                            <div
                                key={item.value}
                                className={`absolute flex items-center justify-center rounded-full cursor-pointer transition-transform duration-150 hover:scale-110`}
                                style={{
                                    left: `${x}px`,
                                    top: `${y}px`,
                                    width: `${ITEM_RADIUS * 2}px`,
                                    height: `${ITEM_RADIUS * 2}px`,
                                    transform: 'translate(-50%, -50%)',
                                }}
                                onClick={() => handleSelect(item.value, item.type)}
                            >
                                <div
                                    className={`flex items-center justify-center w-full h-full rounded-full bg-transparent`}
                                >
                                    <span className={`text-xs font-medium text-white`}>
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
