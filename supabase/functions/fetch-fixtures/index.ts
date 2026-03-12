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

    console.log('Fetching fixtures for today only:', today);

    // Fetch only today's matches
    const res = await fetch(
      `https://api.football-data.org/v4/matches?dateFrom=${today}&dateTo=${today}`,
      { headers }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error('API error:', res.status, errorText);
      throw new Error(`football-data.org API error: ${res.status}`);
    }

    const data = await res.json();
    let matches = data.matches || [];
    let dateLabel = today;

    console.log(`Today's matches: ${matches.length}`);

    // If no matches today, try tomorrow, then day after
    if (matches.length === 0) {
      for (let d = 1; d <= 3; d++) {
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + d);
        const nextDateStr = nextDate.toISOString().split('T')[0];
        console.log('No matches today, trying:', nextDateStr);

        const nextRes = await fetch(
          `https://api.football-data.org/v4/matches?dateFrom=${nextDateStr}&dateTo=${nextDateStr}`,
          { headers }
        );

        if (nextRes.ok) {
          const nextData = await nextRes.json();
          if (nextData.matches?.length > 0) {
            matches = nextData.matches;
            dateLabel = nextDateStr;
            console.log(`Found ${matches.length} matches for ${nextDateStr}`);
            break;
          }
        } else {
          await nextRes.text(); // consume body
        }
      }
    }

    // Filter out finished matches - only show scheduled/timed/in-play
    const activeMatches = matches.filter((m: any) => 
      ['TIMED', 'SCHEDULED', 'IN_PLAY', 'PAUSED', 'LIVE'].includes(m.status)
    );

    // Use active matches if available, otherwise all matches
    const finalMatches = activeMatches.length > 0 ? activeMatches : matches;

    const fixtures = finalMatches.map((match: any) => ({
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

    console.log(`Returning ${fixtures.length} fixtures for ${dateLabel}`);

    return new Response(
      JSON.stringify({ success: true, fixtures, date: dateLabel }),
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
