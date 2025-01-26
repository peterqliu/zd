/** @jsxImportSource https://esm.sh/react@18.2.0 */
import React, { useEffect, useState } from "https://esm.sh/react@18.2.0";
import { AgentSelector } from "https://esm.town/v/peterqliu/zd_AgentSelector";
import { api } from "https://esm.town/v/peterqliu/zd_api";
import { PrioritySelector } from "https://esm.town/v/peterqliu/zd_PrioritySelector";
import { StatusSelector } from "https://esm.town/v/peterqliu/zd_StatusSelector";

export const TicketRow = (props) => {
  return rowTypes[props.view](props);
};

const rowTypes = {
  audit: function(props) {
    const { agents, headerKeys, key } = props;
    const { createdAt, userType, eventType, meta1, userId } = props.record;

    const cellConfigs = headerKeys.map((k, kI) => {
      const style = kI ? "text-gray-500" : "font-medium text-gray-900";
      let value = props.record[k];

      if (k === "createdAt") value = formatRelativeTime(value);
      if (k === "userId") value = agents[value]?.name;
      if (eventType === "updateAgent" && k === "meta1") {
        return {
          content: (
            <AgentSelector
              ticket={{ id: key, assignedTo: value }}
              agents={agents}
              disabled={true}
              onClick={(e) => e.stopPropagation()}
            />
          ),
        };
      }

      if (eventType === "updateStatus" && k === "meta1") {
        return {
          content: (
            <StatusSelector
              ticket={{ id: key, status: value }}
              disabled={true}
              onClick={(e) => e.stopPropagation()}
            />
          ),
        };
      }

      if (eventType === "updatePriority" && k === "meta1") {
        return {
          content: (
            <PrioritySelector
              ticket={{ id: key, priority: value }}
              disabled={true}
              onClick={(e) => e.stopPropagation()}
            />
          ),
        };
      }

      return { content: <div className={`text-sm ${style}`}>{value}</div> };
    });

    return (
      <tr key={key} className="hover:bg-gray-50 cursor-zoom-in">
        {cellConfigs.map((config, index) => (
          <td
            key={index}
            className={`px-6 py-4 whitespace-nowrap ${config.className || ""}`}
          >
            {config.content}
          </td>
        ))}
      </tr>
    );
  },

  agents: function(props) {
    const { name, id, setActiveRecord } = props.record;

    const cellConfigs = [
      {
        content: <div className="text-sm font-medium text-gray-900">{id}</div>,
      },
      {
        content: <div className="text-sm text-gray-500">{name}</div>,
      },
    ];

    return (
      <tr key={name} className="hover:bg-gray-50 cursor-zoom-in">
        {cellConfigs.map((config, index) => (
          <td
            key={index}
            className={`px-6 py-4 whitespace-nowrap ${config.className || ""}`}
          >
            {config.content}
          </td>
        ))}
      </tr>
    );
  },

  customers: function(props) {
    const { name, email, setActiveRecord } = props.record;

    const cellConfigs = [
      {
        content: <div className="text-sm font-medium text-gray-900">{name}</div>,
      },
      {
        content: <div className="text-sm text-gray-500">{email}</div>,
      },
    ];

    return (
      <tr key={email} className="hover:bg-gray-50 cursor-zoom-in">
        {cellConfigs.map((config, index) => (
          <td
            key={index}
            className={`px-6 py-4 whitespace-nowrap ${config.className || ""}`}
          >
            {config.content}
          </td>
        ))}
      </tr>
    );
  },

  tickets: function(props) {
    const { key, record, agents, customer, view, setActiveRecord } = props;
    const [assignedAgent, setAssignedAgent] = useState(record.assignedTo);

    const handleAgentChange = async (ticketId, newAgentId) => {
      setAssignedAgent(newAgentId);
      await api.post("updateTicket", { id: ticketId, assignedTo: newAgentId });
    };

    const cellConfigs = [
      {
        content: <div className="text-sm font-medium text-gray-900">{record.subject}</div>,
      },
      {
        content: <div className="text-sm text-gray-500">{customer}</div>,
      },
      {
        content: <StatusSelector ticket={record} onClick={(e) => e.stopPropagation()} />,
      },
      {
        content: <PrioritySelector ticket={record} onClick={(e) => e.stopPropagation()} />,
      },
      {
        content: <div className="text-sm text-gray-500">{formatRelativeTime(record.lastUpdated)}</div>,
      },
      {
        content: (
          <AgentSelector
            ticket={record}
            agents={agents}
            onClick={(e) => e.stopPropagation()}
          />
        ),
        className: "text-right",
      },
      {
        content: <div className="text-sm text-gray-500">{formatRelativeTime(record.createdAt)}</div>,
        className: "text-right",
      },
    ];

    return (
      <tr key={record.id} className="hover:bg-gray-50 cursor-zoom-in" onClick={() => setActiveRecord({ ...record, customer })}>
        {cellConfigs.map((config, index) => (
          <td
            key={index}
            className={`px-6 py-4 whitespace-nowrap ${config.className || ""}`}
          >
            {config.content}
          </td>
        ))}
      </tr>
    );
  },
};

const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
};