import React from "react";

export default function ChatMessage({ message, isUser, formatTime }) {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`${isUser ? "bg-blue-600 text-white" : "bg-white text-gray-900"} max-w-[75%] rounded-2xl p-4 shadow`}>
        <div className="text-xs text-gray-500 mb-1">{isUser ? "You" : "AI Tutor"}</div>
        <div className="whitespace-pre-wrap leading-7">{message.content}</div>

        {message.typing && (
          <div className="mt-2 flex gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
          </div>
        )}

        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-3 border-t pt-3 text-sm text-gray-600">
            <div className="font-medium mb-2">📎 Sources</div>
            {message.sources.map((s, idx) => (
              <div key={idx} className="mb-2">
                <div className="font-semibold">🎬 {s.file}</div>
                <div className="text-xs text-gray-500">⏱ {formatTime(s.start)} → {formatTime(s.end)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
