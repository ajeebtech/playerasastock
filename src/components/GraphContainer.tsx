'use client';

import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    BarChart, Bar, ResponsiveContainer
} from 'recharts';

interface GraphContainerProps {
    data: any;
    graphType: 'OVERVIEW' | 'TRENDS' | 'STATS';
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
                        {entry.value}
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

    return null;
}
