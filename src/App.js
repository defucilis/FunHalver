import React, {useState, useEffect, useRef} from 'react'

import {Dropzone} from './lib/FormUtils'
import convertFunscript from './lib/funreducer'
import renderHeatmap from './lib/FunscriptHeatmap'

import FunscriptPreview from './components/FunscriptPreview'

import style from './App.module.scss'
import FunscriptHeatmap from './components/FunscriptHeatmap'


const previewDuration = 20000;

const App = () => {

    const [originalScript, setOriginalScript] = useState(null);
    const [convertedScript, setConvertedScript] = useState(null);
    const [preparedFile, setPreparedFile] = useState(null);
    const [previewTarget, setPreviewTarget] = useState({
        funscript: null,
        position: 0,
        duration: previewDuration,
    });

    const currentCanvasRef = useRef();
    const newCanvasRef = useRef();

    const handleFileDrop = e => {
        const extension = e.target.value[0].name.split(".").slice(-1)[0].toLowerCase();
        if(extension !== "funscript") {
            alert("Wrong filetype - should be .funscript but was ." + extension);
            return;
        }

        const newFileName = e.target.value[0].name.replace(".funscript", "_HALVED.funscript");

        const reader = new FileReader();
        reader.onloadend = e => {
            const newOriginalScript = JSON.parse(e.target.result);
            setOriginalScript(newOriginalScript);
            
            const newConvertedScript = convertFunscript(newOriginalScript, {}, message => console.log(message));
            setConvertedScript(newConvertedScript);
            setPreparedFile({
                url: window.URL.createObjectURL(new Blob([JSON.stringify(convertedScript)])),
                filename: newFileName,
            });
        }
        reader.readAsText(e.target.value[0])
    }

    useEffect(() => {
        if(currentCanvasRef.current) {
            renderHeatmap(currentCanvasRef.current, originalScript);
        }
    }, [originalScript]);

    useEffect(() => {
        if(newCanvasRef.current) {
            renderHeatmap(newCanvasRef.current, convertedScript);
        }
    }, [convertedScript]);

    const addMessage = message => {
        console.log(message);
    }

    const getPrettyTimeString = milliseconds => {
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = Math.floor((milliseconds - (minutes * 60000)) / 1000);
        let output = "";
        if(minutes > 0) output += minutes + ":";
        if(seconds > 10) output += seconds;
        else if(seconds > 0) output += "0" + seconds;
        else output += "00";
        return output;
    }

    return (
        <div className="App">
            <div className={style.header}>
                <div className={style.container}>
                    <h1>Fun<span>Halver</span></h1>
                    <p>Create a half-speed version of any .funscript</p>
                </div>
            </div>
            <div className={style.container}>
                <Dropzone 
                    id="thumbnail" name="thumbnail" label=""
                    className={style.dropzone}
                    hoveringClassName={style.dropzoneon}
                    instruction="Drag + drop a funscript, or click here to open a file browser"
                    options={{
                        multiple: false,
                        noKeyboard: true,
                        preventDropOnDocument: true,
                    }}
                    onChange={handleFileDrop}
                    onError={error => addMessage("Error: " + error)}
                    error={""}
                    value={null}
                />
                <div className={style.preview} style={{zIndex: originalScript && previewTarget && previewTarget.funscriptA ? 100 : -1}}>
                    <FunscriptPreview width={1000} height={150} {...previewTarget}/>
                </div>

                {!originalScript ? null : (
                    <div className={style.scriptInfo}>
                        <h3>Original</h3>
                        <p>Duration: {getPrettyTimeString(originalScript.actions.slice(-1)[0].at)} - Action Count: {originalScript.actions.length}</p>
                        <FunscriptHeatmap 
                            funscript={originalScript} 
                            width={1000} 
                            height={25} 
                            hoverDisplayDuration={previewDuration}
                            onMouseEnter={() => {
                                setPreviewTarget({...previewTarget, funscriptA: originalScript, funscriptB: convertedScript});
                            }}
                            onMouseLeave={() => {
                                setPreviewTarget({...previewTarget, funscriptA: null, funscriptB: null});
                            }}
                            onMouseMove={e => {
                                setPreviewTarget({...previewTarget, position: e.localX});
                            }}
                        />
                    </div>
                )}
                {!convertedScript ? null : (
                    <div className={style.scriptInfo}>
                        <h3>Half-Speed</h3>
                        <p>Duration: {getPrettyTimeString(convertedScript.actions.slice(-1)[0].at)} - Action Count: {convertedScript.actions.length}</p>
                        <FunscriptHeatmap 
                            funscript={convertedScript} 
                            width={1000} 
                            height={25} 
                            hoverDisplayDuration={previewDuration}
                            onMouseEnter={() => {
                                setPreviewTarget({...previewTarget, funscriptA: originalScript, funscriptB: convertedScript});
                            }}
                            onMouseLeave={() => {
                                setPreviewTarget({...previewTarget, funscriptA: null, funscriptB: null});
                            }}
                            onMouseMove={e => {
                                setPreviewTarget({...previewTarget, position: e.localX});
                            }}
                        />
                        {!preparedFile ? null : (
                            <div className={style.downloadLink}>
                                <a 
                                    href={preparedFile.url} 
                                    download={preparedFile.filename}
                                >Save Half-Speed Script</a>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
