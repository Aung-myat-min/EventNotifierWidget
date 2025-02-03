import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { isDev } from "./utils.js";
import { getPreloadPath } from "./pathResolver.js";
import {
  initDB,
  getAllEvents,
  addEvent,
  editEvent,
  completeEvent,
  deleteEvent,
} from "./db/db.js";

app.whenReady().then(async () => {
  await initDB();

  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: getPreloadPath(),
    },
  });

  if (isDev()) {
    mainWindow.loadURL("http://localhost:5123");
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
  }
});

// Handle IPC calls
ipcMain.handle("getAllEvents", async () => {
  console.log("Getting all events");
  return await getAllEvents();
});

ipcMain.handle("addEvent", async (_event, title: string, date: string) => {
  console.log("Adding event");
  return await addEvent(title, date);
});

ipcMain.handle(
  "editEvent",
  async (
    _event,
    id: number,
    title: string,
    date: string,
    completed: boolean
  ) => {
    console.log("Editing event");
    return await editEvent(id, title, date, completed);
  }
);

ipcMain.handle("completeEvent", async (_event, id: number) => {
  console.log("Completing event");
  return await completeEvent(id);
});

ipcMain.handle("deleteEvent", async (_event, id: number) => {
  console.log("Deleting event");
  return await deleteEvent(id);
});
