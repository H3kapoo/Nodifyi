const { app, BrowserWindow, webContents } = require('electron')
const { Menu, MenuItem, ipcMain } = require('electron')
require('@electron/remote/main').initialize()
const path = require('path')

try {
    require('electron-reloader')(module, {
        ignore: ['/home/hekapoo/Documents/_Licence/nodify2/src/Webpacked/temp',
            '/home/hekapoo/Documents/_Licence/nodify2/mygif.gif',
            '/home/hekapoo/Documents/_Licence/nodify2/mygif.mkv',
            '/home/hekapoo/Documents/_Licence/nodify2/zrandom-trash',
            '/home/hekapoo/Documents/_Licence/nodify2/pallete.png']
    })
} catch (_) { }

let mainWindow = null
let fatalModalWindow = null
let indexHtmlLoc = '../Webpacked/index.html'
let prefsWindowHtmlLoc = '../Webpacked/preferencesWindow.html'
let fatalWindowHtmlLoc = '../Webpacked/fatalWindow.html'

const menu = new Menu()

/*App Menu*/
const debugMenu = new MenuItem({
    label: 'Extras',
    submenu: [
        {
            label: 'Export PNG',
            accelerator: 'Shift+P',
            click: () => { mainWindow.webContents.send('TOGGLE_EXPORT_PNG') }
        },
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

const fileMenu = new MenuItem({
    label: 'File',
    submenu: [
        {
            label: 'New Project',
            accelerator: 'Shift+N',
            click: () => { mainWindow.webContents.send('NEW_PROJECT') }
        },
        {
            id: 'save-btn-id',
            label: 'Save',
            accelerator: 'Shift+S',
            click: () => { mainWindow.webContents.send('SAVE_LOCALLY') }
        },
        {
            label: 'Save As..',
            accelerator: 'Shift+K',
            click: () => { mainWindow.webContents.send('SAVEAS_LOCALLY') }
        },
        {
            label: 'Load',
            accelerator: 'Shift+L',
            click: () => { mainWindow.webContents.send('LOAD_LOCALLY') }
        }]
})

menu.append(fileMenu)
menu.append(debugMenu)
Menu.setApplicationMenu(menu)

ipcMain.on('PREFS_UPDATE', (e, v) => mainWindow.webContents.send('PREFS_UPDATE', v))
ipcMain.on('FATAL_ERROR', (e, v) => openFatalModal(v))
ipcMain.on('TOGGLE_SAVE_BTN', (e, v) => menu.getMenuItemById('save-btn-id').enabled = v.value)

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

function openFatalModal(message) {
    if (fatalModalWindow) {
        fatalModalWindow.once("ready-to-show", () => {
            fatalModalWindow.show()
            fatalModalWindow.webContents.send('FATAL_ERROR_MESSAGE', message)
        })
        return
    }

    fatalModalWindow = new BrowserWindow({
        width: 600,
        height: 300,
        modal: true,
        show: false,
        // frame: false,
        parent: mainWindow,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });

    fatalModalWindow.loadFile(path.join(__dirname, fatalWindowHtmlLoc))
    fatalModalWindow.setMenu(null)
    require("@electron/remote/main").enable(fatalModalWindow.webContents)
    fatalModalWindow.once("ready-to-show", () => {
        fatalModalWindow.show()
        fatalModalWindow.webContents.send('FATAL_ERROR_MESSAGE', message)
        // fatalModalWindow.webContents.openDevTools()
    })
}

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