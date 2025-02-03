import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  PencilIcon,
  CheckIcon,
  TrashIcon,
  XIcon,
} from "lucide-react";

interface TodoEvent {
  id: number;
  title: string;
  date: string;
  completed: boolean;
}

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft("Event has passed");
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return <div className="text-3xl font-bold text-blue-400">{timeLeft}</div>;
}

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function Dialog({ isOpen, onClose, title, children }: DialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex">
      <div className="relative p-8 bg-gray-800 w-full max-w-md m-auto flex-col flex rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-white">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const [events, setEvents] = useState<TodoEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TodoEvent | null>(null);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    setLoading(true);
    try {
      const data = await window.electron.getAllEvents();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
    setLoading(false);
  }

  const handleAddOrEditEvent = async () => {
    if (!title || !date) {
      alert("Please provide a title and date for the event.");
      return;
    }
    try {
      if (editingEvent) {
        await window.electron.editEvent(
          editingEvent.id,
          title,
          date,
          editingEvent.completed
        );
      } else {
        await window.electron.addEvent(title, date);
      }
      fetchEvents();
      setTitle("");
      setDate("");
      setEditingEvent(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error adding/editing event:", error);
    }
  };

  const handleCompleteEvent = async (id: number) => {
    try {
      await window.electron.completeEvent(id);
      fetchEvents();
    } catch (error) {
      console.error("Error completing event:", error);
    }
  };

  const handleDeleteEvent = async (id: number) => {
    try {
      await window.electron.deleteEvent(id);
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const openAddDialog = () => {
    setEditingEvent(null);
    setTitle("");
    setDate("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (event: TodoEvent) => {
    setEditingEvent(event);
    setTitle(event.title);
    setDate(event.date);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-6 flex flex-col justify-start sm:py-12">
      <div className="px-4 py-5 sm:max-w-xl sm:mx-auto w-full">
        <h1 className="text-3xl font-bold mb-5">Todo Events</h1>

        {loading ? (
          <p>Loading...</p>
        ) : events.length === 0 ? (
          <p>No events available</p>
        ) : (
          <div className="space-y-6">
            {events.map((event) => (
              <div
                key={event.id}
                className={`bg-gray-800 p-6 rounded-lg shadow-md ${
                  event.completed ? "opacity-50" : ""
                }`}
              >
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-start">
                    <h3
                      className={`text-2xl font-semibold ${
                        event.completed ? "line-through" : ""
                      }`}
                    >
                      {event.title}
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditDialog(event)}
                        className="p-1 text-blue-400 hover:text-blue-300"
                        title="Edit"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleCompleteEvent(event.id)}
                        className="p-1 text-green-400 hover:text-green-300"
                        title="Complete"
                      >
                        <CheckIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-1 text-red-400 hover:text-red-300"
                        title="Delete"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-gray-400 text-lg">
                    {new Date(event.date).toLocaleString()}
                  </div>
                  <CountdownTimer targetDate={event.date} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={openAddDialog}
        className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-colors"
      >
        <PlusIcon className="w-6 h-6" />
      </button>

      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={editingEvent ? "Edit Event" : "Add New Event"}
      >
        <input
          type="text"
          placeholder="Event Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md mb-3"
        />
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md mb-3"
        />
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setIsDialogOpen(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddOrEditEvent}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            {editingEvent ? "Save Changes" : "Add Event"}
          </button>
        </div>
      </Dialog>
    </div>
  );
}
