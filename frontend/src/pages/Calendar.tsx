// src/pages/Calendar.tsx
import React, { useState, useEffect } from "react";
import Header from "../components/header";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventInput } from "@fullcalendar/core";

import { taskApi, type Task } from "@/api/taskApi";

const Calendar = () => {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const tasks: Task[] = await taskApi.list();
      // Chỉ render những task có deadline
      const evts: EventInput[] = tasks
        .filter((t) => !!t.deadline)
        .map((t) => ({
          id: t._id,
          title: t.title,
          // FE đang dùng deadline kiểu date-only → convert về YYYY-MM-DD
          start: new Date(t.deadline as string).toISOString().slice(0, 10),
          extendedProps: {
            status: t.status,         // 'todo' | 'inprogress' | 'done'
            priority: t.priority,     // 'low' | 'medium' | 'high'
          },
        }));

      setEvents(evts);
    } catch (e) {
      console.error(e);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Tasks Calendar</h2>
            {loading && <span className="text-sm text-gray-500">Loading…</span>}
          </div>

          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            height="80vh"
            events={events}
            dayMaxEvents={3}
            // Tô màu theo status
            eventClassNames={(arg) => {
              const s = arg.event.extendedProps["status"] as Task["status"];
              if (s === "done") return ["bg-green-500", "text-white", "border-0"];
              if (s === "inprogress") return ["bg-blue-500", "text-white", "border-0"];
              return ["bg-yellow-400", "text-black", "border-0"]; // todo
            }}
            // Tooltip đơn giản
            eventDidMount={(info) => {
              const { status, priority } = info.event.extendedProps as {
                status?: string;
                priority?: string;
              };
              info.el.setAttribute(
                "title",
                `${info.event.title}\nStatus: ${status}\nPriority: ${priority}`
              );
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Calendar;
