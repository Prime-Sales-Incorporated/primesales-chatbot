import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import MapEmbed from "./mapEmbed";

const ChatBot = () => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [botTyping, setBotTyping] = useState(false);
  const [animateIcon, setAnimateIcon] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("darkMode");
    return stored ? JSON.parse(stored) : true;
  });
  const [autoReadEnabled, setAutoReadEnabled] = useState(false);
  const textareaRef = useRef(null);

  const chatEndRef = useRef(null);
  const skipFirstExchange = useRef(true);

  const [showNotice, setShowNotice] = useState(() => {
    const stored = localStorage.getItem("noticeShown");
    return stored ? false : true; // show only if not seen before
  });

  // Dark mode effect
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  // Initial icon spin
  useEffect(() => {
    const delay = 1800;
    const startSpin = setTimeout(() => {
      setAnimateIcon(true);
      setTimeout(() => setAnimateIcon(false), 1000);
    }, delay);
    return () => clearTimeout(startSpin);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
    setAnimateIcon(true);
    setTimeout(() => setAnimateIcon(false), 1000);
  };
  const handleCloseNotice = () => {
    setShowNotice(false);
    localStorage.setItem("noticeShown", "true"); // so it won’t show again
  };

  // Auto-scroll chat
  useEffect(() => {
    if (chatHistory.length === 0) return;
    if (skipFirstExchange.current) {
      const hasUser = chatHistory.some((m) => m.role === "user");
      const hasBot = chatHistory.some((m) => m.role === "bot");
      if (hasUser && hasBot) skipFirstExchange.current = false;
      return;
    }
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [chatHistory]);

  // General speak function
  const speak = (text) => {
    if (!window.speechSynthesis) return; // check support

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    const ttsText = text.replace(/\bPSI\b/g, "P S I");
    const utterance = new SpeechSynthesisUtterance(ttsText);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      // Stop any ongoing speech when component unmounts
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    const RESET_URL = "https://psi-chatbot-backend.onrender.com/reset-history";

    // 1) On mount: proactively clear server-side chat history for this session
    const resetOnMount = async () => {
      try {
        await axios.post(RESET_URL);
        // optional: also clear any frontend persisted history
        localStorage.removeItem("chatHistory");
        setChatHistory([]); // ensure UI is cleared
        console.log("Reset chatHistory on mount");
      } catch (err) {
        console.warn("Reset on mount failed:", err);
      }
    };
    resetOnMount();

    // 2) On page unload/reload: best-effort sendBeacon to clear the server
    const handleBeforeUnload = () => {
      try {
        // sendBeacon is fire-and-forget and works during unload
        if (navigator.sendBeacon) {
          const blob = new Blob([JSON.stringify({})], {
            type: "application/json",
          });
          navigator.sendBeacon(RESET_URL, blob);
        } else {
          // fallback synchronous XHR for older browsers
          const xhr = new XMLHttpRequest();
          xhr.open("POST", RESET_URL, false); // false = synchronous
          xhr.send(null);
        }
      } catch (e) {
        // ignore errors during unload
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleChange = (e) => {
    setMessage(e.target.value);

    // Auto-resize logic
    const el = textareaRef.current;
    el.style.height = "auto"; // reset first
    el.style.height = el.scrollHeight + "px"; // then set to scrollHeight
  };
  const handleSend = async (msg = null) => {
    // Always coerce into a string
    let messageToSend = msg ?? message;
    if (typeof messageToSend !== "string") {
      try {
        messageToSend = String(messageToSend);
      } catch {
        messageToSend = "";
      }
    }

    if (!messageToSend.trim()) return;

    const userMsg = { role: "user", content: messageToSend };
    setChatHistory((prev) => [...prev, userMsg]);
    setMessage("");
    setBotTyping(true);
    setLoading(true);

    try {
      const res = await axios.get(
        "https://primesales-chatbot-server.onrender.com/chat",
        // "http://localhost:5000/chat",
        { params: { message: messageToSend } }
      );
 
      
      // Normalize reply into string
      let fullText = res.data?.reply ?? "No reply received.";
      if (typeof fullText !== "string") {
        fullText = fullText?.text ?? JSON.stringify(fullText, null, 2);
      }

      const botMsg = { role: "bot", content: "", finished: false };
      setChatHistory((prev) => [...prev, botMsg]);

      // Typewriter animation
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setChatHistory((prev) => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1].content = fullText.slice(0, i);
          return newHistory;
        });

        if (i === fullText.length) {
          clearInterval(interval);

          setChatHistory((prev) => {
            const newHistory = [...prev];
            newHistory[newHistory.length - 1].finished = true;
            return newHistory;
          });

          if (autoReadEnabled) speak(fullText);
        }
      }, 5);
    } catch (err) {
      console.error(err);
      setChatHistory((prev) => [
        ...prev,
        {
          role: "bot",
          content: "⚠️ Something went wrong. Please try again later.",
          finished: true,
        },
      ]);
    } finally {
      setLoading(false);
      setBotTyping(false);
    }

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.overflowY = "hidden";
      textarea.style.paddingBottom = "0.5rem";
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const quickReplies = [
    "Prime Sales",
    "Who are you",
    "Do you have forklift",
    "All Products",
    "Why choose Prime Sales",
    "Pricing info",
    "Contact info",
    "Business hours",
    "Location",
    "Cebu Branch Map",
    "Main Branch Map",
    "Hotline",
  ];

  const handleQuickReply = (text) => {
    setMessage(text);
    handleSend(text);
  };

  return (
    <div className="flex flex-col items-center min-h-screen dark:bg-slate-950 transition-colors duration-500 bg-gray-50 p-2">
      {/* Header */}
      <div className="mb- text-center p-4 md:p-0 md:px-8 lg:px-20 flex items-center fixed top-0 z-10 dark:bg-slate-950 bg-gray-50 transition-colors duration-500 w-full justify-between">
        <div className="flex mb-2">
          <img
            src={darkMode ? "/logo-white.png" : "/logo.png"}
            alt="logo"
            className="h-8 md:h-20 mt-2"
          />
        </div>
        {showNotice && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg max-w-md w-11/12 text-center">
              <h2 className="text-lg font-bold mb-2 text-green-600">Notice</h2>
              <p className="text-sm dark:text-gray-300 text-gray-700 mb-4">
                For product inquiries, please ask using the{" "}
                <strong>specific and complete product name</strong>. This helps
                Primo give you more accurate information.
              </p>
              <button
                onClick={handleCloseNotice}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        )}
        <div className="flex items-center space-x-[-12px] md:space-x-[-20px] mr-8 md:mr-36 lg:mr-48">
          <img
            src="/bot.gif"
            alt="spark animation"
            className="h-12 w-12 md:h-24 md:w-24 m-0"
          />
          <h1 className="text-sm md:text-xl lg:text-3xl font-iris font-bold  text-green-500 m-0 leading-none">
            PRIMO
          </h1>
        </div>

        {/* Automatic Speech + Dark Mode */}
        <div className="flex gap-2 items-center">
          {/* <label className="flex items-center gap-1 text-sm dark:text-white text-black">
            Automatic Speech
            <input
              type="checkbox"
              checked={autoReadEnabled}
              onChange={() => setAutoReadEnabled((prev) => !prev)}
              className="w-5 h-5 rounded border-gray-300 dark:border-gray-600
                         checked:bg-green-500 checked:border-green-500 focus:ring-0"
            />
          </label> */}

          <button
            onClick={toggleDarkMode}
            aria-label="Toggle Dark Mode"
            className="p-2 rounded-full"
          >
            <div
              className={`md:w-7 md:h-7 w-5 h-5 flex items-center justify-center rounded-full transition-colors duration-500 ${
                darkMode ? "bg-white" : ""
              }`}
            >
              <span
                className={`material-icons text-slate-900 text-base md:text-3xl transition-colors duration-500 ${
                  animateIcon ? "animate-spin-twice" : ""
                }`}
              >
                {darkMode ? "dark_mode" : "light_mode"}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Chat Area  */}
      <div className="flex flex-col items-center px-1 md:px-0 lg:px-0 w-full max-w-2xl flex-1 relative mt-20 md:mt-24">
        <div className="flex-1 overflow-y-auto w-full pb-28 flex flex-col">
          {chatHistory.length === 0 && (
            <div className="flex flex-1 flex-col items-center text-gray-800 text-sm">
              <p className="mb-8 lg:mt-32 md:mt-56 mt-32 text-lg font-opensans dark:text-white text-slate-950 transition-colors duration-500">
                I’m here to help.
              </p>

              {/* Quick replies */}
              <div className="w-full max-w-2xl">
                <div className="fixed bottom-32 left-1/2 transform -translate-x-1/2 w-11/12 max-w-2xl flex flex-wrap gap-2 mb-2">
                  {quickReplies.map((text, idx) => (
                    <button
                      key={idx}
                      className="bg-green-500 text-white px-3 text-base py-1 rounded-full hover:bg-green-600 transition-colors"
                      onClick={() => handleQuickReply(text)}
                    >
                      {text}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Chat messages */}
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-4 flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-3 py-1 rounded-lg break-words relative ${
                  msg.role === "user"
                    ? "dark:bg-slate-700 bg-green-200 text-left max-w-xs transition-colors duration-500"
                    : "text-left max-w-2xl dark:text-white text-black"
                }`}
              >
                {msg.content.split("\n").map((line, i) => {
                  const mapMatch = line.match(/<MAP>(.*?)<\/MAP>/);
                  if (mapMatch) {
                    const branch = mapMatch[1].trim().toLowerCase();
                    return <MapEmbed key={i} branch={branch} />;
                  }

                  // Check if line starts with a bullet
                  if (line.startsWith("•")) {
                    // Split at the first dash
                    const [namePart, descPart] = line
                      .split("–")
                      .map((s) => s.trim());
                    return (
                      <div key={i} className="dark:text-white text-black mb-1">
                        {namePart && <strong>{namePart}</strong>}{" "}
                        {/* bold the bullet + name */}
                        {descPart && <> – {descPart}</>}{" "}
                        {/* normal text for description */}
                      </div>
                    );
                  }

                  return (
                    <div key={i} className="dark:text-white text-black mb-1">
                      {line}
                    </div>
                  );
                })}

                {/* Only show sound icon for bot messages when finished */}
                {msg.role === "bot" && msg.finished && (
                  <button
                    onClick={() => speak(msg.content)}
                    className="absolute bottom-1 right-0 text-green-500 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="Read aloud"
                  >
                    <span className="material-icons text-base">volume_up</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Bot Typing Indicator */}
          {botTyping && (
            <div className="flex justify-start mb-4">
              <div className="px-3 py-2 rounded-lg bg-gray-300 dark:bg-slate-700 max-w-xs flex gap-1">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce-fade [animation-delay:-0.32s]"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce-fade [animation-delay:-0.16s]"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce-fade"></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} className="scroll-mt-32 scroll-mb-24" />
        </div>
      </div>

      {/* Fixed Input Bar */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full justify-center items-center flex bg-slate-50 dark:bg-slate-950 transition-colors duration-500 min-w-[96em] max-w-2xl">
        <div className="relative flex mb-8 md:mb-10 lg:mb-8 mt-0 items-end max-w-[48em] rounded-2xl border border-green-500 overflow-hidden shadow-sm dark:bg-slate-700 bg-white transitions-color duration-500">
          <textarea
            ref={textareaRef}
            className="flex-1 pl-4 pr-12 py-2 text-[18px ] min-w-[22em] md:min-w-[38em]  lg:min-w-[42em]  focus:outline-none bg-transparent resize-none overflow-hidden dark:text-white text-black box-border"
            placeholder="Ask Primo "
            value={message}
            onChange={(e) => {
              handleChange(e);

              const textarea = textareaRef.current;
              if (textarea) {
                // If message is empty, reset to single row
                if (e.target.value === "") {
                  textarea.style.height = "auto";
                  textarea.style.overflowY = "hidden";
                  textarea.style.paddingBottom = "0.5rem";
                  return;
                }

                // Reset height to auto to get the natural content height
                textarea.style.height = "auto";

                // Calculate the content height
                const scrollHeight = textarea.scrollHeight;
                const maxHeight = 160; // max-h-40 = 10rem = 160px

                // Set height to content height, but don't exceed maxHeight
                const newHeight = Math.min(scrollHeight, maxHeight);
                textarea.style.height = newHeight + "px";

                // Only show scrollbar and padding when we hit the max height
                if (scrollHeight > maxHeight) {
                  textarea.style.overflowY = "auto";
                  textarea.style.paddingBottom = "2.5rem";
                  // Scroll to bottom when at max height
                  setTimeout(() => {
                    textarea.scrollTop = textarea.scrollHeight;
                  }, 0);
                } else {
                  textarea.style.overflowY = "hidden";
                  textarea.style.paddingBottom = "0.5rem";
                }
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={loading}
            rows={1}
            style={{
              minHeight: "2.5rem", // Ensure consistent minimum height
              lineHeight: "1.5", // Consistent line height
            }}
          />

          {/* Floating send button */}
          <button
            onClick={() => handleSend()}
            className="absolute right-3 bottom-1 text-black text-base transition-colors duration-200"
            disabled={loading}
          >
            {loading ? (
              "..."
            ) : (
              <span className="material-icons text-green-500 text-2xl">
                send
              </span>
            )}
          </button>
        </div>
        <p className="absolute md:bottom-4 bottom-3 lg:bottom-3 text-[10px]  md:text-sm text-center text-gray-600 dark:text-gray-400">
          Primo can make mistakes. Contact us directly to verify information.
        </p>
        {/* Disclaimer text */}
      </div>
    </div>
  );
};

export default ChatBot;
