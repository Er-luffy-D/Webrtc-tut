import { useEffect, useRef, useState } from "react";

export const Sender = () => {
	const videref = useRef<HTMLVideoElement>(null);
	const [socket, setsocket] = useState<WebSocket | null>(null);
	useEffect(() => {
		const socket = new WebSocket("ws://localhost:8080");
		socket.onopen = () => {
			socket.send(JSON.stringify({ type: "sender" }));
		};
		setsocket(socket);
	}, []);

	
	// acquiring video
	//
	async function startSendVideo() {
		// create an offer
		if (!socket) return;

		// getting video
		const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });

		if (videref.current) {
			videref.current.srcObject = stream;
			videref.current.play();
		}
		//

		const pc = new RTCPeerConnection();

		stream.getTracks().forEach((track) => {
			pc.addTrack(track, stream);
		});

		// ice
		pc.onicecandidate = (event) => {
			console.log(event);
			if (event.candidate) {
				socket.send(JSON.stringify({ type: "iceCandidate", candidate: event.candidate }));
			}
		};

		pc.onnegotiationneeded = async () => {
			console.log("negotiation needed");
			const offer = await pc.createOffer();
			await pc.setLocalDescription(offer);
			socket?.send(JSON.stringify({ type: "createOffer", sdp: offer }));
		};

		socket.onmessage = async (event) => {
			const message = JSON.parse(event.data);
			if (message.type === "createAnswer") {
				await pc.setRemoteDescription(message.sdp);
			} else if (message.type === "iceCandidate") {
				console.log(message);
				await pc.addIceCandidate(message.candidate);
			}
		};
	}

	return (
		<div>
			Sender
			<button onClick={startSendVideo}>CLick</button>
			<video ref={videref}></video>
		</div>
	);
};
