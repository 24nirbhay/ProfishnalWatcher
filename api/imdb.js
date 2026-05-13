export default async function handler(req, res) {
  const { q, type } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'invalid parameters' });
  }

  try {
    const omdbKey = process.env.OMDB_API_KEY; // TODO: Use env var in production
    const typeParam = type ? `&type=${type}` : '';
    const url = `https://www.omdbapi.com/?s=${encodeURIComponent(q)}${typeParam}&apikey=${omdbKey}`;
    
    console.log('OMDB Request URL:', url);
    
    // Server-to-server request bypasses CORS
    const response = await fetch(url);
    const contentType = response.headers.get('content-type');

    const rawBody = await response.text();

    const parseBody = () => {
      try {
        return JSON.parse(rawBody);
      } catch {
        return { Response: 'False', Error: 'Non-JSON response from OMDB' };
      }
    };
    
    if (!response.ok) {
      console.error('OMDB API Error - Status:', response.status);
      return res.status(response.status).json({ error: 'OMDB API returned error', body: rawBody.slice(0, 300) });
    }
    
    if (!contentType || !contentType.includes('application/json')) {
      console.error('OMDB API returned non-JSON:', contentType, rawBody.slice(0, 300));
      return res.status(200).json(parseBody());
    }
    
    const data = parseBody();
    
    console.log('OMDB Response:', data);
    
    // Send the successful operation data back to React
    res.status(200).json(data);
  } catch (error) {
    console.error('Handler Error:', error);
    res.status(500).json({ error: 'internal server error', details: error.message });
  }
}