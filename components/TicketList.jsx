/** @jsxImportSource https://esm.sh/react@18.2.0 */

import React, { useEffect, useState } from "https://esm.sh/react@18.2.0";
import { api } from "https://esm.town/v/peterqliu/zd_api";
import { TicketRow } from "https://esm.town/v/peterqliu/zd_TicketRow";

const TicketList = (props) => {
  const { sortProp, setSortProp, tickets, agents, customers, view, setActiveRecord, records } = props;

  const [statusFilter, setStatusFilter] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState(null);

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handlePriorityChange = (e) => {
    setPriorityFilter(e.target.value);
  };

  const handleHeaderClick = (property) => {
    setSortProp(property);
  };
  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">{view}</h2>
        <div className="flex gap-2">
          <select
            value={statusFilter || "all"}
            onChange={handleStatusChange}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize"
          >
            <option value="all">all status</option>
            <option value="open">open</option>
            <option value="in progress">in progress</option>
            <option value="resolved">resolved</option>
          </select>
          <select
            value={priorityFilter || "all"}
            onChange={handlePriorityChange}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize"
          >
            <option value="all">all priority</option>
            <option value="high">high</option>
            <option value="medium">medium</option>
            <option value="low">low</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <TableHeader view={view} handleHeaderClick={handleHeaderClick} sortProp={sortProp} />

          <tbody className="bg-white divide-y divide-gray-200">
            {records
              .filter((ticket) => {
                if (statusFilter && statusFilter !== "all" && ticket.status.toLowerCase() !== statusFilter)
                  return false;
                if (priorityFilter && priorityFilter !== "all" && ticket.priority.toLowerCase() !== priorityFilter)
                  return false;
                return true;
              })
              .map((record, index) => (
                <TicketRow
                  view={view}
                  agents={agents}
                  key={record.id}
                  setActiveRecord={setActiveRecord}
                  record={record}
                  customer={customers?.[record.customerId - 1]?.name || `#${record.customerId}`}
                  headerKeys={headerKeys[view]}
                />
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

function TableHeader({ view, scheme, handleHeaderClick, sortProp }) {
  // const formattedHeaders = headerKeys[view].map(k => headerTextMapping[k] || k);
  return (
    <thead className="bg-gray-50">
      <tr>
        {headerKeys[view].map((key) => {
          return (
            <th
              key={key}
              onClick={() => handleHeaderClick(key)}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
            >
              {headerTextMapping[key] || key} {sortProp === key && "  ▼"}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}

const headerTextMapping = {
  customerId: "Customer",
  lastUpdated: "Last Updated",
  assignedTo: "Assigned to",
  createdAt: "created",
  meta1: "to",
  userId: 'initiated by'
};

const headerKeys = {
  tickets: ["title", "customerId", "status", "priority", "lastUpdated", "assignedTo", "createdAt"],
  customers: ["name", "email"],
  agents: ["id", "name"],
  audit: ["eventType", "meta1", "ticketId", "createdAt", "userId"],
};

export default TicketList;