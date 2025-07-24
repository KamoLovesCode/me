import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const MESSAGES_KEY = "simple-chat-messages";
const USERS_KEY = "simple-chat-users";
const ADMIN_NAME = "Kamogelo";

function getStoredMessages() {
  try {
    return JSON.parse(localStorage.getItem(MESSAGES_KEY) || "[]");
  } catch {
    return [];
  }
}
function setStoredMessages(messages: any[]) {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
}
function getStoredUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}
function setStoredUsers(users: any[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [adminInput, setAdminInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll localStorage for users and messages
  useEffect(() => {
    function poll() {
      setMessages(getStoredMessages());
      setUsers(getStoredUsers());
    }
    poll();
    const interval = setInterval(poll, 1000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedUser]);

  // Get users (excluding admin) with their latest message
  const userList = users
    .filter(u => u !== ADMIN_NAME)
    .map(u => {
      const userMsgs = messages.filter(m => m.from === u || m.to === u);
      const lastMsg = userMsgs.length > 0 ? userMsgs[userMsgs.length - 1] : null;
      return {
        name: u,
        lastMsg,
      };
    });

  // Get chat history with selected user
  const chatWithUser = selectedUser
    ? messages.filter(m =>
        (m.from === selectedUser && m.to === ADMIN_NAME) ||
        (m.from === ADMIN_NAME && m.to === selectedUser)
      )
    : [];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminInput.trim() || !selectedUser) return;
    const newMsg = {
      id: Date.now() + Math.random(),
      from: ADMIN_NAME,
      to: selectedUser,
      text: adminInput,
      time: Date.now(),
    };
    const updated = [...getStoredMessages(), newMsg];
    setStoredMessages(updated);
    setMessages(updated);
    setAdminInput("");
  };

  return (
    <main className="min-h-screen p-6 md:p-10 bg-background text-foreground">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Chat Panel</h1>
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Portfolio
            </Link>
          </Button>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          {/* User list */}
          <div className="w-full md:w-1/3 bg-muted rounded-xl p-4 shadow space-y-2 h-fit">
            <h2 className="text-lg font-semibold mb-2">Users</h2>
            {userList.length === 0 ? (
              <div className="text-muted-foreground">No users online.</div>
            ) : (
              <ul className="space-y-2">
                {userList.map(u => (
                  <li key={u.name}>
                    <button
                      className={`w-full text-left px-3 py-2 rounded-lg hover:bg-primary/10 transition ${selectedUser === u.name ? "ring-2 ring-primary" : ""}`}
                      onClick={() => setSelectedUser(u.name)}
                    >
                      <div className="font-semibold flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-gray-400"></span>
                        {u.name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                        {u.lastMsg ? (u.lastMsg.text.length > 30 ? u.lastMsg.text.slice(0, 30) + "..." : u.lastMsg.text) : "No messages yet"}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Chat area */}
          <div className="flex-1 bg-card rounded-xl p-4 shadow flex flex-col h-[60vh] min-h-[350px]">
            {selectedUser ? (
              <>
                <div className="font-semibold mb-2">Chat with {selectedUser}</div>
                <div className="flex-1 overflow-y-auto space-y-3 mb-2">
                  {chatWithUser.length === 0 ? (
                    <div className="text-muted-foreground text-center mt-10">No messages yet.</div>
                  ) : (
                    chatWithUser.map((msg, idx) => (
                      <div
                        key={msg.id || idx}
                        className={`flex ${msg.from === ADMIN_NAME ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[70%] px-4 py-2 rounded-lg message-bubble
                          ${msg.from === ADMIN_NAME
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-muted text-foreground rounded-bl-none"
                          }`}
                        >
                          <div className="text-xs font-semibold mb-1 opacity-60">
                            {msg.from}
                            <span className="ml-2 text-[10px]">{msg.time ? new Date(msg.time).toLocaleTimeString() : ""}</span>
                          </div>
                          <div className="break-words">{msg.text}</div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <form className="flex gap-2 mt-2" onSubmit={handleSend}>
                  <input
                    type="text"
                    value={adminInput}
                    onChange={e => setAdminInput(e.target.value)}
                    placeholder={`Reply to ${selectedUser}`}
                    className="flex-1 px-4 py-2 rounded bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-primary text-primary-foreground font-semibold hover:bg-primary/80 transition disabled:opacity-50"
                    disabled={!adminInput.trim()}
                  >Send</button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">Select a user to chat</div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
