import React from "react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

export default function ChatInput({ query, setQuery, onSend, isSending }) {
  return (
    <div className="p-4 bg-white border-t flex gap-3">
      <Input
        placeholder="Ask something..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSend()}
      />
      <Button onClick={onSend} disabled={isSending}>
        {isSending ? "Sending..." : "Send"}
      </Button>
    </div>
  );
}
