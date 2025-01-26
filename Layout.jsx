/** @jsxImportSource https://esm.sh/react@18.2.0 */

import React, { useEffect, useState } from "https://esm.sh/react@18.2.0";
import { AgentSelector } from "https://esm.town/v/peterqliu/zd_AgentSelector";
import { api } from "https://esm.town/v/peterqliu/zd_api";
import DetailModal from "https://esm.town/v/peterqliu/zd_DetailModal";
import NewTicketModal from "https://esm.town/v/peterqliu/zd_NewTicketModal";
import TicketList from "https://esm.town/v/peterqliu/zd_TicketList";

const Layout = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [view, setView] = useState("tickets");
  const [agents, setAgents] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [userRole, setUserRole] = useState(0);
  const [records, setRecords] = useState([]);
  const [sortProp, setSortProp] = useState("lastUpdated");
  const [audit, setAudit] = useState([]);
  // const userRole = parseFloat(localStorage.getItem("userRole"));

  const fetchTickets = async () => {
    const result = await api.get("getTickets", defaultSortProp.tickets);
    setTickets(result);
  };
  const fetchCustomers = async () => {
    const c = await api.get("getCustomers");
    setCustomers(c);
  };
  const fetchAgents = async () => {
    const a = await api.get("getAgents");
    setAgents(a);
  };
  const fetchAudit = async () => {
    const audit = await api.get("getAudit");
    setAudit(audit);
  };
  //  fetch of sorted tickets whenever sort scheme updates
  useEffect(() => {
    fetchTickets();
  }, [sortProp]);

  // initial datafetch of agents and customers
  useEffect(() => {
    fetchCustomers();
    fetchAgents();
    fetchAudit();
  }, []);

  function recordRouter(view) {
    if (view === "tickets") return tickets;
    if (view === "agents") return agents;
    if (view === "audit") return audit;
    if (view === "customers") return customers;
  }
  useEffect(() => {
    setSortProp(defaultSortProp[view]);

    if (view === "tickets") fetchTickets();
    if (view === "customers") fetchCustomers();
    else if (view === "agents") fetchAgents();
    else if (view === "audit") fetchAudit();
  }, [view]);

  useEffect(() => {
    localStorage.setItem("userRole", userRole);
  }, [userRole]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-800">Help Desk</h1>
        </div>
        <nav className="mt-4">
          {
            /* <a href="#" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Dashboard
          </a> */
          }
          <div
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
            onClick={() => setView("tickets")}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Tickets
          </div>
          <div
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
            onClick={() => setView("customers")}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 16c0-2-2-3-4-3s-4 1-4 3M7 8c0.6-2.7 1.5-4 5-4s4.4 1.3 5 4"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 8L6 4 M16 8L18 4"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l-1-2 M15 12l1-2"
              />
              <circle cx="12" cy="12" r="8" strokeWidth={2} />
            </svg>
            Customers
          </div>
          {userRole === 0 && (
            <>
              <div
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setView("agents")}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {/* Head with halo */}
                  <circle cx="12" cy="9" r="3" strokeWidth={2} />
                  <circle cx="12" cy="6" r="5" strokeWidth={2} strokeDasharray="2 2" />
                  {/* Wings */}
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 12c2-3 4-2 6-2s4-1 6 2"
                  />
                  {/* Robe */}
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 11l4 9 4-9"
                  />
                </svg>
                Agents
              </div>
              <div
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setView("audit")}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Audit logs
              </div>
            </>
          )}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm">
          <div className="px-4 py-4">
            {
              /* <div className="relative">
              <input
                type="text"
                placeholder="Search tickets..."
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div> */
            }
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                New Ticket
              </button>
              <span className="text-gray-600">
                Or, email <b>peterqliu.zendeskSupport@valtown.email</b> and it will appear here!
              </span>

              <div className="flex items-center gap-2 float-right ml-auto">
                <span className="text-gray-600">Impersonating</span>
                <AgentSelector
                  agents={agents}
                  agentId={userRole}
                  onAgentChange={n => setUserRole(parseFloat(n))}
                />
              </div>
            </div>
          </div>
        </header>
        <main className="p-6">
          <TicketList
            tickets={tickets}
            sortProp={sortProp}
            setSortProp={setSortProp}
            agents={agents}
            customers={customers}
            view={view}
            records={recordRouter(view)}
            setActiveRecord={setActiveRecord}
          />
        </main>
      </div>

      <NewTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        setTickets={setTickets}
      />

      <DetailModal
        activeRecord={activeRecord}
        agents={agents}
        onClose={() => setActiveRecord(null)}
      />
    </div>
  );
};

const defaultSortProp = {
  tickets: "lastUpdated",
  customers: "id",
  agents: "lastActivity",
  audit: "createdAt",
};
export default Layout;