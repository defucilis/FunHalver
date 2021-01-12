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

    const drawPath = useCallback((funscript, opt) => {
        if(!opt) opt = {}
        const scriptDuration = funscript.actions.slice(-1)[0].at;
        const min = Math.max(0, scriptDuration * position - duration * 0.5);
        const max = min + duration

        ctx.beginPath();
        let first = true;
        funscript.actions
            .filter((a, i) => {
                const prev = i === 0 ? a : funscript.actions[i-1];
                const next = i === funscript.actions.length - 1 ? a : funscript.actions[i+1];
                return next.at > min && prev.at < max;
            })
            .forEach(action => {
                const x = width * (action.at - min) / duration + (opt.offset ? opt.offset.x : 0);
                const y = height - (action.pos / 100) * height + (opt.offset ? opt.offset.y : 0);

                if(first) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);

                if(opt && opt.onlyTimes) ctx.fillRect(x - 1, 0, 2, height);

                first = false;
            })
        if(!opt.onlyTimes) ctx.stroke();
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
        drawPath(funscriptB, {onlyTimes: false, offset: { x: 2, y: 0}});
        

    }, [ctx, funscriptA, funscriptB, drawPath, position, width, height, duration])

    return (
        <div>
            <canvas width={width} height={height} ref={canvasRef}></canvas>
        </div>
    )
}

export default FunscriptPreview;