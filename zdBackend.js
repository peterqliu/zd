import { Hono } from "https://esm.sh/hono";
import { basicAuth } from "https://esm.sh/hono/basic-auth";
import { cors } from "https://esm.sh/hono/cors";
// import { authenticateToken, backend, backendPosts } from "https://esm.town/v/peterqliu/chattyBackend";
// import { SQLiteTable } from "https://esm.town/v/peterqliu/SQLiteTable";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { OpenAI } from "https://esm.town/v/std/openai";

const app = new Hono();

// Apply CORS middleware
app.use("*", cors());

// Dynamic route handlers
app.get("/:endpoint/:string", async (c) => {
  const endpoint = c.req.param("endpoint");
  const string = c.req.param("string");

  // let auth;
  // if (endpoint !== "login") {
  //   auth = await authenticateToken(c);
  //   if (!auth) return;
  // }
  // console.log(endpoint);

  return c.json(await db[endpoint](string));
});

app.post("/:endpoint", async (c) => {
  const endpoint = c.req.param("endpoint");
  const reqBody = await c.req.json();
  console.log("post", endpoint, reqBody);
  const { userRole, userType, ...data } = reqBody;
  // let auth;
  // if (endpoint !== "login") {
  //   auth = await authenticateToken(c);
  //   if (!auth) return;
  // }
  await db.logEvent({
    eventType: endpoint,
    ...reqBody,
  });

  utils.updateAgentActivity(userRole);
  return c.json(await db[endpoint](data));
});

const supabase = createClient(
  Deno.env.get("supabaseURL"),
  Deno.env.get("supabaseKey"),
);

export const db = {
  
  async logEvent(data) {
    const { [data.eventType]: transformFn } = eventLoggingTransform;
    if (!transformFn) return true;
    const formatted = transformFn(data);
    console.log("logging", data, formatted);
    const res = await supabase
      .from("zd_events")
      .insert(formatted);
    if (res.error) console.log(res.error);
    return res.data; // [data, error];
  },

  async newTicket({ customerId, text, subject }) {
    const now = Date.now();
    const { data, error } = await supabase
      .from("zd_tickets")
      .insert({ customerId, text, subject, lastUpdated: now, createdAt: now, priority: "low", status: "open" });
    // return [data, error];
    return await db.getTickets("lastUpdated");
  },

  async getTickets(sortBy) {
    let { data, error } = await supabase
      .from("zd_tickets")
      .select("id, customerId, subject, text, status, assignedTo, priority, createdAt, lastUpdated")
      .order(sortBy, { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  },

  async getAgents(sortBy) {
    let { data, error } = await supabase
      .from("zd_agents")
      .select("id, name, lastActivity");
    // .order(sortBy, { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  },

  async getCustomers(sortBy) {
    let { data, error } = await supabase
      .from("zd_customers")
      .select("id, name, email")
      .limit(100);
    // .order(sortBy, { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  },

  async getAudit() {
    let { data, error } = await supabase
      .from("zd_events")
      .select("eventType, userId, userType, meta1, meta2, meta3, createdAt, ticketId");
    //   .order("createdAt", { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  },

  async updateTicket({ id, ...update }) {
    // update = {...update, lastUpdated: Date.now()}
    const { data, error } = await supabase
      .from("zd_tickets")
      .update({ ...update, lastUpdated: Date.now() })
      .eq("id", id);

    return data;
  },

  async newCustomer({ name, email }) {
    // First, check if a customer with the given email already exists
    let { data: existingCustomer, error: searchError } = await supabase
      .from("zd_customers")
      .select("*")
      .eq("email", email)
      .single();
    console.log(existingCustomer);

    // Return existing customer if found
    if (existingCustomer) {
      return existingCustomer;
    }

    const { count } = await supabase
      .from("zd_customers")
      .select("*", { count: "exact", head: true });
    // console.log("about to create", name, email, count);
    // // If no existing customer, create a new one
    const { data } = await supabase
      .from("zd_customers")
      .insert({ id: count + 1, name, email })
      .select()
      .single();

    // Handle insertion errors
    // if (error) {
    //   console.error("Error creating customer:", error);
    //   throw error;
    // }

    return data;
  },

  // send new message given sender and ticket id
  // returns all messages associated with requested ticket
  async newMessage({ senderId, ticketId, text }) {
    // const { count } = await supabase
    //   .from("zd_customers")
    //   .select("*", { count: "exact", head: true });
    const now = Date.now();
    console.log("NEW MESG", text);

    const { data, error } = await supabase
      .from("zd_messages")
      .insert({ senderId, ticketId, text, createdAt: now });

    if (error) {
      console.log(error);
      throw error;
    }

    return await this.getMessages({ ticketId });
  },

  async getMessages({ ticketId }) {
    let { data, error } = await supabase
      .from("zd_messages")
      .select("id, senderId, ticketId, text, createdAt")
      .eq("ticketId", ticketId);

    if (error) {
      throw error;
    }

    return data;
  },

  async formatMessage({ message }) {
    const openai = new OpenAI();

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content:
            "Here is the content to communicate to a customer. Please phrase it with the courtesy of a support agent or customer service rep. apologize and thank as necessary: "
            + message,
        },
      ],
      model: "gpt-4",
      max_tokens: 6000,
    });
    const response = completion.choices[0].message.content;

    console.log(response);
    return response;
  },
};

const utils = {
    async updateAgentActivity(agentId) {
    const { data, error } = await supabase
      .from("zd_agents")
      .update({ lastActivity: Date.now() })
      .eq("id", agentId);   
    return data;
  }
}
const eventLoggingTransform = {
  // log updates to status, priority, and assignee of tickets
  updateTicket: function(data) {
    const { userRole, userType } = data;
    let output = { userId: userRole, userType, ticketId: data.id, createdAt: Date.now() };

    if (data.status) {
      output = {
        ...output,
        meta1: data.status,
        eventType: "updateStatus",
      };
    }

    if (data.priority) {
      output = {
        ...output,
        meta1: data.priority,
        eventType: "updatePriority",
      };
    }

    if (data.assignedTo) {
      output = {
        ...output,
        meta1: data.assignedTo,
        eventType: "updateAgent",
      };
    }

    return output;
  },

  // log new messages
  newMessage: function(data) {
    const { userRole, userType, ticketId, text } = data;
    return {
      userId: userRole,
      userType,
      ticketId,
      createdAt: Date.now(),
      eventType: "newMessage",
      meta1: `${text.length}-character message`,
    };
  },
};
export default async function server(request: Request): Promise<Response> {
  return await app.fetch(request);
}