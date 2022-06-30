const { app, BrowserWindow, webContents } = require('electron')
const { Menu, MenuItem, ipcMain } = require('electron')
require('@electron/remote/main').initialize()
const path = require('path')

try {
    require('electron-reloader')(module, {
        ignore: ['/home/hekapoo/Documents/_Licence/nodify2/src/Webpacked/temp',
            '/home/hekapoo/Documents/_Licence/nodify2/mygif.gif',
            '/home/hekapoo/Documents/_Licence/nodify2/src/App/Commands/UserDefinedDummy',
            '/home/hekapoo/Documents/_Licence/nodify2/mygif.mkv',
            '/home/hekapoo/Documents/_Licence/nodify2/zrandom-trash',
            '/home/hekapoo/Documents/_Licence/nodify2/pallete.png']
    })
} catch (_) { }

let mainWindow = null
let fatalModalWindow = null
let gifProcessingWindow = null
let saveCloudlyWindow = null
let loadCloudlyWindow = null

let indexHtmlLoc = '../Webpacked/index.html'
let prefsWindowHtmlLoc = '../Webpacked/preferencesWindow.html'
let fatalWindowHtmlLoc = '../Webpacked/fatalWindow.html'
let gifProcessingWindowHtmlLoc = '../Webpacked/gifProcessingWindow.html'
let saveCloudlyWindowHtmlLoc = '../Webpacked/saveCloudlyWindow.html'
let loadCloudlyWindowHtmlLoc = '../Webpacked/loadCloudlyWindow.html'

const menu = new Menu()

/*App Menu*/
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
            label: 'Load File..',
            accelerator: 'Shift+L',
            click: () => { mainWindow.webContents.send('LOAD_LOCALLY') }
        }]
})

const editMenu = new MenuItem({
    label: 'Edit',
    submenu: [
        {
            label: 'Toggle Node Indexing',
            accelerator: 'Shift+I',
            click: () => { mainWindow.webContents.send('TOGGLE_INDEXING') },
        },
        ,
        {
            label: 'Undo',
            accelerator: 'Ctrl+,',
            click: () => { mainWindow.webContents.send('UNDO_ACTION') }
        },
        {
            label: 'Redo',
            accelerator: 'Ctrl+.',
            click: () => { mainWindow.webContents.send('REDO_ACTION') }
        },
        {
            label: 'Reload Commands',
            accelerator: 'Shift+R',
            click: () => { mainWindow.webContents.send('RELOAD_COMMANDS') }
        },
        {
            label: 'Preferences',
            accelerator: 'Shift+I',
            click: () => { openPrefsModal() }
        }]
})

const exportMenu = new MenuItem({
    label: 'Export',
    submenu: [
        {
            label: 'Export As PNG',
            accelerator: 'Shift+P',
            click: () => { mainWindow.webContents.send('TOGGLE_EXPORT_PNG') }
        },
        {
            label: 'Export As JPEG',
            accelerator: 'Shift+J',
            click: () => { mainWindow.webContents.send('TOGGLE_EXPORT_PNG') }
        },
        {
            label: 'Toggle GIF Capture',
            accelerator: 'Shift+G',
            click: () => { mainWindow.webContents.send('TOGGLE_CAPUTRE_GIF') }
        }
    ]
})

const shareMenu = new MenuItem({
    label: 'Share',
    submenu: [
        {
            label: 'Email To Targets',
            accelerator: 'Shift+F',
            click: () => { mainWindow.webContents.send('SEND_MAIL') }
        }
    ]
})

const cloudMenu = new MenuItem({
    label: 'Cloud',
    submenu: [
        {
            label: 'Load From Cloud',
            accelerator: 'Shift+J',
            click: () => { mainWindow.webContents.send('LOAD_CLOUDLY') }
        },
        {
            label: 'Save To Cloud',
            accelerator: 'Shift+K',
            click: () => { mainWindow.webContents.send('SAVE_CLOUDLY') }
        },
    ]
})

