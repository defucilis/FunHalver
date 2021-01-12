import React, {useState, useEffect, useRef} from 'react'

import {Dropzone} from './lib/FormUtils'
import convertFunscript from './lib/funreducer'
import renderHeatmap from './lib/FunscriptHeatmap'

import FunscriptPreview from './components/FunscriptPreview'
import Checkbox from './lib/Checkbox'

import style from './App.module.scss'
import FunscriptHeatmap from './components/FunscriptHeatmap'

const App = () => {

    const [originalScript, setOriginalScript] = useState(null);
    const [filename, setFilename] = useState("");
    const [convertedScript, setConvertedScript] = useState(null);
    const [preparedFile, setPreparedFile] = useState(null);
    const [options, setOptions] = useState({
        resetAfterPause: true,
        removeShortPauses: false,
    })
    const [previewDuration, setPreviewDuration] = useState(10000);
    const [previewTarget, setPreviewTarget] = useState({
        funscript: null,
        position: 0,
    });

    const currentCanvasRef = useRef();
    const newCanvasRef = useRef();

    const handleFileDrop = e => {
        const extension = e.target.value[0].name.split(".").slice(-1)[0].toLowerCase();
        if(extension !== "funscript") {
            alert("Wrong filetype - should be .funscript but was ." + extension);
            return;
        }

        setFilename(e.target.value[0].name);

        const reader = new FileReader();
        reader.onloadend = e => {
            const newOriginalScript = JSON.parse(e.target.result);
            setOriginalScript(newOriginalScript);
        }
        reader.readAsText(e.target.value[0])
    }

    useEffect(() => {
        if(!originalScript) {
            setConvertedScript(null);
            return;
        }
        const newConvertedScript = convertFunscript(originalScript, options, message => console.log(message));
        const newFilename = filename.replace(".funscript", "_HALVED.funscript");
        setConvertedScript(newConvertedScript);
        setPreparedFile({
            url: window.URL.createObjectURL(new Blob([JSON.stringify(newConvertedScript)])),
            filename: newFilename,
        });
    }, [originalScript, filename, options])

    useEffect(() => {
        if(currentCanvasRef.current) {
            renderHeatmap(currentCanvasRef.current, originalScript);
        }
        setPreviewDuration(10000);
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
                    <div>
                        <h1>Fun<span>Halver</span></h1>
                        <p>v0.1.0</p>
                    </div>
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
                    <FunscriptPreview width={1000} height={150} {...previewTarget} duration={previewDuration}/>
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
                            onWheel={e => {
                                setPreviewDuration(cur => {
                                    const scriptDuration = originalScript.actions.slice(-1)[0].at;
                                    return Math.min(scriptDuration, e.deltaY < 0 ? cur / 1.5 : cur * 1.5);
                                });
                            }}
                        />
                    </div>
                )}

                {!originalScript ? null : (
                    <div className={style.options}>
                        <h3>Options</h3>
                        <div>
                            <div>
                                <label htmlFor="resetAfterPause">Reset After Pause</label>
                                <Checkbox className={style.checkbox} checked={options.resetAfterPause} onChange={e => setOptions({...options, resetAfterPause: e.target.checked})}>
                                    <p>✔</p>
                                </Checkbox>
                            </div>
                            <div>
                                <label htmlFor="removeShortPauses">Remove Short Pauses</label>
                                <Checkbox className={style.checkbox} checked={options.removeShortPauses} onChange={e => setOptions({...options, removeShortPauses: e.target.checked})}>
                                    <p>✔</p>
                                </Checkbox>
                            </div>
                        </div>
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
                            onWheel={e => {
                                setPreviewDuration(cur => {
                                    const scriptDuration = originalScript.actions.slice(-1)[0].at;
                                    return Math.min(scriptDuration, e.deltaY < 0 ? cur / 1.5 : cur * 1.5);
                                });
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
