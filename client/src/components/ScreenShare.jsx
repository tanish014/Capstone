import { useState, useRef, useEffect } from 'react';
import './ScreenShare.css';

const ScreenShare = ({ roomId, socket, emit, on, off }) => {
    const [isSharing, setIsSharing] = useState(false);
    const [remoteStream, setRemoteStream] = useState(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const streamRef = useRef(null);
    const peerRef = useRef(null);

    useEffect(() => {
        if (!socket.current) return;

        const handleOffer = async ({ offer, senderId }) => {
            try {
                const pc = new RTCPeerConnection({
                    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
                });
                peerRef.current = pc;

                pc.ontrack = (e) => {
                    setRemoteStream(e.streams[0]);
                };

                pc.onicecandidate = (e) => {
                    if (e.candidate) {
                        emit('ice-candidate', { roomId, candidate: e.candidate, senderId: socket.current.id });
                    }
                };

                await pc.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                emit('screen-share-answer', { roomId, answer, senderId: socket.current.id });
            } catch (err) {
                console.error('Error handling offer:', err);
            }
        };

        const handleAnswer = async ({ answer }) => {
            try {
                if (peerRef.current) {
                    await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
                }
            } catch (err) {
                console.error('Error handling answer:', err);
            }
        };

        const handleCandidate = async ({ candidate }) => {
            try {
                if (peerRef.current) {
                    await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                }
            } catch (err) {
                console.error('Error handling ICE candidate:', err);
            }
        };

        const handleShareStopped = () => {
            setRemoteStream(null);
            if (peerRef.current) {
                peerRef.current.close();
                peerRef.current = null;
            }
        };

        on('screen-share-offer', handleOffer);
        on('screen-share-answer', handleAnswer);
        on('ice-candidate', handleCandidate);
        on('screen-share-stopped', handleShareStopped);

        return () => {
            off('screen-share-offer', handleOffer);
            off('screen-share-answer', handleAnswer);
            off('ice-candidate', handleCandidate);
            off('screen-share-stopped', handleShareStopped);
        };
    }, [socket.current, emit, on, off, roomId]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    const startScreenShare = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: 'always' },
                audio: false
            });

            streamRef.current = stream;
            setIsSharing(true);

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            const pc = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });
            peerRef.current = pc;

            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            pc.onicecandidate = (e) => {
                if (e.candidate) {
                    emit('ice-candidate', { roomId, candidate: e.candidate, senderId: socket.current.id });
                }
            };

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            emit('screen-share-offer', { roomId, offer, senderId: socket.current.id });

            // Handle stream end (user clicks stop)
            stream.getVideoTracks()[0].onended = () => {
                stopScreenShare();
            };
        } catch (err) {
            console.error('Screen share failed:', err);
        }
    };

    const stopScreenShare = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (peerRef.current) {
            peerRef.current.close();
            peerRef.current = null;
        }
        setIsSharing(false);
        emit('screen-share-stopped', { roomId });
    };

    return (
        <div className="screen-share">
            <button
                className={`screen-share-btn ${isSharing ? 'sharing' : ''}`}
                onClick={isSharing ? stopScreenShare : startScreenShare}
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                {isSharing ? 'Stop Sharing' : 'Share Screen'}
            </button>

            {isSharing && (
                <div className="screen-preview">
                    <video ref={localVideoRef} autoPlay muted className="preview-video" />
                </div>
            )}

            {remoteStream && (
                <div className="remote-screen">
                    <video ref={remoteVideoRef} autoPlay className="remote-video" />
                </div>
            )}
        </div>
    );
};

export default ScreenShare;
