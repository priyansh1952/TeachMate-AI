import { useCallback, useEffect, useRef, useState } from "react";
import { exportConversationPDF, exportLastAnswerPDF } from "./pdfExport";
import { askAPI } from "../../utils/api";

const STORAGE_KEY = "rag_chat_history_v1";

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {}
}

export function useChatStore() {
  const [messages, setMessages] = useState(loadHistory());
  const [isSending, setIsSending] = useState(false);
  const typingIntervalRef = useRef();

  useEffect(() => saveHistory(messages), [messages]);

  // Append a user message and call backend
  const sendMessage = useCallback(async (question) => {
    if (!question?.trim()) return;
    const userMsg = { role: "user", content: question, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setIsSending(true);

    try {
      const data = await askAPI(question);
      const answerText = data?.answer ?? "I couldn't get an answer.";
      const sources = data?.sources ?? [];

      // start typing animation
      typeAssistant(answerText, sources);
    } catch (err) {
      console.error("sendMessage error", err);
      typeAssistant("⚠️ Error: failed to contact server.", []);
    } finally {
      setIsSending(false);
    }
  }, []);

  // Typing animation helper — appends an assistant blank msg then reveals chars
  const typeAssistant = useCallback((fullText, sources = []) => {
    // append blank assistant message
    const blankMsg = {
      role: "assistant",
      content: "",
      fullContent: fullText,
      sources,
      ts: Date.now(),
      typing: true,
    };
    setMessages((prev) => [...prev, blankMsg]);

    const typingSpeed = 18; // ms per character
    let i = 0;
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);

    typingIntervalRef.current = setInterval(() => {
      i += 1;
      setMessages((prev) => {
        const copy = [...prev];
        const idx = copy.map((m) => m.role).lastIndexOf("assistant");
        if (idx === -1) return copy;
        const msg = { ...copy[idx] };
        msg.content = msg.fullContent.slice(0, i);
        copy[idx] = msg;
        return copy;
      });

      if (i >= fullText.length) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
        setMessages((prev) => {
          const copy = [...prev];
          const idx = copy.map((m) => m.role).lastIndexOf("assistant");
          if (idx !== -1) copy[idx] = { ...copy[idx], typing: false };
          return copy;
        });
      }
    }, typingSpeed);
  }, []);

  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, []);

  const clearHistory = useCallback(() => {
    setMessages([]);
    saveHistory([]);
  }, []);

  const exportConversation = useCallback(() => exportConversationPDF(), []);
  const exportLastAnswer = useCallback(() => exportLastAnswerPDF(messages), [messages]);

  return {
    messages,
    setMessages,
    isSending,
    sendMessage,
    clearHistory,
    exportConversation,
    exportLastAnswer,
  };
}
