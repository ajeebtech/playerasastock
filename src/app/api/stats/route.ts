import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const name = searchParams.get('name');

    if (!id && !name) {
        return NextResponse.json({ error: 'Missing id or name parameter' }, { status: 400 });
    }

    if (!supabase) {
        return NextResponse.json({ error: 'Supabase client not initialized' }, { status: 500 });
    }

    let dbQuery = supabase.from('players').select('*');
    if (id) {
        dbQuery = dbQuery.eq('list_sr_no', id);
    } else if (name) {
        dbQuery = dbQuery.ilike('name', name);
    }

    const { data: player, error } = await dbQuery.single();

    if (error || !player) {
        return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // Mock Data Generator for Graphs (preserving existing visualization logic)
    const seed = player.list_sr_no || 12345;
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
            { name: 'Matches', value: (player.test_caps || 0) + (player.odi_caps || 0) + (player.t20_caps || 0) + (player.ipl || 0) },
            { name: 'Runs', value: rand(1000, 5000) }, // Runs not in CSV
            { name: 'Wickets', value: rand(10, 150) }, // Wickets not in CSV
            { name: 'Catches', value: rand(20, 100) },
            { name: 'Stumpings', value: rand(0, 20) },
        ],
        info: {
            age: player.age,
            specialism: player.specialism,
            batting_style: player.batting_style,
            bowling_style: player.bowling_style,
            caps: {
                test: player.test_caps || 0,
                odi: player.odi_caps || 0,
                t20: player.t20_caps || 0
            },
            ipl: {
                team_2025: player.team_2025 || 'DNP',
                status_2025: 'AUCTION',
                cua_status: player.cua,
                reserve_price: player.reserve_price ? `₹${player.reserve_price} Lakh` : 'N/A'
            }
        },
        form: {
            batting: player.batting_form,
            bowling: player.bowling_form
        }
    };

    return NextResponse.json({ data: mockData });
}
