import React, { useEffect, useMemo, useState } from "react";
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
import { taskApi, type Task } from "@/api/taskApi";

// ---- Badge trạng thái (todo | inprogress | done) ----
const StatusBadge = ({ status }: { status: Task["status"] }) => {
  const base = "px-3 py-1 rounded text-sm font-medium";
  if (status === "done") return <span className={`${base} bg-green-100 text-green-700`}>Done</span>;
  if (status === "inprogress") return <span className={`${base} bg-blue-100 text-blue-700`}>In Process</span>;
  return <span className={`${base} bg-yellow-100 text-yellow-700`}>To Do</span>;
};

// ---- Helper: chọn mốc thời gian cho chart (ưu tiên deadline, fallback createdAt) ----
const getDate = (t: Task) => (t.deadline ? new Date(t.deadline) : new Date(t.createdAt));

const Analyst = () => {
  const [filter, setFilter] = useState<"Month" | "Week" | "Day">("Month");
  const [items, setItems] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await taskApi.list();
      setItems(data);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  // ---- Tính stats ----
  const stats = useMemo(() => {
    const todo = items.filter((t) => t.status === "todo").length;
    const inproc = items.filter((t) => t.status === "inprogress").length;
    const done = items.filter((t) => t.status === "done").length;
    return [
      { label: "To Do", value: todo, color: "border-l-4 border-yellow-500" },
      { label: "In Process", value: inproc, color: "border-l-4 border-blue-500" },
      { label: "Done", value: done, color: "border-l-4 border-green-500" },
    ];
  }, [items]);

  // ---- Dữ liệu biểu đồ theo tháng (12 tháng gần nhất) ----
  const chartData = useMemo(() => {
    const now = new Date();
    const labels: string[] = [];
    const inProgressCounts: number[] = [];
    const doneCounts: number[] = [];

    // mảng 12 tháng: từ 11 tháng trước -> tháng hiện tại
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("en-US", { month: "short" }); // Jan, Feb, ...
      labels.push(key);

      const month = d.getMonth();
      const year = d.getFullYear();

      const inprogress = items.filter((t) => {
        const dt = getDate(t);
        return t.status === "inprogress" && dt.getMonth() === month && dt.getFullYear() === year;
      }).length;

      const done = items.filter((t) => {
        const dt = getDate(t);
        return t.status === "done" && dt.getMonth() === month && dt.getFullYear() === year;
      }).length;

      inProgressCounts.push(inprogress);
      doneCounts.push(done);
    }

    return labels.map((m, idx) => ({
      month: m,
      inProgress: inProgressCounts[idx],
      completed: doneCounts[idx],
    }));
  }, [items]);

  const remove = async (id: string) => {
    try {
      await taskApi.remove(id);
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen w-full relative bg-white">
      {/* Background Glow */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "#ffffff",
          backgroundImage: `radial-gradient(circle at top center, rgba(70,130,180,0.5), transparent 70%)`,
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
            {stats.map((s, idx) => (
              <Card key={idx} className={`${s.color} shadow-md`}>
                <CardContent className="p-6 flex flex-col items-start">
                  <span className="text-3xl font-bold">{s.value}</span>
                  <span className="text-gray-600">{s.label}</span>
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
                  {(["Month", "Week", "Day"] as const).map((opt) => (
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
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="inProgress"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                    name="In Process"
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot={false}
                    name="Done"
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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    void load();
                  }}
                >
                  Refresh
                </Button>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-gray-600">
                    <th className="py-2 px-3">Task</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Deadline</th>
                    <th className="py-2 px-3">Priority</th>
                    <th className="py-2 px-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.slice(0, 30).map((t) => (
                    <tr key={t._id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3">{t.title}</td>
                      <td className="py-2 px-3">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="py-2 px-3">
                        {t.deadline ? new Date(t.deadline).toLocaleDateString() : "-"}
                      </td>
                      <td className="py-2 px-3 capitalize">{t.priority}</td>
                      <td className="py-2 px-3 flex space-x-3">
                        <button className="text-gray-600 hover:text-blue-500" title="View">
                          <Eye size={18} />
                        </button>
                        <button
                          className="text-gray-600 hover:text-red-500"
                          title="Delete"
                          onClick={() => {
                            void remove(t._id);
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td className="py-6 px-3 text-center text-gray-500" colSpan={5}>
                        No data
                      </td>
                    </tr>
                  )}
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
