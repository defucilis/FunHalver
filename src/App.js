import React, {useState, useEffect, useRef} from 'react'

import {Dropzone} from './lib/FormUtils'
import convertFunscript from './lib/funreducer'
import renderHeatmap from './lib/FunscriptHeatmap'

import style from './App.module.scss'

const App = () => {

    const [originalScript, setOriginalScript] = useState(null);
    const [convertedScript, setConvertedScript] = useState(null);
    const [preparedFile, setPreparedFile] = useState(null);

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
            // const path = dialog.showSaveDialogSync({
            //     title: "Save your halved funscript file",
            //     defaultPath: e.target.value[0].name.replace(".funscript", "_HALVED.funscript"),
            // })
            // fs.writeFile(path, JSON.stringify(convertedScript), err => {
            //     if(err) {
            //         console.error(err);
            //     } else {
            //         console.log("File written successfully");
            //     }
            // })

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

                {!originalScript ? null : (
                    <div className={style.scriptInfo}>
                        <h3>Original</h3>
                        <p>blah blah blah</p>
                        <div>
                            <canvas width={600} height={25} ref={currentCanvasRef}></canvas>
                        </div>
                    </div>
                )}
                {!convertedScript ? null : (
                    <div className={style.scriptInfo}>
                        <h3>Half-Speed</h3>
                        <p>blah blah blah</p>
                        <div>
                            <canvas width={600} height={25} ref={newCanvasRef}></canvas>
                        </div>
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
