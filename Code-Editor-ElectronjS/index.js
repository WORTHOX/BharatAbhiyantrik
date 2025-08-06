const {app,BrowserWindow,ipcMain} = require('electron');
let MAXIMISE = true;
try {
    require('electron-reloader')(module)
} catch (_) {}


const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        frame:false,

        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    })

    win.webContents.openDevTools();
    win.loadFile('index.html');
}

app.whenReady().then(()=>{
    createWindow();
})

ipcMain.on('maximize',()=>{
    if(MAXIMISE) BrowserWindow.getFocusedWindow().maximize();
    else BrowserWindow.getFocusedWindow().unmaximize();
    MAXIMISE = !MAXIMISE;
});

ipcMain.on('minimize',()=>{
    BrowserWindow.getFocusedWindow().minimize();
});

ipcMain.on('quit',()=>{
    BrowserWindow.getFocusedWindow().close();
});