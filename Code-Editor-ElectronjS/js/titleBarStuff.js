const {ipcRenderer} = require('electron');

// console.log(window.electron);
// console.log(window.Electron);

var minimise = document.getElementById("minimise");
var maximise = document.getElementById("maximise");
var quit = document.getElementById("quit");

minimise.addEventListener("click",minimiseApp);
maximise.addEventListener("click",maximiseApp);

quit.addEventListener("click",quitApp);

function minimiseApp(){ 
    ipcRenderer.send('minimize');
}

function maximiseApp(){
    ipcRenderer.send('maximize');
}
function quitApp(){
    ipcRenderer.send('quit');
}

