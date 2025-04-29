# WebRTC

WebRTC is a protocol that enables real-time communication directly from within a browser.

It is particularly useful in scenarios where high latency is not acceptable.

---

## Comparison with Other Streaming Technologies

- **HLS**: ~10s delay (commonly used in cricket matches, YouTube live streams, etc.)
- **WebRTC**: ~0.1s delay (used in Google Meet, etc.)

---

## Common WebRTC Jargon

### 1. P2P (Peer-to-Peer)

A direct connection between two peers that allows them to send data/media without needing a central server.

### 2. Signaling Server

Before browsers can communicate directly, they need to exchange network information. A signaling server facilitates this exchange.

### 3. STUN (Session Traversal Utilities for NAT)

STUN servers help determine a device's public IP address and provide ICE (IP combination) candidates. These candidates are sent to the other browser via the signaling server.

> Once both browsers have exchanged the necessary information, the signaling and STUN servers are no longer needed for communication.

### 4. ICE Candidates (Interactive Connectivity Establishment)

These are potential networking endpoints used to establish a connection between peers.

### 5. TURN Server

If a network is too restrictive and blocks peer-to-peer connections, a TURN server is used to relay media between the two browsers.

### 6. Offer

The process where the initiating browser sends its ICE candidates to the other browser.

### 7. Answer

The response from the receiving browser containing its own ICE candidates.

### 8. SDP (Session Description Protocol)

A file or string that contains:

- ICE candidates
- Media types and formats to be shared
- Encoding protocols used

### 9. RTCPeerConnection

A browser-provided class that:

- Allows you to work with SDP
- Lets you create offers and answers
- Functions similarly to the `fetch` or `WebSocket` APIs

---

## Summary

WebRTC is a powerful browser-based protocol for low-latency, peer-to-peer communication. It's essential for modern web applications that require real-time audio, video, or data sharing.
