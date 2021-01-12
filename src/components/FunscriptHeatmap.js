import React, {useState, useEffect, useRef} from 'react'

import renderHeatmap from '../lib/FunscriptHeatmap'

const FunscriptHeatmap = ({funscript, width, height, hoverDisplayDuration, onMouseEnter, onMouseLeave, onMouseMove}) => {

    const parentRef = useRef();
    const canvasRef = useRef();
    const overlayRef = useRef();
    const [localMousePos, setLocalMousePos] = useState(null);

    useEffect(() => {
        if(canvasRef.current) {
            if(funscript) {
                renderHeatmap(canvasRef.current, funscript);
            } else {
                canvasRef.current.getContext("2d").clearRect(0, 0, width, height);
            }
        }
    }, [funscript, height, width])

    useEffect(() => {
        if(!localMousePos) {
            overlayRef.current.style.setProperty("display", "none");
            return;
        }
        overlayRef.current.style.setProperty("display", "block");
        const durationAsWidth = (hoverDisplayDuration / funscript.actions.slice(-1)[0].at) * width;
        const min = Math.max(0, localMousePos.x * width - durationAsWidth * 0.5);
        overlayRef.current.style.setProperty("left", min + "px");
        overlayRef.current.style.setProperty("width", durationAsWidth + "px");
    }, [funscript.actions, hoverDisplayDuration, localMousePos, width])

    return (
        <div
            ref={parentRef}
            style={{
                position: "relative", 
                width: {width} + "px", 
                height: {height} + "px"
            }}
        >
            <canvas 
                width={width} 
                height={height} 
                ref={canvasRef}
                onMouseEnter={() => {
                    onMouseEnter();
                }}
                onMouseLeave={() => {
                    onMouseLeave();
                    setLocalMousePos(null);
                }}
                onMouseMove={e => {
                    const localX = (e.pageX - parentRef.current.offsetLeft - parentRef.current.scrollLeft + 1) / canvasRef.current.width;
                    const localY = (e.pageY - parentRef.current.offsetTop - parentRef.current.scrollTop + 1) / canvasRef.current.height;
                    onMouseMove({ ...e, localX, localY, });
                    setLocalMousePos({x: localX, y: localY});
                }}>
            </canvas>
            <div ref={overlayRef} style={{
                position: "absolute",
                top: "-1px",
                height: "100%",
                border: "1px solid white",
                pointerEvents: "none",
            }}></div>
        </div>
    )
}

export default FunscriptHeatmap;