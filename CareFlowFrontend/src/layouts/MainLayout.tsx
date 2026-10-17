import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar/sidebar";
import Navbar from "../components/Navbar/Navbar";
import "./MainLayout.css";

const MainLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="main-layout" id="careflow-app-layout">
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
      <div className="main-content">
        <Navbar
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        />
        <main className="page-content" id="careflow-main-viewport">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;