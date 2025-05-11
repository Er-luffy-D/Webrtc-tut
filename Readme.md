# WebRTC: Real-Time Communication in the Browser

WebRTC (Web Real-Time Communication) is a powerful protocol that enables direct, low-latency communication—audio, video, or data—between browsers without requiring any plugins.

> ✅ Ideal for real-time applications like video conferencing, live broadcasting, and interactive games.

---

## ⚖️ WebRTC vs. Other Streaming Technologies

| Technology | Typical Latency | Use Cases |
|-----------|----------------|-----------|
| **HLS**   | ~10 seconds    | YouTube Live, sports streaming |
| **WebRTC**| ~0.1 seconds   | Google Meet, live classrooms   |

---

## 🔑 WebRTC Key Concepts

### 1. 📡 P2P (Peer-to-Peer)
Direct connection between two users for real-time communication, minimizing delay and server costs.

### 2. 🛰️ Signaling Server
Facilitates the initial exchange of connection details like ICE candidates and SDP—essential for establishing the peer-to-peer connection.

### 3. 🌍 STUN (Session Traversal Utilities for NAT)
Helps discover public IP addresses behind NAT (Network Address Translation).

### 4. 🌐 ICE Candidates
Network endpoint options shared between browsers to determine the best connection path.

### 5. 🔁 TURN Server
Relays data if a direct P2P connection cannot be established due to strict firewalls or NAT.

### 6. 📤 Offer & 📥 Answer
- **Offer**: Initiator sends its media configuration and ICE candidates.
- **Answer**: Receiver responds with its configuration.

### 7. 📄 SDP (Session Description Protocol)
Contains metadata including:
- Codec info
- Media capabilities
- ICE candidates

### 8. 🔧 RTCPeerConnection API
Core WebRTC API enabling:
- Creation of offers/answers
- Adding media tracks
- Monitoring connection state

---

## 🧱 Architectures Built on WebRTC

### 1. SFU (Selective Forwarding Unit)

Each client sends its media stream to the SFU, which then forwards them to all other participants without decoding them.

**Popular SFUs**: 
- [mediasoup](https://mediasoup.org/)
- [Pion](https://pion.ly/) (can be used to build SFUs)

**Diagram**:
```
 [Client A] -->       |
 [Client B] -->  SFU  |--> [Client A, B, C]
 [Client C] -->       |
```

### 2. MCU (Multipoint Control Unit)

Server receives all streams, decodes them, merges them into a single stream, then sends the result back to all participants.

**Steps**:
- Decode incoming streams (e.g. using FFmpeg)
- Mix into a single stream
- Broadcast the combined output

**Diagram**:
```
[Client A] --> 
[Client B] -->  MCU --> [Merged Output] --> All clients
[Client C] -->
```

---

## ✅ Summary

- **WebRTC** provides ultra-low latency and is perfect for browser-based real-time communication.
- Unlike traditional streaming (e.g., HLS), WebRTC uses a decentralized peer-to-peer model.
- Core concepts include ICE, SDP, signaling, and P2P.
- WebRTC can be scaled using SFU or MCU architectures depending on the use case.

---

## 📚 Further Reading

- [WebRTC Official Site](https://webrtc.org/)
- [MDN WebRTC Guide](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)

