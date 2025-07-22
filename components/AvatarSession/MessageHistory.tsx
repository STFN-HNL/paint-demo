import React, { useEffect, useRef } from "react";

import { useMessageHistory, MessageSender } from "../logic";

export const MessageHistory: React.FC = () => {
  const { messages } = useMessageHistory();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || messages.length === 0) return;

    container.scrollTop = container.scrollHeight;
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="w-full bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto"
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className={`mb-3 ${
            message.sender === MessageSender.CLIENT
              ? "text-right"
              : "text-left"
          }`}
        >
          <div className={`inline-block p-2 rounded-lg max-w-[80%] ${
            message.sender === MessageSender.CLIENT
              ? "bg-blue-500 text-white"
              : "bg-white text-black border"
          }`}>
            <p className="text-sm">{message.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
