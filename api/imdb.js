export default async function handler(req, res) {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'invalid parameters' });
  }

  try {
    // Server-to-server request bypasses CORS
    const response = await fetch(`https://imdb.iamidiotareyoutoo.com/search?q=${encodeURIComponent(q)}`);
    const data = await response.json();
    
    // Send the successful operation data back to React
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'internal server error' });
  }
}