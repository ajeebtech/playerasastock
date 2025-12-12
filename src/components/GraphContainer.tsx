'use client';

import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    BarChart, Bar, ResponsiveContainer
} from 'recharts';
import { useState, useEffect } from 'react';

interface GraphContainerProps {
    data: any;
    graphType: 'OVERVIEW' | 'TRENDS' | 'STATS' | 'FORM';
    color?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                backgroundColor: '#050505',
                border: '1px solid #333',
                padding: '1rem',
                fontFamily: 'monospace'
            }}>
                <p style={{ color: '#fff', fontWeight: 900, marginBottom: '0.5rem', textTransform: 'uppercase' }}>{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} style={{ color: entry.color || '#fff', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 'bold' }}>{entry.name}: </span>
                        {entry.name === 'Wickets' && entry.payload.bowlingFigure ? entry.payload.bowlingFigure : entry.value}
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function GraphContainer({ data, graphType, color = '#2563EB' }: GraphContainerProps) {
    if (!data) return <div style={{ color: '#666', textAlign: 'center', marginTop: '50px' }}>No Data Available</div>;

    if (graphType === 'OVERVIEW') {
        const overviewData = data.overview || [];
        return (
            <ResponsiveContainer width="100%" height={450}>
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={overviewData}>
                    <PolarGrid stroke="#444" strokeDasharray="2 2" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#fff', fontSize: 12, fontFamily: 'monospace', fontWeight: 700 }}
                    />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Radar
                        name="Player Stats"
                        dataKey="A"
                        stroke={color}
                        strokeWidth={3}
                        fill={color}
                        fillOpacity={0.4}
                    />
                </RadarChart>
            </ResponsiveContainer>
        );
    }

    if (graphType === 'TRENDS') {
        const trendsData = data.trends || [];
        return (
            <ResponsiveContainer width="100%" height={450}>
                <LineChart data={trendsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="match" stroke="#666" style={{ fontFamily: 'monospace' }} />
                    <YAxis stroke="#666" style={{ fontFamily: 'monospace' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                        dot={{ fill: color }}
                    />
                    <Line
                        type="monotone"
                        dataKey="average"
                        stroke="#666"
                        strokeDasharray="5 5"
                        strokeWidth={1}
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        );
    }

    if (graphType === 'STATS') {
        const statsData = data.stats || [];
        return (
            <ResponsiveContainer width="100%" height={450}>
                <BarChart data={statsData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis type="number" stroke="#666" style={{ fontFamily: 'monospace' }} />
                    <YAxis dataKey="name" type="category" stroke="#fff" width={100} style={{ fontFamily: 'monospace', fontSize: '12px' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
            </ResponsiveContainer>
        );
    }

    if (graphType === 'FORM') {
        const battingForm = (data.form?.batting || []).slice().reverse();
        const bowlingForm = (data.form?.bowling || []).slice().reverse();
        const hasBowling = bowlingForm.length > 0;
        const isBowler = data.info?.specialism === 'BOWLER';

        const [activeForm, setActiveForm] = useState<'BATTING' | 'BOWLING'>(isBowler && hasBowling ? 'BOWLING' : 'BATTING');

        useEffect(() => {
            if (data?.info?.specialism === 'BOWLER' && data.form?.bowling?.length > 0) {
                setActiveForm('BOWLING');
            } else {
                setActiveForm('BATTING');
            }
        }, [data]);

        // Parse Data
        const formData: any[] = [];
        const maxLength = Math.max(battingForm.length, bowlingForm.length);

        let maxRuns = 0;
        let maxWickets = 0;

        for (let i = 0; i < maxLength; i++) {
            const entry: any = { match: `M${i + 1}` };

            // Batting
            if (i < battingForm.length) {
                const raw = battingForm[i];
                if (raw && raw !== '-' && raw !== 'DNB' && raw !== 'TDNB' && raw !== 'absent') {
                    const val = parseInt(raw.replace('*', ''), 10);
                    if (!isNaN(val)) {
                        entry.runs = val;
                        if (val > maxRuns) maxRuns = val;
                    }
                }
            }

            // Bowling
            if (i < bowlingForm.length) {
                const raw = bowlingForm[i];
                if (raw && raw !== '-' && raw !== 'DNB') {
                    const parts = raw.split('/');
                    if (parts.length > 0) {
                        const val = parseInt(parts[0], 10);
                        if (!isNaN(val)) {
                            entry.wickets = val;
                            entry.bowlingFigure = raw;
                            if (val > maxWickets) maxWickets = val;
                        }
                    }
                }
            }
            formData.push(entry);
        }

        const runsDomainMax = Math.max(120, maxRuns);
        const wicketsDomainMax = Math.max(5, maxWickets);
        const wicketTicks = Array.from({ length: wicketsDomainMax + 1 }, (_, i) => i);

        return (
            <div style={{ width: '100%', height: 450, position: 'relative' }}>
                {hasBowling && (
                    <div style={{ position: 'absolute', top: -40, right: 0, zIndex: 10, display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => setActiveForm('BATTING')}
                            style={{
                                padding: '4px 12px',
                                background: activeForm === 'BATTING' ? color : '#333',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontFamily: 'monospace',
                                fontWeight: 'bold'
                            }}
                        >
                            BATTING
                        </button>
                        <button
                            onClick={() => setActiveForm('BOWLING')}
                            style={{
                                padding: '4px 12px',
                                background: activeForm === 'BOWLING' ? '#10B981' : '#333',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontFamily: 'monospace',
                                fontWeight: 'bold'
                            }}
                        >
                            BOWLING
                        </button>
                    </div>
                )}

                <div style={{ position: 'absolute', bottom: 15, right: 30, fontSize: '10px', color: '#666', fontFamily: 'monospace', pointerEvents: 'none', zIndex: 1 }}>
                    &rarr; latest
                </div>

                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="match" stroke="#666" style={{ fontFamily: 'monospace' }} />
                        <YAxis
                            stroke={activeForm === 'BATTING' ? "#fff" : "#10B981"}
                            style={{ fontFamily: 'monospace' }}
                            domain={[0, activeForm === 'BATTING' ? runsDomainMax : wicketsDomainMax]}
                            allowDataOverflow={true}
                            ticks={activeForm === 'BOWLING' ? wicketTicks : undefined}
                            label={{
                                value: activeForm === 'BATTING' ? 'Runs' : 'Wickets',
                                angle: -90,
                                position: 'insideLeft',
                                fill: activeForm === 'BATTING' ? '#fff' : '#10B981'
                            }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {activeForm === 'BATTING' && (
                            <Line
                                type="monotone"
                                dataKey="runs"
                                name="Runs"
                                stroke={color}
                                strokeWidth={2}
                                activeDot={{ r: 8 }}
                                connectNulls
                            />
                        )}
                        {activeForm === 'BOWLING' && (
                            <Line
                                type="monotone"
                                dataKey="wickets"
                                name="Wickets"
                                stroke="#10B981"
                                strokeWidth={2}
                                activeDot={{ r: 8 }}
                                connectNulls
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        );
    }

    return null;
}
