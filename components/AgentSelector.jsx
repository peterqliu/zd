/** @jsxImportSource https://esm.sh/react@18.2.0 */
import React, { useState } from "https://esm.sh/react@18.2.0";
import { api } from "https://esm.town/v/peterqliu/zd_api";

export const AgentSelector = ({ ticket, agents, onClick }) => {
  const [assignedAgent, setAssignedAgent] = useState(ticket?.assignedTo || agentId);

  const handleAgentChange = async (ticketId, newAgentId) => {
    setAssignedAgent(newAgentId);
    await api.post("updateTicket", { id: ticketId, assignedTo: newAgentId });
  };

  return (
    <select
      value={assignedAgent || ""}
      onChange={(e) => handleAgentChange(ticket.id, e.target.value)}
      onClick={onClick}
      className="px-2 py-1 rounded-full text-sm font-medium text-gray-600 border-0 cursor-pointer focus:ring-2 focus:ring-blue-500 min-w-[100px] appearance-none text-center capitalize"
    >
      <option value="">No One</option>
      {agents.map(agent => (
        <option key={agent.id} value={agent.id}>
          {agent.name}
        </option>
      ))}
    </select>
  );
}; 