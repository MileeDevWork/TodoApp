import React, { useState, useEffect } from "react";
import Header from "../components/header";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

type EventType = {
  id: string;
  title: string;
  start: string;
  end?: string;
};

const Calendar = () => {
  const [events, setEvents] = useState<EventType[]>([]);

  // Giả lập API GET
  useEffect(() => {
    // sau này bạn gọi fetch("/api/tasks") để lấy task
    const mockTasks = [
      { id: "1", title: "Hackathon AI", start: "2025-08-10", end: "2025-08-12" },
      { id: "2", title: "Quiz 3", start: "2025-08-11", end: "2025-08-12" },
      { id: "3", title: "Quiz 0", start: "2025-08-11" },
    ];
    setEvents(mockTasks);
  }, []);

  return (
    <div className="min-h-screen w-full relative bg-white">
  {/* Cool Blue Glow Top */}
  <div
    className="absolute inset-0 z-0"
    style={{
      background: "#ffffff",
      backgroundImage: `
        radial-gradient(
          circle at top center,
          rgba(70, 130, 180, 0.5),
          transparent 70%
        )
      `,
      filter: "blur(80px)",
      backgroundRepeat: "no-repeat",
    }}
  />
     {/* Your Content/Components */}
     <div className="relative z-10 flex flex-col w-screen min-h-screen">
      <Header />

      <div className="p-6">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          eventColor="#2563eb" // xanh Tailwind
          height="80vh"
        />
      </div>
    </div>
</div>
  );
};

export default Calendar;
