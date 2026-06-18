const { app, BrowserWindow } = require("electron")
const path = require("path")
const fs = require("fs")
const http = require("http")
const child = require("child_process")

const packageName = "myshinyapp"
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

function waitForServer(url, attempts = 80) {
  return new Promise((resolve, reject) => {
    const tryRequest = remaining => {
      const req = http.get(url, res => {
        res.resume()
        resolve()
      })

      req.on("error", () => {
        if (remaining <= 0) {
          reject(new Error("Shiny server did not start: " + url))
          return
        }
        setTimeout(() => tryRequest(remaining - 1), 250)
      })

      req.setTimeout(1000, () => {
        req.destroy()
      })
    }

    tryRequest(attempts)
  })
}

function startRProcess() {
  const userWorkDir = app.getPath("documents") || app.getPath("home") || app.getAppPath()
  const userDataDir = app.getPath("userData")
  const tempDir = path.join(userDataDir, "tmp")
  const rCode = [
    `library(${packageName})`,
    `${packageName}::run_app(port=${port}, host="127.0.0.1", launch.browser=FALSE)`
  ].join("; ")

  fs.mkdirSync(tempDir, { recursive: true })

  childProcess = child.spawn(
    getRscriptPath(),
    ["-e", rCode],
    {
      cwd: userWorkDir,
      env: Object.assign({}, process.env, {
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

async function createWindow() {
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

  const url = `http://127.0.0.1:${port}`
  await waitForServer(url)
  await mainWindow.loadURL(url)
  mainWindow.show()

  mainWindow.on("closed", () => {
    mainWindow = null
    if (childProcess) {
      childProcess.kill()
      childProcess = null
    }
    app.quit()
  })
}

app.on("ready", () => {
  createWindow().catch(error => {
    console.error(error)
    app.quit()
  })
})

app.on("window-all-closed", () => {
  if (childProcess) {
    childProcess.kill()
    childProcess = null
  }
  app.quit()
})

