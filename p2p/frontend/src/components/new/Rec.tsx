import { useEffect, useRef, useState } from "react";

export const Sender = () => {
	const videref = useRef<HTMLVideoElement>(null);
	const pcRef = useRef<RTCPeerConnection | null>(null);
	const socketRef = useRef<WebSocket | null>(null);

	useEffect(() => {
		const socket = new WebSocket("ws://localhost:8080");
		socket.onopen = () => {
			socket.send(JSON.stringify({ type: "sender" }));
		};

		socket.onmessage = async (event) => {
			const message = JSON.parse(event.data);
			const pc = pcRef.current;
			if (!pc) return;

			if (message.type === "createAnswer") {
				await pc.setRemoteDescription(message.sdp);
			} else if (message.type === "iceCandidate") {
				await pc.addIceCandidate(message.candidate);
			}
		};

		socketRef.current = socket;
	}, []);

	async function startSendVideo() {
		const socket = socketRef.current;
		if (!socket) return;

		const stream = await navigator.mediaDevices.getUserMedia({ video: true });
		if (videref.current) {
			videref.current.srcObject = stream;
			videref.current.play();
		}

		const pc = new RTCPeerConnection();
		pcRef.current = pc;

		// Add tracks first
		stream.getTracks().forEach((track) => {
			pc.addTrack(track, stream);
		});

		// ICE candidates
		pc.onicecandidate = (event) => {
			if (event.candidate) {
				socket.send(JSON.stringify({ type: "iceCandidate", candidate: event.candidate }));
			}
		};

		// Offer
		const offer = await pc.createOffer();
		await pc.setLocalDescription(offer);
		socket.send(JSON.stringify({ type: "createOffer", sdp: offer }));
	}

	return (
		<div>
			Sender
			<button onClick={startSendVideo}>Click</button>
			<video ref={videref} autoPlay playsInline controls />
		</div>
	);
};
