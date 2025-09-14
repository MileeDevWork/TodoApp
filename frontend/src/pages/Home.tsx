import React from "react";
import { Edit2, Trash2, Calendar } from "lucide-react";
import Header from "../components/header";

const Home = () => {
  return (
    <div className="min-h-screen w-full relative bg-white">
      {/* Background effect */}
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

      {/* Content */}
      <div className="relative z-10 flex flex-col w-screen min-h-screen">
        {/* Header */}
        <Header />

        {/* Main dashboard */}
        <main className="flex-1 p-6 space-y-8 max-w-4xl mx-auto w-full">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white shadow-md rounded-xl p-6 flex flex-col items-center">
              <p className="text-3xl font-bold text-orange-500">79</p>
              <p className="text-gray-600">To Do</p>
            </div>
            <div className="bg-white shadow-md rounded-xl p-6 flex flex-col items-center">
              <p className="text-3xl font-bold text-blue-500">160</p>
              <p className="text-gray-600">In Process</p>
            </div>
            <div className="bg-white shadow-md rounded-xl p-6 flex flex-col items-center">
              <p className="text-3xl font-bold text-green-500">7</p>
              <p className="text-gray-600">Done</p>
            </div>
          </div>

          {/* Input Add Task */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Cần phải làm gì?"
              className="flex-1 border rounded-md px-3 py-2"
            />
            <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md">
              + Thêm
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-md text-sm">
                10 đang làm
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-600 rounded-md text-sm">
                10 hoàn thành
              </span>
            </div>
            <div className="flex gap-3">
              <button className="px-3 py-1 rounded-md bg-purple-500 text-white text-sm">
                Tất Cả
              </button>
              <button className="px-3 py-1 rounded-md bg-gray-100 text-gray-600 text-sm hover:bg-gray-200">
                Đang Làm
              </button>
              <button className="px-3 py-1 rounded-md bg-gray-100 text-gray-600 text-sm hover:bg-gray-200">
                Hoàn Thành
              </button>
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-4">
            {["post video", "dsds", "mua quà sinh nhật", "quét nhà, lau nhà"].map(
              (task, i) => (
                <div
                  key={i}
                  className="bg-white shadow-sm rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="w-5 h-5" />
                    <div>
                      <p className="font-medium">{task}</p>
                      <div className="flex items-center text-sm text-gray-500 gap-1">
                        <Calendar size={14} />
                        <span>8/20/2025, 8:41:29 PM</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-500">
                    <Edit2
                      size={18}
                      className="cursor-pointer hover:text-purple-500"
                    />
                    <Trash2
                      size={18}
                      className="cursor-pointer hover:text-red-500"
                    />
                  </div>
                </div>
              )
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex gap-2">
              <button className="px-2 py-1">Trước</button>
              <button className="px-3 py-1 border rounded-md">1</button>
              <button className="px-2 py-1">2</button>
              <button className="px-2 py-1">3</button>
              <span>...</span>
              <button className="px-2 py-1">5</button>
              <button className="px-2 py-1">Sau</button>
            </div>
            <div>
              <select className="border rounded-md px-2 py-1">
                <option>Tất cả</option>
                <option>Đang làm</option>
                <option>Hoàn thành</option>
              </select>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
