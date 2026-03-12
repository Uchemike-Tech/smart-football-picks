const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('FOOTBALL_DATA_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'FOOTBALL_DATA_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const headers = { 'X-Auth-Token': apiKey };
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    console.log('Fetching fixtures from', today, 'to', nextWeekStr);

    const res = await fetch(
      `https://api.football-data.org/v4/matches?dateFrom=${today}&dateTo=${nextWeekStr}`,
      { headers }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error('API error:', res.status, errorText);
      throw new Error(`football-data.org API error: ${res.status}`);
    }

    const data = await res.json();
    const allMatches = data.matches || [];

    console.log(`Total matches fetched: ${allMatches.length}`);

    // Filter: only upcoming/scheduled/in-play matches (exclude FINISHED, POSTPONED, CANCELLED, SUSPENDED)
    const upcomingMatches = allMatches.filter((m: any) =>
      ['TIMED', 'SCHEDULED', 'IN_PLAY', 'PAUSED', 'LIVE'].includes(m.status)
    );

    console.log(`Upcoming/active matches: ${upcomingMatches.length}`);

    // Sort by date (soonest first)
    upcomingMatches.sort((a: any, b: any) =>
      new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime()
    );

    const fixtures = upcomingMatches.map((match: any) => ({
      id: `fixture-${match.id}`,
      homeTeam: match.homeTeam?.name || 'TBD',
      awayTeam: match.awayTeam?.name || 'TBD',
      league: match.competition?.name || 'Unknown',
      country: match.area?.name || 'Unknown',
      time: new Date(match.utcDate).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      date: match.utcDate,
      fixtureId: match.id,
      status: match.status,
    }));

    console.log(`Returning ${fixtures.length} upcoming fixtures`);

    return new Response(
      JSON.stringify({ success: true, fixtures, date: today }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching fixtures:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch fixtures';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
