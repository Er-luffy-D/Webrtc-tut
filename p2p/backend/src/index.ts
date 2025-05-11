import { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

let senderSocket: null | WebSocket = null;
let recieverSocket: null | WebSocket = null;
wss.on("connection", (ws) => {
	ws.on("error", (e) => {
		console.error(e);
	});
	ws.on("message", (data: string) => {
		const message = JSON.parse(data);
		if (message.type === "sender") {
			console.log("Sender set");

			senderSocket = ws;
		} else if (message.type === "receiver") {
			console.log("receiver set");
			recieverSocket = ws;
		} else if (message.type === "createOffer") {
			if (ws !== senderSocket) {
				return;
			}
			console.log("offer received");
			recieverSocket?.send(JSON.stringify({ type: "createOffer", sdp: message.sdp }));
		} else if (message.type === "createAnswer") {
			if (ws !== recieverSocket) {
				return;
			}
			console.log("answer received");
			senderSocket?.send(JSON.stringify({ type: "createAnswer", sdp: message.sdp }));
		} else if (message.type === "iceCandidate") {
			console.log("icy icy");
			if (ws === senderSocket) {
				// if sender socket sent an ice candidate we need to send it to receiver socket
				recieverSocket?.send(JSON.stringify({ type: "iceCandidate", candidate: message.candidate }));
			} else if (ws === recieverSocket) {
				// if receiver socket sent an ice candidate we need to send it to sender socket
				senderSocket?.send(JSON.stringify({ type: "iceCandidate", candidate: message.candidate }));
			}
		}
	});
});
