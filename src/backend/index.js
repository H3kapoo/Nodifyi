const { app, BrowserWindow, webContents } = require('electron')
const { Menu, MenuItem, ipcMain } = require('electron')
require('@electron/remote/main').initialize()
const path = require('path')

try {
    require('electron-reloader')(module, {
        ignore: ['/home/hekapoo/Documents/_Licence/nodify2/src/Webpacked/temp',
            '/home/hekapoo/Documents/_Licence/nodify2/mygif.gif',
            '/home/hekapoo/Documents/_Licence/nodify2/mygif.mkv',
            '/home/hekapoo/Documents/_Licence/nodify2/pallete.png']
    })
} catch (_) { }

let mainWindow = null
let indexHtmlLoc = '../Webpacked/index.html'
let prefsWindowHtmlLoc = '../Webpacked/preferencesWindow.html'

const menu = new Menu()

/*App Menu*/
const debugMenu = new MenuItem({
    label: 'File',
    submenu: [
        {
            label: 'Toggle capture GIF',
            accelerator: 'Shift+G',
            click: () => { mainWindow.webContents.send('TOGGLE_CAPUTRE_GIF') }
        },
        {
            label: 'Preferences',
            accelerator: 'Shift+P',
            // click: () => { mainWindow.webContents.send('RELOAD_CONFIG') }
            click: () => { openPrefsModal() }
        },
        {
            label: 'Debug console',
            accelerator: 'Ctrl+Shift+I',
            click: (item, focusedWindow) => {
                mainWindow.webContents.openDevTools()
                focusedWindow.toggleDevTools()
            }
        },]
})

menu.append(debugMenu)
Menu.setApplicationMenu(menu)

ipcMain.on('PREFS_UPDATE', (e, v) => mainWindow.webContents.send('PREFS_UPDATE', v))
// ipcMain.on('PREFS_UPDATE_CLOSE',)

/* Create window */
app.whenReady().then(() => {
    createWindow()
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

function openPrefsModal() {
    const childWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        modal: true,
        show: false,
        parent: mainWindow,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });

    childWindow.loadFile(path.join(__dirname, prefsWindowHtmlLoc))
    // childWindow.setMenu(null)
    require("@electron/remote/main").enable(childWindow.webContents)
    childWindow.once("ready-to-show", () => { childWindow.show() })
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        minWidth: 1280, minHeight: 720,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    })
    require("@electron/remote/main").enable(mainWindow.webContents)
    mainWindow.loadFile(path.join(__dirname, indexHtmlLoc))
}