import React, { useEffect, useMemo, useRef, useState } from "react";
import Logo_header from "../assets/Logo_header.png";

type StoredUser = { _id: string; name: string; email: string } | null;

const Header = () => {
  const user: StoredUser = useMemo(() => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }, []);

  const displayName = user?.name || "User";
  const initial = (displayName.trim()[0] || "U").toUpperCase();

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // Đóng menu khi click ra ngoài / nhấn Esc
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!menuRef.current || !containerRef.current) return;
      if (menuRef.current.contains(t) || containerRef.current.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("click", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <header className="bg-white h-14 w-full flex items-center px-6 shadow-sm">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <img src={Logo_header} alt="Logo" className="w-40 h-full object-contain" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex justify-center space-x-24">
        <a href="/" className="text-gray-900 font-medium">List</a>
        <a href="/Calendar" className="text-gray-400 hover:text-gray-900">Calendar</a>
        <a href="/Board" className="text-gray-400 hover:text-gray-900">Board</a>
        <a href="/Analyst" className="text-gray-400 hover:text-gray-900">Analyst</a>
      </nav>

      {/* User + Avatar */}
      <div className="relative inline-block" ref={containerRef}>
        {/* ⬇️ GIỮ NGUYÊN block này, chỉ bọc click ở container bên ngoài */}
        <div
          className="flex items-center space-x-3 cursor-pointer select-none"
          onClick={() => setOpen(s => !s)}
        >
          <div className="text-right">
            <p className="text-sm font-medium">{displayName}</p>
            <p className="text-xs text-gray-500">User</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-700 font-semibold">{initial}</span>
          </div>
        </div>

        {/* dropdown */}
        {open && (
          <div
            ref={menuRef}
            role="menu"
            aria-label="User menu"
            className="absolute right-0 top-12 w-60 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-2">
              <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
              {user?.email && <p className="text-xs text-gray-500 truncate">{user.email}</p>}
            </div>
            <div className="px-4 pb-2 flex justify-center">
              <button
                type="button"
                className="px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                onClick={handleLogout}
                role="menuitem"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
