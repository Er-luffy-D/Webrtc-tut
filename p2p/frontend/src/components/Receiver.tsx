import { useEffect } from "react";

export const Receiver = () => {
	useEffect(() => {
		const socket = new WebSocket("ws://localhost:8080");
		let pc: RTCPeerConnection | null = null;
		socket.onopen = () => {
			socket.send(JSON.stringify({ type: "receiver" }));
		};

		// receiving offer from sender
		socket.onmessage = async (event) => {
			const message = JSON.parse(event.data);
			if (message.type === "createOffer") {
				pc = new RTCPeerConnection();

				// ice candidate is not showing since we are not sending any video so lets send video and receive it here
				pc.onicecandidate = (data) => {
					console.log(data);
					if (data.candidate) {
						socket.send(JSON.stringify({ type: "iceCandidate", candidate: data.candidate }));
					}
				};

				pc.ontrack = (event) => {
					console.log("re");
					const stream = event.streams[0];
					const video = document.createElement("video");
					document.body.appendChild(video);
					video.srcObject = stream;
					video.autoplay = true;
				};

				await pc.setRemoteDescription(message.sdp);

				const answer = await pc.createAnswer();
				await pc.setLocalDescription(answer);
				socket.send(JSON.stringify({ type: "createAnswer", sdp: answer }));
			} else if (message.type === "iceCandidate") {
				if (pc) {
					// done by me
					console.log(message);
					await pc.addIceCandidate(message.candidate);
				}
			}
		};
	}, []);

	return <div>Receiver</div>;
};
