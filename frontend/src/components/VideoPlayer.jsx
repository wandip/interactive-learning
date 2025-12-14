import React, { useRef, useEffect, useState } from 'react';
import ReactPlayer from 'react-player/youtube';

const VideoPlayer = ({ url, startTime, endTime, onProgress, onEnded }) => {
    const playerRef = useRef(null);
    const [playing, setPlaying] = useState(false);

    useEffect(() => {
        if (playerRef.current) {
            playerRef.current.seekTo(startTime || 0);
            // setPlaying(true); // Auto-play removed
        }
    }, [startTime, url]);

    const handleProgress = (state) => {
        if (endTime && state.playedSeconds >= endTime) {
            setPlaying(false);
            if (onEnded) onEnded();
        }
        if (onProgress) onProgress(state.playedSeconds);
    };

    return (
        <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden shadow-lg">
            <ReactPlayer
                ref={playerRef}
                url={url}
                width="100%"
                height="100%"
                playing={playing}
                controls={true}
                onProgress={handleProgress}
                className="absolute top-0 left-0"
                config={{
                    youtube: {
                        playerVars: { start: Math.floor(startTime || 0) }
                    }
                }}
            />
        </div>
    );
};

export default VideoPlayer;
