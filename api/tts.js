export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.query;
  if (!text) {
    return res.status(400).json({ error: 'Text query parameter is required' });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    // Si no hay API Key, regresamos un 503 Service Unavailable
    // para que el cliente sepa que no puede usar TTS
    return res.status(503).json({ error: 'ELEVENLABS_API_KEY is not configured' });
  }

  // Usaremos un Voice ID masculino profundo en español, o uno estándar de ElevenLabs.
  // Adam: pNInz6obpgDQGcFmaJcg
  // Antoni: ErXwobaYiN019PkySvjV (bueno para noticias)
  // Arnold: VR6AewLTigWG4xSOukaG
  const voiceId = 'pNInz6obpgDQGcFmaJcg'; 

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('ElevenLabs API Error:', err);
      return res.status(response.status).json({ error: 'ElevenLabs API error' });
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    const buffer = await response.arrayBuffer();
    return res.status(200).send(Buffer.from(buffer));
  } catch (error) {
    console.error('Error fetching TTS:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
