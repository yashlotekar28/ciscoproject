"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Stethoscope,
  FolderGit2,
  ShieldAlert,
  Sparkles,
  Network,
  UserCheck,
  Settings,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "AI Diagnostic Studio", href: "/diagnose", icon: Stethoscope },
    { name: "Lab Cases Repository", href: "/cases", icon: FolderGit2 },
    { name: "Rule Checker", href: "/rule-checker", icon: ShieldAlert },
    { name: "Responsive AI Assistant", href: "/responsive-ai", icon: Sparkles },
    { name: "Topology Lab Checker", href: "/lab-checker", icon: Network },
    { name: "Human Review Queue", href: "/human-review", icon: UserCheck },
    { name: "System Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0B0F17] border-r border-slate-800 p-4 space-y-4 min-h-screen shrink-0">
      <div className="text-cyan-400 font-bold text-lg px-2 flex items-center gap-2 border-b border-slate-800 pb-4">
        <Stethoscope className="w-6 h-6 text-cyan-400" /> NetSage AI
      </div>

      <nav className="space-y-1 text-xs font-medium">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all ${
                isActive
                  ? "bg-slate-800 text-cyan-400 font-bold border-l-2 border-cyan-400"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-cyan-400"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;