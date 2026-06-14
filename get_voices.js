async function getVoices() {
  const res = await fetch('https://api.elevenlabs.io/v1/voices');
  const data = await res.json();
  const voices = data.voices.slice(0, 10).map(v => `${v.name}: ${v.voice_id}`);
  console.log(voices);
}
getVoices();
