const { app, BrowserWindow } = require("electron")
const path = require("path")
const fs = require("fs")
const child = require("child_process")

const port = String(10000 + Math.floor(Math.random() * 50000))
let mainWindow = null
let childProcess = null

function getRscriptPath() {
  if (process.platform === "win32") {
    return path.join(app.getAppPath(), "R-Portable-Win", "bin", "Rscript.exe")
  }
  if (process.platform === "darwin") {
    return path.join(app.getAppPath(), "R-Portable-Mac", "bin", "R")
  }
  throw new Error("Unsupported platform: " + process.platform)
}

function startRProcess() {
  const appDir = app.getAppPath()
  const appFile = path.join(appDir, "app.R").replace(/\\/g, "\\\\")
  const userWorkDir = app.getPath("documents") || app.getPath("home") || appDir
  const userDataDir = app.getPath("userData")
  const tempDir = path.join(userDataDir, "tmp")

  fs.mkdirSync(tempDir, { recursive: true })

  childProcess = child.spawn(
    getRscriptPath(),
    ["-e", `shiny::runApp(file.path('${appFile}'), port=${port})`],
    {
      cwd: userWorkDir,
      env: Object.assign({}, process.env, {
        SHINY_DESKTOP_APP_DIR: appDir,
        SHINY_DESKTOP_USER_DATA_DIR: userDataDir,
        TMP: tempDir,
        TEMP: tempDir,
        TMPDIR: tempDir
      })
    }
  )

  childProcess.stdout.on("data", data => console.log(`R stdout: ${data}`))
  childProcess.stderr.on("data", data => console.log(`R stderr: ${data}`))
}

function createWindow() {
  if (!childProcess) startRProcess()

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  mainWindow.loadURL(`http://127.0.0.1:${port}`)

  setTimeout(() => {
    mainWindow.show()
  }, 3000)

  mainWindow.on("closed", () => {
    mainWindow = null
    if (childProcess) {
      childProcess.kill()
      childProcess = null
    }
    app.quit()
  })
}

app.on("ready", createWindow)

app.on("window-all-closed", () => {
  if (childProcess) {
    childProcess.kill()
    childProcess = null
  }
  app.quit()
})

