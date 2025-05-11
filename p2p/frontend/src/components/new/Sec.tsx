import { useEffect } from "react";

export const Receiver = () => {
	useEffect(() => {
		const socket = new WebSocket("ws://localhost:8080");
		let pc: RTCPeerConnection | null = null;

		socket.onopen = () => {
			socket.send(JSON.stringify({ type: "receiver" }));
		};

		socket.onmessage = async (event) => {
			const message = JSON.parse(event.data);

			if (message.type === "createOffer") {
				pc = new RTCPeerConnection();

				pc.onicecandidate = (event) => {
					if (event.candidate) {
						socket.send(JSON.stringify({ type: "iceCandidate", candidate: event.candidate }));
					}
				};

				pc.ontrack = (event) => {
					console.log("Track received:", event);
					const video = document.createElement("video");
					video.srcObject = event.streams[0];
					video.autoplay = true;
					video.playsInline = true;
					video.controls = true;
					document.body.appendChild(video);
				};

				await pc.setRemoteDescription(message.sdp);
				const answer = await pc.createAnswer();
				await pc.setLocalDescription(answer);
				socket.send(JSON.stringify({ type: "createAnswer", sdp: answer }));
			} else if (message.type === "iceCandidate" && pc) {
				await pc.addIceCandidate(message.candidate);
			}
		};
	}, []);

	return <div>Receiver</div>;
};
