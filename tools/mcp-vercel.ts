#!/usr/bin/env node
// Minimal Vercel MCP server for the Copilot coding agent
// Uses Node 18+ global fetch
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
if (!VERCEL_TOKEN) {
  console.error("Missing VERCEL_TOKEN env");
  process.exit(1);
}

const BASE = "https://api.vercel.com";

async function v(path: string, init: RequestInit = {}) {
  const headers = {
    Authorization: `Bearer ${VERCEL_TOKEN}`,
    "Content-Type": "application/json",
    ...(init.headers || {}),
  };
  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json();
}

const server = new Server(
  { name: "vercel-mcp", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

// List projects
server.tool(
  "projects.list",
  { description: "List Vercel projects for the token" },
  async () => {
    const data = await v("/v9/projects");
    return { content: [{ type: "text", text: JSON.stringify(data) }] };
  }
);

// Create or update an env var on a project
server.tool(
  "env.upsert",
  {
    description: "Create or update an env var",
    inputSchema: {
      type: "object",
      properties: {
        projectId: { type: "string" },
        key: { type: "string" },
        value: { type: "string" },
        target: {
          type: "array",
          items: { type: "string", enum: ["production", "preview", "development"] }
        }
      },
      required: ["projectId", "key", "value", "target"]
    }
  },
  async ({ input }: any) => {
    const body = { key: input.key, value: input.value, target: input.target };
    const out = await v(`/v10/projects/${input.projectId}/env`, {
      method: "POST",
      body: JSON.stringify(body)
    });
    return { content: [{ type: "text", text: JSON.stringify(out) }] };
  }
);

// Trigger a deploy from a git ref
server.tool(
  "deploy.create",
  {
    description: "Trigger a deployment for a linked Git repo",
    inputSchema: {
      type: "object",
      properties: {
        projectId: { type: "string" },
        ref: { type: "string", description: "Git ref, for example main" }
      },
      required: ["projectId", "ref"]
    }
  },
  async ({ input }: any) => {
    const body = { name: "copilot-deploy", project: input.projectId, gitSource: { ref: input.ref } };
    const out = await v(`/v13/deployments`, {
      method: "POST",
      body: JSON.stringify(body)
    });
    return { content: [{ type: "text", text: JSON.stringify(out) }] };
  }
);

server.connect(new StdioServerTransport());
