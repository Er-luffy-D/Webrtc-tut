import { useEffect, useRef, useState } from "react";

export const Receive = () => {
	const localRef = useRef<HTMLVideoElement>(null); // Reference for local video element
	const RemoteRef = useRef<HTMLVideoElement>(null); // Reference for remote video element
	const [socket, setSocket] = useState<WebSocket | null>(null); // State to hold WebSocket instance
	const peer = useRef<RTCPeerConnection | null>(null); // Ref to hold RTCPeerConnection instance

	// Move handleVideo inside the offer handler, so we add tracks after peer connection is created
	const handleVideo = async (pc: RTCPeerConnection) => {
		// Get display media (screen + audio) from user
		const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
		if (localRef.current) {
			localRef.current.srcObject = stream; // Show local stream in local video element
			localRef.current.play();
		}
		// Add all tracks from local stream to peer connection
		stream.getTracks().forEach((track) => {
			pc.addTrack(track, stream);
		});
	};

	useEffect(() => {
		const socket = new WebSocket(import.meta.env.VITE_BACKEND_URL); // Connect to signaling server
		socket.onopen = () => {
			socket.send(JSON.stringify({ type: "receiver" })); // Identify as receiver
		};
		setSocket(socket);

		// receiving offer from sender
		socket.onmessage = async (event) => {
			const message = JSON.parse(event.data);
			if (message.type === "create-offer") {
				const pc = new RTCPeerConnection({iceServers: [
    { urls: 'stun:stun.l.google.com:19302' } // Free public STUN server
  ]}); // Create new peer connection
				peer.current = pc; // Store peer connection in ref

				pc.onicecandidate = (data) => {
					console.log(data);
					if (data.candidate) {
						// Send ICE candidate to signaling server
						socket.send(JSON.stringify({ type: "ice-candidate", candidate: data.candidate }));
					}
				};

				pc.ontrack = (event) => {
					console.log("Remote track received");
					const stream = event.streams[0];
					if (RemoteRef.current) {
						RemoteRef.current.srcObject = stream; // Show remote stream in remote video element
						RemoteRef.current.play();
					}
				};

				await pc.setRemoteDescription(message.sdp); // Set remote SDP from offer

				// Add this: get and add local stream to connection
				await handleVideo(pc); // Get local stream and add tracks to peer connection

				const answer = await pc.createAnswer(); // Create SDP answer
				await pc.setLocalDescription(answer); // Set local SDP
				socket.send(JSON.stringify({ type: "create-answer", sdp: answer })); // Send answer to signaling server
			} else if (message.type === "ice-candidate") {
				if (peer.current) {
					// done by me
					console.log(message);
					await peer.current.addIceCandidate(message.candidate); // Add received ICE candidate
				}
			}
		};
		// Remove handleVideo() from here
	}, []);

	if (!socket) {
		return (
			<div className="min-h-screen bg-neutral-900 flex items-center justify-center">
				<p className="text-white">Connecting to server...</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-4">
			<div className="max-w-md w-full mx-auto p-6 space-y-6 flex flex-col items-center text-white mb-8">
				<p className="text-center font-medium bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 text-transparent bg-clip-text text-5xl">
					Receiver
				</p>
			</div>

			<div className="w-full px-4 flex flex-col md:flex-row items-center justify-center gap-8">
				<div className="w-full max-w-xl">
					<p className="text-white text-sm mb-2 text-center">Your Camera</p>
					<div className="aspect-video bg-black rounded-lg overflow-hidden w-full h-[60vh] max-h-[600px]">
						<video ref={localRef} autoPlay playsInline muted className="w-full h-full object-cover" />
					</div>
				</div>

				<div className="w-full max-w-xl">
					<p className="text-white text-sm mb-2 text-center">Remote Stream</p>
					<div className="aspect-video bg-black rounded-lg overflow-hidden w-full h-[60vh] max-h-[600px]">
						<video ref={RemoteRef} autoPlay playsInline className="w-full h-full object-cover" />
					</div>
				</div>
			</div>
		</div>
	);
};
