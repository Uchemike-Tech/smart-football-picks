const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('RAPIDAPI_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'RAPIDAPI_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    console.log('Fetching fixtures for date:', today);

    // Fetch today's fixtures from API-Football
    const response = await fetch(
      `https://api-football-v1.p.rapidapi.com/v3/fixtures?date=${today}`,
      {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('API-Football error:', data);
      return new Response(
        JSON.stringify({ success: false, error: `API request failed: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transform fixtures to our format
    const fixtures = (data.response || []).map((fixture: any) => ({
      id: `fixture-${fixture.fixture.id}`,
      homeTeam: fixture.teams.home.name,
      awayTeam: fixture.teams.away.name,
      league: fixture.league.name,
      country: fixture.league.country,
      time: new Date(fixture.fixture.date).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      fixtureId: fixture.fixture.id,
      status: fixture.fixture.status.short,
    }));

    console.log(`Found ${fixtures.length} fixtures for today`);

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
