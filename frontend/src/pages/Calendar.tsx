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
    try {
      const tasks = await taskApi.list();

      const mapStatus = (s: string) => {
        if (s === "completed") return "done";
        if (s === "inprogress") return "inprogress";
        return "todo";
      };

      const evts: EventInput[] = tasks.map((t) => ({
        id: t._id,
        title: t.title,
        start: t.startAt ? new Date(t.startAt) : undefined, // ép về Date hoặc bỏ qua
        end: t.endAt ? new Date(t.endAt) : undefined,
        extendedProps: {
          status: mapStatus(t.status),
          priority: t.priority,
        },
      }));

      setEvents(evts);
    } catch (error) {
      console.error("Error loading tasks:", error);
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
            eventContent={(arg) => {
              const status = arg.event.extendedProps["status"] as Task["status"];
              const priority = arg.event.extendedProps["priority"] as Task["priority"];

              // Màu nền theo status
              let bg = "bg-gray-400";
              if (status === "done") bg = "bg-green-500";
              else if (status === "inprogress") bg = "bg-blue-500";
              else if (status === "todo") bg = "bg-yellow-500";

              // Viền theo priority
              let border = "";
              if (priority === "high") border = "border-2 border-red-500";
              else if (priority === "medium") border = "border border-yellow-400";
              else border = "border border-green-400";

              return {
                domNodes: [
                  (() => {
                    const el = document.createElement("div");
                    el.className = `${bg} ${border} text-white text-sm rounded-md px-2 py-1 shadow hover:opacity-90 transition`;
                    el.innerHTML = `
            <div class="font-semibold">${arg.event.title}</div>
            <div class="text-xs opacity-80">(${priority})</div>
          `;
                    return el;
                  })(),
                ],
              };
            }}
          />


        </div>
      </div>
    </div>
  );
};

export default Calendar;
