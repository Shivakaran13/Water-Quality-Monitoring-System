import { useState } from "react";
import { motion } from "framer-motion";
import { Outlet } from "react-router-dom";
import AppSidebar from "@/components/dashboard/AppSidebar";
import Navbar from "@/components/dashboard/Navbar";

const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen water-bg">
      {/* Sidebar - desktop */}
      <div className="hidden lg:block">
        <AppSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <motion.div
            initial={{ x: -240 }}
            animate={{ x: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <AppSidebar collapsed={false} onToggle={() => setMobileMenuOpen(false)} />
          </motion.div>
        </motion.div>
      )}

      {/* Main content */}
      <style>{`
        @media (min-width: 1024px) {
          .dashboard-main { margin-left: ${sidebarCollapsed ? 72 : 240}px; }
        }
      `}</style>
      <div className="dashboard-main min-h-screen flex flex-col transition-[margin] duration-300 ease-in-out">
        <Navbar onMenuToggle={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
