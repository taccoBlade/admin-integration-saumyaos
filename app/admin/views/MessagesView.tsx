"use client";

import { useEffect, useState } from "react";
import { Mail, CheckCircle2, Circle, Clock, Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  read_status: boolean;
  created_at: string;
}

export default function MessagesView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching messages:", error);
      } else {
        setMessages(data || []);
      }
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleReadStatus(id: string, currentStatus: boolean) {
    try {
      setUpdatingId(id);
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("contact_messages")
        .update({ read_status: !currentStatus })
        .eq("id", id);

      if (!error) {
        setMessages(messages.map(msg => 
          msg.id === id ? { ...msg, read_status: !currentStatus } : msg
        ));
      }
    } catch (err) {
      console.error("Error updating message status:", err);
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-cyan-500">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-medium text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-cyan-400" />
            Contact Messages
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Messages sent from the /contact form on your portfolio.
          </p>
        </div>
        <div className="text-sm font-mono text-cyan-500">
          {messages.filter(m => !m.read_status).length} Unread
        </div>
      </div>

      <div className="grid gap-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 border border-white/5 bg-black/20 rounded-xl">
            <Mail className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-mono text-sm">No messages yet.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`p-5 rounded-xl border transition-all ${
                msg.read_status 
                  ? "bg-black/20 border-white/5 opacity-70" 
                  : "bg-cyan-950/20 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.05)]"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => toggleReadStatus(msg.id, msg.read_status)}
                    disabled={updatingId === msg.id}
                    className="mt-1"
                  >
                    {updatingId === msg.id ? (
                      <Loader2 className="w-5 h-5 text-cyan-500 animate-spin" />
                    ) : msg.read_status ? (
                      <CheckCircle2 className="w-5 h-5 text-slate-500 hover:text-slate-300 transition-colors" />
                    ) : (
                      <Circle className="w-5 h-5 text-cyan-400 hover:text-cyan-300 transition-colors fill-cyan-400/20" />
                    )}
                  </button>
                  <div>
                    <h3 className={`font-semibold ${msg.read_status ? 'text-slate-300' : 'text-white'}`}>
                      {msg.name}
                    </h3>
                    <a href={`mailto:${msg.email}`} className="text-sm text-cyan-400 hover:underline font-mono">
                      {msg.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(msg.created_at).toLocaleDateString()}
                </div>
              </div>
              <p className={`pl-8 text-sm whitespace-pre-wrap ${msg.read_status ? 'text-slate-400' : 'text-slate-200'}`}>
                {msg.message}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
