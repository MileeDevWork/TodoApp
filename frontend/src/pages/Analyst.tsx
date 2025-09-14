// src/pages/Analyst.jsx
import React, { useState } from "react";
import Header from "../components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Eye, Trash2 } from "lucide-react";

// --- Mock Data (sau này thay bằng API fetch) ---
const stats = [
  { label: "To Do", value: 79, color: "border-l-4 border-yellow-500" },
  { label: "In Process", value: 160, color: "border-l-4 border-blue-500" },
  { label: "Done", value: 7, color: "border-l-4 border-green-500" },
];

const chartData = [
  { month: "Jan", inProgress: 33, completed: 15 },
  { month: "Feb", inProgress: 31, completed: 16 },
  { month: "Mar", inProgress: 40, completed: 20 },
  { month: "Apr", inProgress: 41, completed: 21 },
  { month: "May", inProgress: 43, completed: 22 },
  { month: "Jun", inProgress: 45, completed: 23 },
  { month: "Jul", inProgress: 48, completed: 25 },
];

const tasks = [
  {
    id: 1,
    title: "Complete project presentation",
    status: "Done",
    dueDate: "29/04/2025",
    priority: "High",
  },
  {
    id: 2,
    title: "Complete project presentation",
    status: "In Process",
    dueDate: "29/04/2025",
    priority: "Medium",
  },
  {
    id: 3,
    title: "Complete project presentation",
    status: "To Do",
    dueDate: "29/04/2025",
    priority: "Low",
  },
];

// --- Helper render badge ---
type StatusBadgeProps = {
  status: string;
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const base = "px-3 py-1 rounded text-sm font-medium";
  switch (status) {
    case "Done":
      return <span className={`${base} bg-green-100 text-green-700`}>Done</span>;
    case "In Process":
      return (
        <span className={`${base} bg-yellow-100 text-yellow-700`}>In Process</span>
      );
    case "To Do":
      return <span className={`${base} bg-blue-100 text-blue-700`}>To Do</span>;
    default:
      return <span className={base}>{status}</span>;
  }
};

const Analyst = () => {
  const [filter, setFilter] = useState("Month");

  return (
    <div className="min-h-screen w-full relative bg-white">
      {/* Background Glow */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "#ffffff",
          backgroundImage: `
            radial-gradient(circle at top center, rgba(70,130,180,0.5), transparent 70%)
          `,
          filter: "blur(80px)",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col w-screen min-h-screen space-y-6">
        <Header />

        <div className="p-6 space-y-8">
            {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((item, idx) => (
            <Card key={idx} className={`${item.color} shadow-md`}>
              <CardContent className="p-6 flex flex-col items-start">
                <span className="text-3xl font-bold">{item.value}</span>
                <span className="text-gray-600">{item.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart */}
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Task Progress</h2>
              <div className="space-x-2">
                {["Month", "Week", "Day"].map((opt) => (
                  <Button
                    key={opt}
                    variant={filter === opt ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(opt)}
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="inProgress"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                  name="In Progress Tasks"
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={false}
                  name="Completed Tasks"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Task List */}
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Task List</h2>
              <Button size="sm">Detail</Button>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-gray-600">
                  <th className="py-2 px-3">Task</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Due Date</th>
                  <th className="py-2 px-3">Priority</th>
                  <th className="py-2 px-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3">{task.title}</td>
                    <td className="py-2 px-3">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="py-2 px-3">{task.dueDate}</td>
                    <td
                      className={`py-2 px-3 font-medium ${
                        task.priority === "High"
                          ? "text-red-500"
                          : task.priority === "Medium"
                          ? "text-yellow-500"
                          : "text-green-500"
                      }`}
                    >
                      {task.priority}
                    </td>
                    <td className="py-2 px-3 flex space-x-3">
                      <button className="text-gray-600 hover:text-blue-500">
                        <Eye size={18} />
                      </button>
                      <button className="text-gray-600 hover:text-red-500">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default Analyst;
