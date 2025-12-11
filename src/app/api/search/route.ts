import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const term = searchParams.get('term') || searchParams.get('q');

    if (!term) {
        return NextResponse.json({ error: 'Missing or invalid term parameter' }, { status: 400 });
    }

    if (!supabase) {
        return NextResponse.json({ error: 'Supabase client not initialized' }, { status: 500 });
    }

    try {
        const { data, error } = await supabase
            .from('data')
            .select('"List Sr. No.", "Name", "Country", "2025 Team"')
            .ilike('Name', `%${term}%`)
            .limit(10);

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const results = data?.map((player: any) => ({
            id: player['List Sr. No.'],
            name: player['Name'],
            team: player['2025 Team'],
            country: player['Country'],
        })) || [];

        return NextResponse.json({ results });
    } catch (err) {
        console.error('Unexpected error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
