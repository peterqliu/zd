/** @jsxImportSource https://esm.sh/react@18.2.0 */
import React, { useState } from "https://esm.sh/react@18.2.0";
import { api } from "https://esm.town/v/peterqliu/zd_api";

export const StatusSelector = ({ ticket, onClick }) => {
  const [status, setStatus] = useState(ticket.status);
  const { id } = ticket;
  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    api.post("updateTicket", { id, status: newStatus });
  };
  return (
    <select
      value={status}
      onChange={(e) => onStatusChange(e.target.value)}
      onClick={onClick}
      className={`px-2 py-1 rounded-full text-sm font-medium ${
        getStatusColor(status)
      } border-0 cursor-pointer focus:ring-2 focus:ring-blue-500 min-w-[80px] appearance-none text-center uppercase`}
    >
      <option value="open">open</option>
      <option value="in_progress">in progress</option>
      <option value="resolved">resolved</option>
    </select>
  );
};