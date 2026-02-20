import React from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSapientAuth } from "../context/AuthContext";
import { generateNonce } from "../utils/general";
export default function ChatPanel({
  baseUrl = "http://localhost:8000",
  accessToken,
  tenantId = "",
  onNavigateToError
}) {
  var _user$email;
  const {
    user,
    config: {
      apiKey
    }
  } = useSapientAuth();
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [messages, setMessages] = React.useState([]);
  const [error, setError] = React.useState(null);
  const scrollViewRef = React.useRef(null);
  const answerRefs = React.useRef({});

  // Extract tenant name from tenantId (e.g., "tenant_sapient-4321" -> "Sapient")
  const getTenantName = tenantId => {
    if (!tenantId) return "";
    const parts = tenantId.split("-");
    if (parts.length > 1) {
      const namePart = parts[0];
      return namePart.charAt(0).toUpperCase() + namePart.slice(1);
    }
    return tenantId;
  };
  const userName = (user === null || user === void 0 ? void 0 : user.firstName) || (user === null || user === void 0 || (_user$email = user.email) === null || _user$email === void 0 ? void 0 : _user$email.split("@")[0]) || "User";
  const tenantName = getTenantName(tenantId);
  void tenantName;

  // Scroll to bottom of ScrollView
  const scrollToBottom = () => {
    setTimeout(() => {
      var _scrollViewRef$curren;
      (_scrollViewRef$curren = scrollViewRef.current) === null || _scrollViewRef$curren === void 0 || _scrollViewRef$curren.scrollToEnd({
        animated: true
      });
    }, 100);
  };

  // Scroll to top of latest answer with continuous scrolling during streaming
  const scrollToLatestAnswer = answerId => {
    const answerRef = answerRefs.current[answerId];
    if (answerRef && scrollViewRef.current) {
      answerRef.measureLayout(scrollViewRef.current, (_x, y) => {
        var _scrollViewRef$curren2;
        (_scrollViewRef$curren2 = scrollViewRef.current) === null || _scrollViewRef$curren2 === void 0 || _scrollViewRef$curren2.scrollTo({
          y: Math.max(0, y - 20),
          animated: true
        });
      }, () => {});
    }
  };

  // Simulate streaming effect for text with continuous scrolling
  const streamText = async (fullText, messageId) => {
    const words = fullText.split(" ");
    let currentText = "";

    // Scroll to answer top when streaming starts
    setTimeout(() => scrollToLatestAnswer(messageId), 100);
    for (let i = 0; i < words.length; i++) {
      currentText += (i > 0 ? " " : "") + words[i];
      setMessages(m => m.map(msg => msg.id === messageId ? {
        ...msg,
        text: currentText,
        isStreaming: i < words.length - 1
      } : msg));

      // Keep scrolling to bottom during streaming
      if (i % 3 === 0) {
        // Scroll every 3 words to keep content visible
        scrollToBottom();
      }

      // Delay between words for streaming effect (30ms per word)
      await new Promise(resolve => setTimeout(resolve, 30));
    }

    // Mark streaming complete and final scroll to bottom
    setMessages(m => m.map(msg => msg.id === messageId ? {
      ...msg,
      isStreaming: false
    } : msg));

    // Final scroll to bottom when streaming completes
    scrollToBottom();
  };
  async function sendQuery() {
    if (!query.trim()) return;
    const id = String(Date.now());
    const currentQuery = query;
    const answerPlaceholderId = id + "-r";
    setError(null);
    setQuery("");

    // Add question to messages
    setMessages(m => [...m, {
      id,
      text: currentQuery,
      type: "question"
    }]);

    // Add thinking placeholder
    setMessages(m => [...m, {
      id: answerPlaceholderId,
      text: "Thinking",
      type: "answer",
      isStreaming: true
    }]);

    // Scroll to bottom immediately when user sends message
    scrollToBottom();
    setLoading(true);
    try {
      const url = `${baseUrl}/embedding/chat`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "x-sdk-api-key": apiKey,
          "x-request-timestamp": Date.now().toString(),
          "x-request-nonce": generateNonce()
        },
        body: JSON.stringify({
          question: currentQuery
        })
      });
      if (!res.ok) {
        let errMsg = res.statusText || `Request failed (${res.status})`;
        try {
          const payload = await res.json();
          errMsg = (payload === null || payload === void 0 ? void 0 : payload.error) || JSON.stringify(payload) || errMsg;
        } catch (e) {
          try {
            errMsg = await res.text();
          } catch (e) {}
        }
        setError(errMsg);
        setMessages(m => m.map(msg => msg.id === answerPlaceholderId ? {
          ...msg,
          text: `Error: ${errMsg}`,
          isStreaming: false
        } : msg));
        return;
      }
      let answer = "";
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await res.json().catch(() => null);
        answer = (data === null || data === void 0 ? void 0 : data.answer) ?? (data === null || data === void 0 ? void 0 : data.banswer) ?? JSON.stringify(data ?? {});
      } else {
        const textBody = await res.text().catch(() => "");
        if (textBody.trim().startsWith("<")) {
          console.warn("[ChatPanel] server returned HTML response:", textBody);
          setError("Server returned HTML instead of JSON. Check server logs.");
          answer = textBody.slice(0, 400) + (textBody.length > 400 ? "\n... (truncated)" : "");
        } else {
          answer = textBody;
        }
      }

      // Stream the answer text word-by-word (includes scrolling)
      await streamText(answer, answerPlaceholderId);
    } catch (err) {
      const errMsg = String((err === null || err === void 0 ? void 0 : err.message) ?? err);
      setError(errMsg);
      setMessages(m => m.map(msg => msg.id === answerPlaceholderId ? {
        ...msg,
        text: `Error: ${errMsg}`,
        isStreaming: false
      } : msg));

      // Navigate to error page for critical errors (network, fetch failures)
      if ((errMsg.toLowerCase().includes("network") || errMsg.toLowerCase().includes("fetch") || errMsg.toLowerCase().includes("failed to fetch")) && onNavigateToError) {
        setTimeout(() => {
          onNavigateToError();
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  }
  return /*#__PURE__*/React.createElement(View, {
    style: styles.container
  }, messages.length === 0 && /*#__PURE__*/React.createElement(View, {
    style: styles.welcomeBox
  }, /*#__PURE__*/React.createElement(Text, {
    style: styles.welcomeTitle
  }, "Hi ", userName, "!"), /*#__PURE__*/React.createElement(Text, {
    style: styles.welcomeText
  }, "How can I help you today?")), /*#__PURE__*/React.createElement(ScrollView, {
    ref: scrollViewRef,
    style: styles.messagesContainer,
    contentContainerStyle: styles.messagesContent,
    showsVerticalScrollIndicator: false
  }, messages.map(msg => /*#__PURE__*/React.createElement(View, {
    key: msg.id,
    style: [styles.messageRow, msg.type === "question" ? styles.rowRight : styles.rowLeft]
  }, /*#__PURE__*/React.createElement(View, {
    ref: ref => {
      if (msg.type === "answer") {
        answerRefs.current[msg.id] = ref;
      }
    },
    style: msg.type === "question" ? styles.questionBubble : styles.answerBubble
  }, /*#__PURE__*/React.createElement(Text, {
    style: msg.type === "question" ? styles.questionText : styles.answerText
  }, msg.text), msg.isStreaming && /*#__PURE__*/React.createElement(Text, {
    style: styles.streamingIndicator
  }, "\u25CF\u25CF\u25CF"))))), error ? /*#__PURE__*/React.createElement(Text, {
    style: styles.error
  }, error) : null, /*#__PURE__*/React.createElement(View, {
    style: styles.inputRow
  }, /*#__PURE__*/React.createElement(TextInput, {
    style: styles.input,
    placeholder: "Type your message...",
    placeholderTextColor: "#666",
    value: query,
    onChangeText: setQuery,
    editable: !loading,
    onSubmitEditing: sendQuery
  }), /*#__PURE__*/React.createElement(Pressable, {
    style: [styles.sendButton, loading && styles.sendButtonDisabled],
    onPress: sendQuery,
    disabled: loading || !query.trim()
  }, loading ? /*#__PURE__*/React.createElement(ActivityIndicator, {
    size: "small",
    color: "#fff"
  }) : /*#__PURE__*/React.createElement(Text, {
    style: styles.sendButtonText
  }, "Send"))));
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    padding: 16
  },
  welcomeBox: {
    backgroundColor: "#252525",
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#333"
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#999",
    marginBottom: 12
  },
  welcomeText: {
    fontSize: 18,
    color: "#ccc"
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 12
  },
  messagesContent: {
    paddingBottom: 12
  },
  messageRow: {
    flexDirection: "row",
    marginVertical: 6,
    paddingHorizontal: 4
  },
  rowLeft: {
    justifyContent: "flex-start"
  },
  rowRight: {
    justifyContent: "flex-end"
  },
  questionBubble: {
    backgroundColor: "#2a2a2a",
    borderColor: "#3a3a3a",
    borderWidth: 1,
    padding: 12,
    borderRadius: 16,
    maxWidth: "75%",
    borderBottomRightRadius: 4
  },
  answerBubble: {
    backgroundColor: "#1e3a2e",
    borderColor: "#2d5a45",
    borderWidth: 1,
    padding: 12,
    borderRadius: 16,
    maxWidth: "75%",
    borderBottomLeftRadius: 4
  },
  questionText: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 20
  },
  answerText: {
    color: "#d4f4dd",
    fontSize: 15,
    lineHeight: 20
  },
  streamingIndicator: {
    color: "#a0d8b3",
    fontSize: 18,
    marginTop: 4,
    opacity: 0.7
  },
  error: {
    color: "#ff6b6b",
    marginBottom: 8,
    fontSize: 14
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: "#3a3a3a",
    borderRadius: 24,
    paddingHorizontal: 16,
    backgroundColor: "#252525",
    color: "#fff",
    fontSize: 15
  },
  sendButton: {
    backgroundColor: "#2196f3",
    paddingHorizontal: 24,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 80
  },
  sendButtonDisabled: {
    opacity: 0.6
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600"
  }
});
//# sourceMappingURL=ChatPanel.js.map