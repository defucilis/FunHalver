import React, {useState, useRef, useEffect, useCallback} from 'react'

const FunscriptPreview = ({width, height, funscriptA, funscriptB, position, duration}) => {
    const canvasRef = useRef();
    const [ctx, setCtx] = useState(null);

    useEffect(() => {   
        if(!canvasRef.current) setCtx(null);
        else {
            setCtx(canvasRef.current.getContext("2d"));
        }
    }, [canvasRef])

    const drawPath = useCallback(funscript => {
        const scriptDuration = funscript.actions.slice(-1)[0].at;
        const min = Math.max(0, scriptDuration * position - duration * 0.5);
        const max = min + duration

        const candidates = funscript.actions.filter(a => a.at > min && a.at < max);
        ctx.beginPath();
        for(let i = 0; i < candidates.length; i++) {
            const x = width * (candidates[i].at - min) / duration;
            const y = height - (candidates[i].pos / 100) * height;
            if(i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }, [position, duration, ctx, width, height]);

    useEffect(() => {
        if(!ctx) return;

        ctx.clearRect(0, 0, width, height);
        if(!funscriptA || !funscriptB) return;
        
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, width, height);
        
        ctx.strokeStyle = "#FFF";
        drawPath(funscriptA);
        
        ctx.strokeStyle = "#F66";
        drawPath(funscriptB);
        

    }, [ctx, funscriptA, funscriptB, drawPath, position, width, height, duration])

    return (
        <div>
            <canvas width={width} height={height} ref={canvasRef}></canvas>
        </div>
    )
}

export default FunscriptPreview;