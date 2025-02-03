interface TodoEvent {
  id: number;
  title: string;
  date: string;
  completed: boolean;
}

interface Window {
  electron: {
    getAllEvents: () => Promise<TodoEvent[]>;
    addEvent: (title: string, date: string) => Promise<void>;
    editEvent: (
      id: number,
      title: string,
      date: string,
      completed: boolean
    ) => Promise<void>;
    completeEvent: (id: number) => Promise<void>;
  };
}
