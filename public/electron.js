//https://dev.to/mandiwise/electron-apps-made-easy-with-create-react-app-and-electron-forge-560e

const path = require("path");
const fs = require("fs");

const { app, BrowserWindow } = require("electron");
const isDev = require("electron-is-dev");

const convertScript = require('funscript-utils').getHalfSpeedScript;

if(process.argv.findIndex(s => s === "-i") !== -1) {
  const allArgs = process.argv.slice(1);

  //map the args to key-value pairs
  const mappedArgs = {};
  for(let i = 0; i < allArgs.length; i++) {
    if(allArgs[i].substr(0, 1) === "-") {
      if(allArgs[i + 1] && allArgs[i + 1].substr(0, 1) !== "-") {
        mappedArgs[allArgs[i].substr(1)] = allArgs[i + 1];
      } else {
        mappedArgs[allArgs[i].substr(1)] = true;
      }
    }
  }

  //combine default options with passed-in options JSON
  const options = {
    resetAfterPause: false,
      removeShortPauses: true,
      matchFirstDownstroke: false,
      matchGroupEndPosition: true,
      shortPauseDuration: 2000,
      debugMode: false,
  };
  if(mappedArgs.options) {
    mappedArgs.options = JSON.parse(mappedArgs.options);
    Object.keys(mappedArgs.options).forEach(key => {
      options[key] = mappedArgs.options[key];
    })
  }

  if(!mappedArgs.i || !mappedArgs.i.includes(".funscript")) {
    console.log("Input funscript file path required");
  } else {
    //read source funscript file
    fs.readFile(mappedArgs.i, "utf8", (err, data) => {
      if(err) {
        console.log("Failed reading source script: ", err);
        return;
      }
      if(!mappedArgs.o) mappedArgs.o = mappedArgs.i.replace(".funscript", "_HALF.funscript");

      //convert script
      const script = JSON.parse(data);
      const halfScript = convertScript(script, options);

      //save output file
      fs.writeFile(mappedArgs.o, JSON.stringify(halfScript), (err, data) => {
        if(err) {
          console.log("Failed writing target script: ", err);
          return;
        }
        console.log("Half-speed script saved successfully");
      })
    })
  }
  app.quit();
} else {
  console.log("Running FunHalver not in command-line mode - no -i flag found");
}

if(require("electron-squirrel-startup")) {
  app.quit();
}

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: true
    },
    resizable: false,
    fullscreenable: false,
    title: "FunHalver",
    titleBarStyle: "hiddenInset",
  });
  win.setMenuBarVisibility(false);

  // and load the index.html of the app.
  // win.loadFile("index.html");
  win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools({ mode: "detach" });
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.