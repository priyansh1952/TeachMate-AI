import React, { useRef, useState } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { useChatStore } from "./useChatStore";
import { exportLastAnswerPDF } from "./pdfExport";

function formatTime(sec) {
  if (sec == null) return "00:00";
  sec = Math.floor(sec);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

export default function ChatBox() {
  const {
    messages,
    isSending,
    sendMessage,
    clearHistory,
  } = useChatStore();

  const chatRef = useRef(null);
  const [query, setQuery] = useState("");

  const handleSend = () => {
    if (!query.trim()) return;
    sendMessage(query);
    setQuery("");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white p-4 shadow flex items-center justify-between">
        <div className="text-lg font-semibold text-gray-700">TeachMate AI</div>

        <div className="flex gap-3">

          {/* Export Button */}
          <button
            onClick={() => exportLastAnswerPDF(messages)}
            className="px-4 py-2 text-sm font-medium rounded-full 
                       bg-green-600 text-white shadow 
                       hover:bg-green-700 hover:shadow-lg 
                       active:scale-95 transition-all flex items-center gap-2"
          >
            📄 Export Answer
          </button>

          {/* Clear Chat Button */}
          <button
            onClick={clearHistory}
            className="px-4 py-2 text-sm font-medium rounded-full
                       bg-red-500 text-white shadow 
                       hover:bg-red-600 hover:shadow-lg 
                       active:scale-95 transition-all flex items-center gap-2"
          >
            🗑️ Clear Chat
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <div 
          ref={chatRef} 
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {messages.map((m, i) => (
            <ChatMessage 
              key={i} 
              message={m} 
              isUser={m.role === "user"} 
              formatTime={formatTime}
            />
          ))}
        </div>

        {/* Input Box */}
        <ChatInput
          query={query}
          setQuery={setQuery}
          onSend={handleSend}
          isSending={isSending}
        />
      </main>
    </div>
  );
}
