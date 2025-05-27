import { useEffect, useRef, useState } from "react";

export const Receive = () => {
	const localRef = useRef<HTMLVideoElement>(null);
	const RemoteRef = useRef<HTMLVideoElement>(null);
	const [socket, setSocket] = useState<WebSocket | null>(null);
	const peer = useRef<RTCPeerConnection | null>(null);

	// Move handleVideo inside the offer handler, so we add tracks after peer connection is created
	const handleVideo = async (pc: RTCPeerConnection) => {
		const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
		if (localRef.current) {
			localRef.current.srcObject = stream;
			localRef.current.play();
		}
		stream.getTracks().forEach((track) => {
			pc.addTrack(track, stream);
		});
	};

	useEffect(() => {
		const socket = new WebSocket("ws://localhost:8080/");
		socket.onopen = () => {
			socket.send(JSON.stringify({ type: "receiver" }));
		};
		setSocket(socket);

		// receiving offer from sender
		socket.onmessage = async (event) => {
			const message = JSON.parse(event.data);
			if (message.type === "create-offer") {
				const pc = new RTCPeerConnection();
				peer.current = pc;

				pc.onicecandidate = (data) => {
					console.log(data);
					if (data.candidate) {
						socket.send(JSON.stringify({ type: "ice-candidate", candidate: data.candidate }));
					}
				};

				pc.ontrack = (event) => {
					console.log("Remote track received");
					const stream = event.streams[0];
					if (RemoteRef.current) {
						RemoteRef.current.srcObject = stream;
						RemoteRef.current.play();
					}
				};

				await pc.setRemoteDescription(message.sdp);

				// Add this: get and add local stream to connection
				await handleVideo(pc);

				const answer = await pc.createAnswer();
				await pc.setLocalDescription(answer);
				socket.send(JSON.stringify({ type: "create-answer", sdp: answer }));
			} else if (message.type === "ice-candidate") {
				if (peer.current) {
					// done by me
					console.log(message);
					await peer.current.addIceCandidate(message.candidate);
				}
			}
		};
		// Remove handleVideo() from here
	}, []);

	return (
		<div>
			Receive
			<video ref={localRef}></video>
			<video ref={RemoteRef}></video>
		</div>
	);
};