const debugMenu = new MenuItem({
    label: 'Debug',
    submenu: [
        {
            label: 'Debug console',
            accelerator: 'Ctrl+Shift+I',
            click: (item, focusedWindow) => {
                mainWindow.webContents.openDevTools()
                focusedWindow.toggleDevTools()
            }
        }]
})

menu.append(fileMenu)
menu.append(editMenu)
menu.append(exportMenu)
menu.append(shareMenu)
menu.append(cloudMenu)
// menu.append(debugMenu)
Menu.setApplicationMenu(menu)

ipcMain.on('PREFS_UPDATE', (e, v) => mainWindow.webContents.send('PREFS_UPDATE', v))
ipcMain.on('GIF_PROCESSING_OPEN', (e, v) => openGifProcessingModal())
ipcMain.on('GIF_PROCESSING_MESSAGE', (e, v) => gifProcessingWindow.webContents.send('GIF_PROCESSING_MESSAGE', v))
ipcMain.on('GIF_PROCESSING_CLOSE', (e, v) => gifProcessingWindow.close())
ipcMain.on('FATAL_ERROR', (e, v) => openFatalModal(v))
ipcMain.on('TOGGLE_SAVE_BTN', (e, v) => menu.getMenuItemById('save-btn-id').enabled = v.value)
ipcMain.on('DISPATCH_OPEN_CLOUD_SAVE', (e, v) => openSaveCloudlyModalAndSendData(v))
ipcMain.on('FINALIZE_SAVE', (e, v) => mainWindow.webContents.send('FINALIZE_SAVE', v))
ipcMain.on('DISPATCH_OPEN_CLOUD_LOAD', (e, v) => openLoadCloudlyModalAndSendData(v))
ipcMain.on('FINALIZE_LOAD', (e, v) => mainWindow.webContents.send('FINALIZE_LOAD', v))

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
    })
}

function openGifProcessingModal() {
    gifProcessingWindow = new BrowserWindow({
        width: 600,
        height: 300,
        modal: true,
        show: false,
        frame: false,
        parent: mainWindow,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });

    gifProcessingWindow.loadFile(path.join(__dirname, gifProcessingWindowHtmlLoc))
    require("@electron/remote/main").enable(gifProcessingWindow.webContents)
    gifProcessingWindow.once("ready-to-show", () => {
        gifProcessingWindow.show()
    })
}

function openPrefsModal() {
    const childWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        modal: true,
        show: false,
        frame: false,
        parent: mainWindow,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });

    childWindow.loadFile(path.join(__dirname, prefsWindowHtmlLoc))
    childWindow.setMenu(null)
    require("@electron/remote/main").enable(childWindow.webContents)
    childWindow.once("ready-to-show", () => { childWindow.show() })
}

function openSaveCloudlyModalAndSendData(val) {
    saveCloudlyWindow = new BrowserWindow({
        width: 500,
        height: 400,
        modal: true,
        show: false,
        frame: false,
        parent: mainWindow,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });

    saveCloudlyWindow.loadFile(path.join(__dirname, saveCloudlyWindowHtmlLoc))
    require("@electron/remote/main").enable(saveCloudlyWindow.webContents)
    saveCloudlyWindow.once("ready-to-show", () => {
        saveCloudlyWindow.show()
        saveCloudlyWindow.webContents.send('DISPATCH_CLOUD_SAVE', val)
    })
}

function openLoadCloudlyModalAndSendData(val) {
    loadCloudlyWindow = new BrowserWindow({
        width: 500,
        height: 500,
        modal: true,
        show: false,
        frame: false,
        parent: mainWindow,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });

    loadCloudlyWindow.loadFile(path.join(__dirname, loadCloudlyWindowHtmlLoc))
    require("@electron/remote/main").enable(loadCloudlyWindow.webContents)
    loadCloudlyWindow.once("ready-to-show", () => {
        loadCloudlyWindow.show()
        loadCloudlyWindow.webContents.send('DISPATCH_CLOUD_LOAD', val)
    })
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