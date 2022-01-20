const { app, BrowserWindow } = require('electron')
const { Menu, MenuItem, ipcMain } = require('electron')
const path = require('path')

try {
    require('electron-reloader')(module, {
        ignore: ['/home/hekapoo/Documents/_Licence/nodify2/src/Webpacked/output']
    })
} catch (_) { }

let mainWindow = null
let indexHtmlLoc = '../Webpacked/index.html'
let gifHtmlLoc = '../Webpacked/gifWindow.html'

const menu = new Menu()

/*App Menu*/
const debugMenu = new MenuItem({
    label: 'Export',
    submenu: [
        {
            label: 'Reload',
            accelerator: 'Shift+R',
            click: () => { createModal() }
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

ipcMain.on('TESTING', () => console.log('ok'))

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

function createModal() {
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

    childWindow.loadFile(path.join(__dirname, gifHtmlLoc))

    childWindow.once("ready-to-show", () => {
        childWindow.show()
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
    mainWindow.loadFile(path.join(__dirname, indexHtmlLoc))
}