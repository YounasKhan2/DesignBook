import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import TopBar from "./TopBar";

export default function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#f4f6f9", fontFamily: "Inter, sans-serif" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-60 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
