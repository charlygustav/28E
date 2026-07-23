import re

with open('voice-channel-widget.js', 'r', encoding='utf-8') as f:
    content = f.read()

# I want to inject LiveKit UMD loading.
# Inside _connectSocket, after checking window.io
livekit_loader = """
      const loadDependencies = async () => {
        if (!window.io) {
          await new Promise(r => {
            const sc = document.createElement('script');
            sc.src = 'https://cdn.socket.io/4.7.4/socket.io.min.js';
            sc.onload = r;
            document.head.appendChild(sc);
          });
        }
        if (!window.LivekitClient) {
          await new Promise(r => {
             const sc = document.createElement('script');
             sc.src = 'https://cdn.jsdelivr.net/npm/livekit-client/dist/livekit-client.umd.min.js';
             sc.onload = r;
             document.head.appendChild(sc);
          });
        }
        if (!window.LivekitKrisp) {
           await new Promise(r => {
             const sc = document.createElement('script');
             sc.src = 'https://cdn.jsdelivr.net/npm/@livekit/krisp-noise-filter/dist/livekit-krisp-noise-filter.umd.js';
             sc.onload = r;
             document.head.appendChild(sc);
          });
        }
        doConnect();
      };
      loadDependencies();
"""

# Find the end of `_connectSocket` and replace the socket.io script loading
content = re.sub(r'if \(window\.io\) \{.*?document\.head\.appendChild\(sc\);\s*\}', livekit_loader, content, flags=re.DOTALL)

with open('voice-channel-widget.js', 'w', encoding='utf-8') as f:
    f.write(content)
