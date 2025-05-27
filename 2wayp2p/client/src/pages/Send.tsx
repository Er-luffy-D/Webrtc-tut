import { useEffect, useRef, useState } from "react";

export const Send = () => {
	const [sender, setSender] = useState<null | WebSocket>(null);
	const pcRef = useRef<RTCPeerConnection | null>(null);
	const videoRef = useRef<HTMLVideoElement>(null);
	const remoteRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		const socket = new WebSocket("ws://localhost:8080");
		socket.onopen = () => {
			socket.send(JSON.stringify({ type: "sender" }));
			setSender(socket);
		};

		// Set up message handler ONCE
		socket.onmessage = async (message) => {
			const data = JSON.parse(message.data);
			const pc = pcRef.current;
			if (!pc) return;
			if (data.type === "create-answer") {
				await pc.setRemoteDescription(data.sdp);
			} else if (data.type === "ice-candidate") {
				await pc.addIceCandidate(data.candidate);
			} else if (data.type === "create-offer") {
				// Optional: handle renegotiation if needed
				await pc.setRemoteDescription(data.sdp);
			}
		};
	}, []);

	const SendVideo = async () => {
		if (!sender) return;

		// getting stream
		const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

		if (videoRef.current) {
			videoRef.current.srcObject = stream;
			videoRef.current.play();
		}

		const pc = new RTCPeerConnection();
		pcRef.current = pc;

		// adding stream in pc
		stream.getTracks().forEach((track) => {
			pc.addTrack(track, stream);
		});

		// ice
		pc.onicecandidate = (event) => {
			if (event.candidate) {
				sender.send(JSON.stringify({ type: "ice-candidate", candidate: event.candidate }));
			}
		};

		// if getting video from remote
		pc.ontrack = (event) => {
			if (remoteRef.current) {
				remoteRef.current.srcObject = event.streams[0];
				remoteRef.current.play();
			}
		};

		// sending offer
		const offer = await pc.createOffer();
		await pc.setLocalDescription(offer);
		sender.send(JSON.stringify({ type: "create-offer", sdp: offer }));
	};

	return (
		<div>
			click to send videos
			<button onClick={SendVideo}>click to start</button>
			<div className="flex items-center justify-between">
				<video ref={videoRef} autoPlay playsInline></video>
				<video ref={remoteRef} autoPlay playsInline></video>
			</div>
		</div>
	);
};
