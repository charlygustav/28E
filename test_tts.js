async function test() {
  const voiceId = 'pNInz6obpgDQGcFmaJcg';
  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': 'dummy' // Will probably get 401 Unauthorized
      },
      body: JSON.stringify({
        text: 'Hola',
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });
    console.log('Status:', res.status);
    console.log('Body:', await res.text());
  } catch (e) {
    console.error(e);
  }
}
test();
