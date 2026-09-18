import React, { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, HelpCircle, Bot, User, CornerDownLeft, Loader2 } from "lucide-react";
import { AssessmentReport, ChatMessage } from "../types";

interface ChatAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: AssessmentReport | null;
}

const PROMPT_SUGGESTIONS = [
  "Why did VEYA give this recommendation?",
  "Explain my monthly EMI and grace period",
  "What are the biggest risks in this business?",
  "What is the difference between my two scores?",
  "How can I reach my first 20 customers?",
];

export const ChatAssistantModal: React.FC<ChatAssistantModalProps> = ({
  isOpen,
  onClose,
  report,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "veya",
      text: "Namaste! I am VEYA, your rural business advisory mentor. I have reviewed your feasibility numbers, concessional scheme options, and market demand. What would you like to know?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          reportContext: report,
          history: messages.slice(-4),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const veyaMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "veya",
          text: data.reply || "I am here to guide you with your business plan.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, veyaMsg]);
      } else {
        throw new Error("Failed to get response");
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "veya",
        text: "I am having trouble connecting to the network right now. Please refer to the financial summary and feasibility card above.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 sm:inset-auto sm:right-6 sm:bottom-6 z-50 flex flex-col w-full sm:w-96 sm:max-w-md h-full sm:h-[550px] bg-white sm:rounded-3xl border border-[#DFE7D8] shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1E5D38] to-[#154628] text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center p-1 shadow-xs shrink-0">
            <img src="/veya-icon.svg" alt="VEYA" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <span>Ask VEYA</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-normal">
                AI Mentor
              </span>
            </h3>
            <p className="text-[10px] text-emerald-100">
              {report ? `${report.input.category} Advisory (${report.location.block})` : "General Advisory"}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Message Thread */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAFBF8] text-xs">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                  isUser ? "bg-[#1E5D38] text-white" : "bg-emerald-100 text-[#1E5D38]"
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[80%] p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? "bg-[#1E5D38] text-white rounded-tr-none"
                    : "bg-white text-[#1C3322] border border-[#E0E7DC] rounded-tl-none shadow-2xs"
                }`}
              >
                <p>{msg.text}</p>
                <span
                  className={`text-[9px] block mt-1 text-right ${
                    isUser ? "text-emerald-200" : "text-[#758877]"
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-[#596D5B] italic">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1E5D38]" />
            <span>VEYA is reasoning over verified benchmarks...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-2.5 bg-white border-t border-[#E8EEE5] overflow-x-auto flex gap-1.5 scrollbar-none">
        {PROMPT_SUGGESTIONS.map((sugg) => (
          <button
            key={sugg}
            onClick={() => handleSendMessage(sugg)}
            disabled={isLoading}
            className="px-2.5 py-1 text-[11px] rounded-full bg-[#EDF5EC] hover:bg-[#E2F0E0] text-[#1E5D38] whitespace-nowrap border border-[#D0E2CF] transition-colors shrink-0"
          >
            {sugg}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 bg-white border-t border-[#E8EEE5]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question in Hindi or English..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#CCD8C8] focus:outline-none focus:border-[#1E5D38] bg-[#FAFBF8]"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 rounded-xl bg-[#1E5D38] hover:bg-[#154628] text-white disabled:opacity-40 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
