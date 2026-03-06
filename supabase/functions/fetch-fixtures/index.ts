const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('APIFOOTBALL_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'APIFOOTBALL_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const today = new Date().toISOString().split('T')[0];
    console.log('Fetching fixtures for date:', today);

    const headers = { 'x-apisports-key': apiKey };

    // Try today first, then next 7 days, then upcoming
    let allFixtures: any[] = [];

    // Attempt 1: today's fixtures
    const res1 = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}`, { headers });
    const data1 = await res1.json();
    if (res1.ok) allFixtures = data1.response || [];

    // Attempt 2: if empty, try next 3 days
    if (allFixtures.length === 0) {
      for (let d = 1; d <= 3; d++) {
        const date = new Date();
        date.setDate(date.getDate() + d);
        const dateStr = date.toISOString().split('T')[0];
        console.log('Trying date:', dateStr);
        const res = await fetch(`https://v3.football.api-sports.io/fixtures?date=${dateStr}`, { headers });
        const data = await res.json();
        if (res.ok && data.response?.length > 0) {
          allFixtures = data.response;
          break;
        }
      }
    }

    // Attempt 3: if still empty, fetch next 100 upcoming fixtures
    if (allFixtures.length === 0) {
      console.log('No fixtures found in next 3 days, fetching next upcoming');
      const res = await fetch(`https://v3.football.api-sports.io/fixtures?next=100`, { headers });
      const data = await res.json();
      if (res.ok) allFixtures = data.response || [];
    }

    const fixtures = allFixtures.map((fixture: any) => ({
      id: `fixture-${fixture.fixture.id}`,
      homeTeam: fixture.teams.home.name,
      awayTeam: fixture.teams.away.name,
      league: fixture.league.name,
      country: fixture.league.country,
      time: new Date(fixture.fixture.date).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      date: fixture.fixture.date,
      fixtureId: fixture.fixture.id,
      status: fixture.fixture.status.short,
    }));

    console.log(`Found ${fixtures.length} fixtures`);

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
