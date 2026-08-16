import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !app.isPackaged;

// Bound the renderer's V8 heap so GC stays frequent/small instead of
// letting it grow unchecked for what's a small single-window app.
app.commandLine.appendSwitch("js-flags", "--max-old-space-size=256 --optimize-for-size");

let mainWindow;
let splashScreen;

function createSplashScreen() {
  splashScreen = new BrowserWindow({
    width: 600,
    height: 300,
    frame: false,
    alwaysOnTop: true,
    transparent: false,
    resizable: false,
    show: false,
  });

  const splashPath = isDev
    ? path.join(__dirname, "splash.html")
    : path.join(process.resourcesPath, "splash.html");

  console.log("Splash path:", splashPath);

  splashScreen.loadFile(splashPath).catch((err) => {
    console.error("Failed to load splash screen:", err);
  });

  splashScreen.once("ready-to-show", () => {
    splashScreen.show();
    createMainWindow();
  });
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 1080,
    resizable: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      spellcheck: false,
      preload: path.resolve(__dirname, "preload.cjs"),
    },
    show: false,
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    // Fix for production path
    const indexPath = path.join(__dirname, "./dist/index.html");
    console.log("Index path:", indexPath);

    mainWindow.loadFile(indexPath).catch((err) => {
      console.error("Failed to load main window:", err);
    });
  }

  mainWindow.webContents.once("did-finish-load", () => {
    if (splashScreen && !splashScreen.isDestroyed()) {
      splashScreen.close();
    }
    mainWindow.show();
  });
}

app.disableHardwareAcceleration();

app.whenReady().then(() => {
  createSplashScreen();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});