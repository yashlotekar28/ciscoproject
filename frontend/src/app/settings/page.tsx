"use client";

import { useState } from "react";
import { Settings as SettingsIcon, Save, Key, Sliders, ShieldCheck, Database, Server } from "lucide-react";
import { useEffect } from "react";
import { API_BASE_URL, getApiBaseUrl } from "@/lib/api";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("AIzaSyD-MOCK_KEY_NETSAGE_2026");
  const [backendUrl, setBackendUrl] = useState("http://127.0.0.1:8000/api");
  const [llmProvider, setLlmProvider] = useState("Gemini 1.5 Pro");
  const [autoApproval, setAutoApproval] = useState(false);
  const [ruleSeverityFilter, setRuleSeverityFilter] = useState("Strict");
  const [saved, setSaved] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("netsage_backend_url");
      setBackendUrl(stored || getApiBaseUrl());
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("netsage_backend_url", backendUrl.trim());
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const testBackendConnection = async () => {
    setTestStatus("Testing...");
    try {
      let target = backendUrl.trim().replace(/\/$/, "");
      if (!target.startsWith("http://") && !target.startsWith("https://")) {
        target = `https://${target}`;
      }
      const pingUrl = target.endsWith("/api") ? target : `${target}/api`;
      const res = await fetch(`${pingUrl}/cases`);
      if (res.ok) {
        setTestStatus("Connected Successfully! (FastAPI Online)");
      } else {
        setTestStatus(`Server responded with status: ${res.status}`);
      }
    } catch (e: any) {
      setTestStatus("Connection Failed. Verify URL and ensure backend is awake on Render.");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <SettingsIcon className="w-6 h-6 text-purple-400" /> Platform & AI Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure backend API connections, inference engines, and rule-checker parameters.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* API & Connection */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Key className="w-4 h-4 text-cyan-400" /> Inference Provider & Backend Endpoints
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-400 font-medium">FastAPI Backend Endpoint</label>
                <button
                  type="button"
                  onClick={testBackendConnection}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-semibold"
                >
                  Test Connection
                </button>
              </div>
              <input
                type="text"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                placeholder="https://netsage-ai-backend.onrender.com/api"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
              {testStatus && (
                <p className={`text-[11px] mt-1.5 ${testStatus.includes("Successfully") ? "text-emerald-400" : "text-amber-400"}`}>
                  {testStatus}
                </p>
              )}
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">AI Model Engine</label>
              <select
                value={llmProvider}
                onChange={(e) => setLlmProvider(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Gemini 1.5 Pro">Google Gemini 1.5 Pro</option>
                <option value="OpenAI GPT-4o">OpenAI GPT-4o</option>
                <option value="Local Llama 3">Local Llama 3 (Ollama)</option>
              </select>
            </div>
          </div>

          <div className="text-xs">
            <label className="block text-slate-400 font-medium mb-1">LLM API Credentials Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-emerald-400 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Guardrail Policy */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-4 h-4 text-purple-400" /> Security & Human-in-the-Loop Safeguards
          </h2>

          <div className="flex items-center justify-between text-xs p-3 bg-slate-900 border border-slate-800 rounded-lg">
            <div>
              <span className="font-bold text-white block">Require Human Review Sign-Off</span>
              <span className="text-slate-400 text-[11px]">Enforce manual approval before applying Cisco CLI commands to production.</span>
            </div>
            <input
              type="checkbox"
              checked={!autoApproval}
              onChange={(e) => setAutoApproval(!e.target.checked)}
              className="w-4 h-4 accent-purple-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          {saved && <span className="text-xs text-emerald-400 font-bold font-mono animate-pulse">Configuration Saved!</span>}
          <button
            type="submit"
            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save System Settings
          </button>
        </div>
      </form>
    </div>
  );
}