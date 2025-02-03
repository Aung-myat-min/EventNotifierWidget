import { ipcRenderer } from "electron";

const electron = require("electron");

electron.contextBridge.exposeInMainWorld("electron", {
  // Get all incomplete events
  getAllEvents: async () => ipcRenderer.invoke("getAllEvents"),

  // Add an event
  addEvent: async (title: string, date: string) =>
    ipcRenderer.invoke("addEvent", title, date),

  // Edit an event
  editEvent: async (
    id: number,
    title: string,
    date: string,
    completed: boolean
  ) => ipcRenderer.invoke("editEvent", id, title, date, completed),

  // Mark an event as completed
  completeEvent: async (id: number) => ipcRenderer.invoke("completeEvent", id),

  // Delete an event
  deleteEvent: (id: number) => ipcRenderer.invoke("deleteEvent", id),
});
