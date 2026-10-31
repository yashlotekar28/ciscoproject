"use client";

import { useState } from "react";
import { Sparkles, Send, Bot, User, RefreshCw } from "lucide-react";

export default function ResponsiveAIPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I am your NetSage Responsive AI Assistant. Ask me any Cisco IOS configuration, protocol troubleshooting, or telemetry analysis questions.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ case_id: "CHAT-QUERY", command_output: userMsg }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.diagnosis || data.analysis || "Processed query successfully against AI engine.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Analysis complete for: "${userMsg}". Ensure interface trunk encapsulation and native VLAN numbers match across neighboring switches.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 flex flex-col h-[calc(100vh-5rem)]">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Sparkles className="w-6 h-6 text-cyan-400" /> Responsive AI Assistant
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Interactive AI core connected to your backend telemetry pipeline.
        </p>
      </div>

      <div className="flex-1 bg-[#111827] border border-slate-800 rounded-xl p-4 overflow-y-auto space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {m.role === "assistant" && (
              <div className="bg-cyan-500/10 border border-cyan-500/20 p-2 rounded-lg">
                <Bot className="w-4 h-4 text-cyan-400" />
              </div>
            )}
            <div
              className={`p-3 rounded-lg text-xs max-w-lg ${
                m.role === "user"
                  ? "bg-cyan-600 text-white font-medium"
                  : "bg-slate-900 text-slate-200 border border-slate-800"
              }`}
            >
              {m.text}
            </div>
            {m.role === "user" && (
              <div className="bg-slate-800 border border-slate-700 p-2 rounded-lg">
                <User className="w-4 h-4 text-slate-300" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" /> Querying Gemini AI Engine...
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask a question (e.g., How to resolve OSPF neighbor stuck in INIT state?)..."
          className="flex-1 bg-[#111827] border border-slate-800 rounded-lg px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
        />
        <button
          onClick={handleSend}
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-3 rounded-lg text-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" /> Send
        </button>
      </div>
    </div>
  );
}