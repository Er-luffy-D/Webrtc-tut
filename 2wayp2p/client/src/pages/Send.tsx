import { useEffect, useRef, useState } from "react";

export const Send = () => {
	const [sender, setSender] = useState<null | WebSocket>(null);
	const [pc, setPc] = useState<null | RTCPeerConnection>(null);
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		const socket = new WebSocket("ws://localhost:8080");
		socket.onopen = () => {
			socket.send(JSON.stringify({ type: "sender" }));
			setSender(socket);
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
		setPc(pc);

		// adding stream in pc
		stream.getTracks().forEach((track) => {
			pc.addTrack(track, stream);
		});

		// ice
		pc.onicecandidate = (event) => {
			console.log(event);
			if (event.candidate) {
				sender.send(JSON.stringify({ type: "ice-candidate", candidate: event.candidate }));
			}
		};

		// sending offer
		pc.onnegotiationneeded = async () => {
			console.log("negotiation !!");
			const offer = await pc.createOffer();
			await pc.setLocalDescription(offer);
			sender.send(JSON.stringify({ type: "create-offer", sdp: offer }));
		};

		// receiving
		sender.onmessage = async (message) => {
			const data = JSON.parse(message.data);
			if (data.type === "create-answer") {
				await pc.setRemoteDescription(data.sdp);
			} else if (data.type === "ice-candidate") {
				await pc.addIceCandidate(data.candidate);
			}
		};
	};

	return (
		<div>
			click to send videos
			<button onClick={SendVideo}>click to start</button>
			<div className="flex items-center justify-between">
				<video ref={videoRef}></video>
				{/* <video ref={videoRef}></video> */}
			</div>
		</div>
	);
};
