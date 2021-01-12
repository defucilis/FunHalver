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

    const drawPath = useCallback((funscript, onlyTimes) => {
        const scriptDuration = funscript.actions.slice(-1)[0].at;
        const min = Math.max(0, scriptDuration * position - duration * 0.5);
        const max = min + duration

        ctx.beginPath();
        let first = true;
        funscript.actions
            .filter(a => a.at > min && a.at < max)
            .forEach(action => {
                const x = width * (action.at - min) / duration;
                const y = height - (action.pos / 100) * height;

                if(first) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);

                if(onlyTimes) ctx.fillRect(x - 1, 0, 2, height);

                first = false;
            })
        if(!onlyTimes) ctx.stroke();
    }, [position, duration, ctx, width, height]);

    useEffect(() => {
        if(!ctx) return;

        ctx.clearRect(0, 0, width, height);
        if(!funscriptA || !funscriptB) return;
        
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, width, height);
        
        ctx.lineWidth = 3;

        ctx.strokeStyle = "#FFF";
        ctx.fillStyle = "rgba(255,255,255,0.1)"
        drawPath(funscriptA);
        
        ctx.strokeStyle = "#F66";
        ctx.fillStyle = "rgba(255,200,200,1)"
        drawPath(funscriptB, false);
        

    }, [ctx, funscriptA, funscriptB, drawPath, position, width, height, duration])

    return (
        <div>
            <canvas width={width} height={height} ref={canvasRef}></canvas>
        </div>
    )
}

export default FunscriptPreview;