import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const term = searchParams.get('term') || searchParams.get('q');

    if (!term) {
        return NextResponse.json({ error: 'Missing or invalid term parameter' }, { status: 400 });
    }

    // Mock search results for empty database
    // Returns 3 mock players matching the term
    const results = [
        {
            id: `${term}-1`,
            name: term,
            team: 'Mock Team A',
            country: 'IN',
        },
        {
            id: `${term}-2`,
            name: `${term} Jr.`,
            team: 'Mock Team B',
            country: 'AU',
        },
        {
            id: `${term}-3`,
            name: `Sir ${term}`,
            team: 'Mock Team C',
            country: 'GB',
        }
    ];

    return NextResponse.json({ results });
}
