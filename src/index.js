import * as React from "react";
import { MessageSquare, X, Send, Loader } from "lucide-react";

const AIChatWidget = (props) => {
  const { apiKey, config = {} } = props;

  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [inputMessage, setInputMessage] = React.useState("");
  const messagesEndRef = React.useRef(null);

  const defaultConfig = {
    companyName: "AI Chat Support",
    primaryColor: "#4F46E5",
    position: "bottom-right",
    initialMessage: "Hello! How can I help you today?",
  };

  const finalConfig = { ...defaultConfig, ...config };

  React.useEffect(() => {
    setMessages([
      {
        id: "welcome",
        type: "bot",
        content: finalConfig.initialMessage,
        timestamp: new Date(),
      },
    ]);
  }, [finalConfig.initialMessage]);

  const handleSendMessage = async (message) => {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: `You are a helpful customer service assistant for ${finalConfig.companyName}.`,
              },
              {
                role: "user",
                content: message,
              },
            ],
          }),
        }
      );

      const data = await response.json();

      if (data.choices && data.choices[0]) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "bot",
            content: data.choices[0].message.content,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "bot",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed z-50"
      style={{
        ...(finalConfig.position === "bottom-right"
          ? { bottom: "20px", right: "20px" }
          : { bottom: "20px", left: "20px" }),
      }}
    >
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          style={{ backgroundColor: finalConfig.primaryColor }}
        >
          <MessageSquare className="text-white" size={24} />
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-xl w-80">
          <div
            className="p-4 flex justify-between items-center rounded-t-lg"
            style={{ backgroundColor: finalConfig.primaryColor }}
          >
            <h3 className="text-white font-semibold">
              {finalConfig.companyName}
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader className="animate-spin" size={16} />
                <span className="text-sm">AI is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputMessage);
              setInputMessage("");
            }}
            className="p-4 border-t"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border rounded focus:outline-none focus:border-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="p-2 rounded text-white transition-colors"
                style={{ backgroundColor: finalConfig.primaryColor }}
                disabled={!inputMessage.trim() || isLoading}
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIChatWidget;
