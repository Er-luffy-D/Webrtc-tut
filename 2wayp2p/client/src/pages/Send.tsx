import { useEffect, useRef, useState } from "react";

export const Send = () => {
	const [sender, setSender] = useState<null | WebSocket>(null);
	const pcRef = useRef<RTCPeerConnection | null>(null);
	const videoRef = useRef<HTMLVideoElement>(null);
	const remoteRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		// create websocket connection to signaling server
		const socket = new WebSocket(import.meta.env.VITE_BACKEND_URL);
		socket.onopen = () => {
			// identify as sender to server
			socket.send(JSON.stringify({ type: "sender" }));
			setSender(socket);
		};

		// Set up message handler ONCE
		socket.onmessage = async (message) => {
			// parse incoming signaling data
			const data = JSON.parse(message.data);
			const pc = pcRef.current;
			if (!pc) return;
			if (data.type === "create-answer") {
				// set remote description with answer from receiver
				await pc.setRemoteDescription(data.sdp);
			} else if (data.type === "ice-candidate") {
				// add received ICE candidate to peer connection
				await pc.addIceCandidate(data.candidate);
			} else if (data.type === "create-offer") {
				// Optional: handle renegotiation if needed
				await pc.setRemoteDescription(data.sdp);
			}
		};
		// cleanup websocket on unmount
		return () => {
			socket.close();
		};
	}, []);

	const SendVideo = async () => {
		if (!sender) return;

		// getting stream
		const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

		// show local video preview
		if (videoRef.current) {
			videoRef.current.srcObject = stream;
			videoRef.current.play();
		}

		// create new RTCPeerConnection
		const pc = new RTCPeerConnection();
		pcRef.current = pc;

		// adding stream in pc
		stream.getTracks().forEach((track) => {
			// add each track to peer connection
			pc.addTrack(track, stream);
		});

		// ice
		pc.onicecandidate = (event) => {
			if (event.candidate) {
				// send local ICE candidate to remote peer via signaling server
				sender.send(JSON.stringify({ type: "ice-candidate", candidate: event.candidate }));
			}
		};

		// if getting video from remote
		pc.ontrack = (event) => {
			// display remote stream in remote video element
			if (remoteRef.current) {
				remoteRef.current.srcObject = event.streams[0];
				remoteRef.current.play();
			}
		};

		// sending offer
		const offer = await pc.createOffer();
		// set local description with created offer
		await pc.setLocalDescription(offer);
		// send offer to remote peer via signaling server
		sender.send(JSON.stringify({ type: "create-offer", sdp: offer }));
	};

	return (
		<div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-4">
			<div className="max-w-md w-full mx-auto p-6 space-y-6 flex flex-col items-center text-white mb-8">
				<p className="text-center font-medium bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 text-transparent bg-clip-text text-5xl">
					Click to send videos
				</p>
				<button
					onClick={SendVideo}
					className="bg-blue-500 px-6 py-3 rounded-xl hover:bg-blue-600 transition-all 
                font-medium text-white uppercase tracking-wider shadow-md hover:shadow-lg"
				>
					Start Video Call
				</button>
			</div>

			<div className="w-full md:px-4 flex flex-col md:flex-row items-center justify-center gap-8 mb-5">
				<div className="w-full md:max-w-xl max-w-xl">
					<p className="text-white text-sm mb-2 text-center">Your Camera</p>
					<div className="aspect-video bg-black rounded-lg overflow-hidden w-full h-[60vh] max-h-[600px]">
						<video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
					</div>
				</div>

				<div className="w-full max-w-xl">
					<p className="text-white text-sm mb-2 text-center">Remote Stream</p>
					<div className="aspect-video bg-black rounded-lg overflow-hidden w-full h-[60vh] max-h-[600px]">
						<video ref={remoteRef} autoPlay playsInline className="w-full h-full object-cover" />
					</div>
				</div>
			</div>
		</div>
	);
};
