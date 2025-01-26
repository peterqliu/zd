/** @jsxImportSource https://esm.sh/react@18.2.0 */
import React, { useEffect, useState } from "https://esm.sh/react@18.2.0";
import { api } from "https://esm.town/v/peterqliu/zd_api";
import { PrioritySelector } from "https://esm.town/v/peterqliu/zd_PrioritySelector";
import { StatusSelector } from "https://esm.town/v/peterqliu/zd_StatusSelector";
// import { OpenAI } from "https://esm.town/v/std/openai";

const DetailModal = ({ ticket, agents, activeRecord, onClose }) => {
  if (!activeRecord) return null;

  const [assignedTo, setAssignedTo] = useState(activeRecord.assignedTo);
  const [priority, setPriority] = useState(activeRecord.priority);
  const [status, setStatus] = useState(activeRecord.status);
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState(null);
  const [events, setEvents] = useState(null);

  const userRole = parseFloat(localStorage.getItem("userRole"));
  const handleSubmitMessage = async (e) => {
    e.preventDefault();
    const updatedMessages = await api.post("newMessage", {
      ticketId: activeRecord.id,
      text: message,
      senderId: userRole,
    });
    setConversation(updatedMessages);
    setMessage("");
    // onClose();
  };
  useEffect(() => {
    const fetchMessages = async () => {
      const messages = await api.post("getMessages", { ticketId: activeRecord.id });
      setConversation(messages);
    };
    fetchMessages();

    const fetchEvents = async () => {
      try {
        const allEvents = await api.post("getAudit", { ticketId: activeRecord.id });
        console.warn(activeRecord, activeRecord.id, allEvents);
        const filteredEvents = allEvents.filter(event => event.ticketId === activeRecord.id);
        setEvents(filteredEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, []);
  const handleGenerateMessage = async () => {
    try {
      setMessage("Making it nice...");
      const generated = await api.post("formatMessage", {
        message,
      });
      setMessage(generated);
    } catch (error) {
      console.error("Error generating message:", error);
    }
  };

  const { subject, customer, text, createdAt } = activeRecord;
  console.log(agents, conversation, userRole);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-3/4 h-3/4 flex relative">
        <div className="w-1/2 p-8">
          <h2 className="text-xl font-bold text-gray-800">{subject}</h2>
          <div className="text-sm text-gray-600 mb-4">
            <span>From: {customer || "Unknown Customer"}</span>
            <span className="mx-2">•</span>
            <span>{new Date(createdAt).toLocaleDateString()}</span>
          </div>
          <div className="mb-4">{text}</div>
          <PrioritySelector ticket={activeRecord} />
          <StatusSelector ticket={activeRecord} />
          <EventsList events={events} agents={agents} />
          <form onSubmit={handleSubmitMessage}>
            {
              /* <div className="mb-4">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter ticket subject"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                placeholder="Enter ticket description"
                required
              />
            </div> */
            }
            {
              /*
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={handleSubmit}
              >
                Create Ticket
              </button>
            </div> */
            }
          </form>
        </div>
        <div className="w-1/2 p-8">
          <div className="flex flex-col h-1/16">
            <h3 className="text-lg font-bold mb-2">Messages</h3>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex flex-col h-3/4 overflow-y-auto">
            {conversation
              ? conversation.map((message, index) => (
                <div key={index} className="mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    {message.text.split("\n").map((line, index) => <p key={index} className="mb-2">{line}</p>)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    <p>
                      from {agents.find(a => a.id === message.senderId).name} •{" "}
                      {api.formatRelativeTime(message.createdAt)} ago
                    </p>
                  </div>
                </div>
              ))
              : "Loading conversation..."}
          </div>
          <div className="flex flex-col h-3/16">
            <textarea
              className="flex-grow p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your message here..."
              rows="5"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            >
            </textarea>
            <div className="flex justify-end gap-2 mt-2">
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                onClick={handleGenerateMessage}
              >
                Make it Nice
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={handleSubmitMessage}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EventsList = ({ events, agents }) => {
  const semantics = {
    apply: function(event) {
      const { userId, eventType, meta1 } = event;
      const by = agents.find(a => a.id === event.userId)?.name || "name";

      return semantics[eventType]?.({ by, meta1 }) || "NA";
    },
    updateStatus: function({ by, meta1 }) {
      return { by, action: "updated status to ", meta1 };
      //   return `<strong>${by}</strong> updated status to <strong>${meta1}</strong>`;
    },

    updatePriority: function({ by, meta1 }) {
      return { by, action: "updated priority to ", meta1 };
      //   return `<strong>${by}</strong> updated priority to <strong>${meta1}</strong>`;
    },
    updateAgent: function({ by, meta1 }) {
      console.log(agents, meta1);
      const newName = agents.find(a => a.id === parseFloat(meta1))?.name;
      const newAssignee = by === newName ? "themselves" : newName;
      return { by, action: "assigned this ticket to ", meta1: newAssignee };
    },
    newMessage: function({ by }) {
      return { by, action: "posted a message." };
      //   return `<strong>${by}</strong> posted a message.`;
    },
  };
  // const by = agents.find(a => a.id === event.userId).name;
  return (
    <div className="mt-12">
      <h3 className="text-lg font-bold mb-2">Events</h3>
      {events === null ? <p>Loading events...</p> : (
        events.map((event, index) => {
          const { by, action, meta1 } = semantics.apply(event);
          return (
            <div key={index} className="mt-4">
              {/* <p>{by}</p> */}
              <p>
                <strong>{by}</strong> {action} <strong>{meta1}</strong>.
              </p>
              <p className="text-xs text-gray-500">{new Date(event.createdAt).toLocaleString()}</p>
            </div>
          );
        })
      )}
    </div>
  );
};

export default DetailModal;