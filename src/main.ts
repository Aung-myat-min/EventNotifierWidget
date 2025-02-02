import { app, BrowserWindow } from "electron";

let mainWindow: BrowserWindow | null;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 200,
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.setAlwaysOnTop(true, "screen-saver");
  mainWindow.setVisibleOnAllWorkspaces(true);
  mainWindow.setIgnoreMouseEvents(false); // Allow interactions

  // Allow moving when focused
  mainWindow.on("focus", () => {
    mainWindow?.setMovable(true);
  });

  // Prevent moving when unfocused
  mainWindow.on("blur", () => {
    mainWindow?.setMovable(false);
  });

  mainWindow.loadFile("src/index.html");
});
