import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock Data Generator based on name hash to be deterministic-ish
    const hashData = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return Math.abs(hash);
    };

    const seed = name ? hashData(name) : 12345;
    const rand = (min: number, max: number) => {
        const x = Math.sin(seed + min + max) * 10000;
        return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
    };

    const mockData = {
        overview: [
            { subject: 'Batting', A: rand(60, 95), fullMark: 100 },
            { subject: 'Bowling', A: rand(40, 90), fullMark: 100 },
            { subject: 'Fielding', A: rand(50, 99), fullMark: 100 },
            { subject: 'Fitness', A: rand(70, 95), fullMark: 100 },
            { subject: 'Experience', A: rand(30, 100), fullMark: 100 },
            { subject: 'Consistency', A: rand(50, 90), fullMark: 100 },
        ],
        trends: Array.from({ length: 10 }).map((_, i) => ({
            match: `M${i + 1}`,
            value: rand(10, 100),
            average: 50 + rand(-5, 5)
        })),
        stats: [
            { name: 'Matches', value: rand(50, 200) },
            { name: 'Runs', value: rand(1000, 5000) },
            { name: 'Wickets', value: rand(10, 150) },
            { name: 'Catches', value: rand(20, 100) },
            { name: 'Stumpings', value: rand(0, 20) },
        ],
        info: {
            age: rand(18, 40),
            specialism: ['BATSMAN', 'BOWLER', 'ALL-ROUNDER', 'WICKETKEEPER'][rand(0, 3)],
            caps: {
                test: rand(0, 100),
                odi: rand(0, 250),
                t20: rand(0, 150)
            },
            ipl: {
                matches: rand(0, 200),
                team_2025: ['MI', 'CSK', 'RCB', 'KKR', 'GT', 'LSG', 'RR', 'DC', 'PBKS', 'SRH'][rand(0, 9)],
                status_2025: rand(0, 1) > 0.5 ? 'RETAINED' : 'AUCTION',
                cua_status: ['CAPPED', 'UNCAPPED', 'ASSOCIATE'][rand(0, 2)],
                reserve_price: `${rand(20, 200)} Lakh`
            }
        }
    };

    return NextResponse.json({ data: mockData });
}
