import type { Express } from "express";
import { createServer, type Server } from "http";
import fs from "fs/promises";
import path from "path";
import { z } from "zod";
import { buildCoachSystemInstruction } from "./promptBuilder";

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api

  app.post("/api/assessment", async (req, res, next) => {
    try {
      const { conversationId } = req.body as { conversationId?: string };
      if (!conversationId) {
        return res.status(400).json({ message: "conversationId required" });
      }

      const transcript = await fetchTranscriptFromElevenLabs(conversationId);
      
      if (!transcript || transcript.length === 0) {
        return res.status(409).json({ message: "Transcript not ready" });
      }

      const systemInstructions = await loadSystemPrompt();
      const assessment = await assessWithGemini({ transcript, systemInstructions });

      return res.json({ transcript, assessment });
    } catch (err) {
      next(err);
    }
  });

  // Chat streaming endpoint
  app.post("/api/chat", async (req, res, next) => {
    try {
      const bodySchema = z.object({
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string().max(8000),
          })
        ).max(100),
        transcript: z.string().optional().default(""),
        assessment: z.string().optional().default("")
      });

      const body = bodySchema.parse(req.body);

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY missing");

      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(apiKey);

      const systemInstruction = await buildCoachSystemInstruction(body.assessment ?? "", body.transcript ?? "");

      type SimpleMsg = { role: 'user' | 'assistant'; content: string };
      const contents = body.messages.map((m: SimpleMsg) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", systemInstruction });
      const result = await model.generateContentStream({ contents });

      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Transfer-Encoding", "chunked");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("X-Accel-Buffering", "no");

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          res.write(text);
        }
      }
      res.end();
    } catch (err) {
      next(err);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

interface ElevenTranscriptItem {
  role: "user" | "agent" | string;
  message: string;
  time_in_call_secs?: number;
}

interface ElevenConversationResponse {
  conversation_id?: string;
  status?: string; // e.g., "initiated" | "in-progress" | "processing" | "done" | "failed"
  transcript?: ElevenTranscriptItem[] | string | null;
}

async function fetchTranscriptFromElevenLabs(conversationId: string): Promise<string> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY missing");

  const url = `https://api.elevenlabs.io/v1/convai/conversations/${encodeURIComponent(conversationId)}`;
  const resp = await fetch(url, {
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
  });
  if (!resp.ok) {
    throw new Error(`ElevenLabs error ${resp.status}: ${resp.statusText}`);
  }
  const json = (await resp.json()) as ElevenConversationResponse;

  // Ensure conversation has finished processing
  if (json.status && json.status !== "done") {
    return ""; // trigger 409 upstream
  }

  // Handle both array and string forms defensively
  if (Array.isArray(json.transcript)) {
    const lines = json.transcript.map((t) => {
      const who = t.role?.toLowerCase() === "agent" ? "Agent" : t.role?.toLowerCase() === "user" ? "User" : (t.role || "Unknown");
      return `${who}: ${t.message ?? ""}`.trim();
    });
    return lines.join("\n");
  }

  if (typeof json.transcript === "string") {
    return json.transcript;
  }

  return "";
}

async function loadSystemPrompt(): Promise<string> {
  const promptPath = path.resolve(process.cwd(), "shared/prompts/assessment_system.txt");
  return await fs.readFile(promptPath, "utf8");
}

async function assessWithGemini(input: { transcript: string; systemInstructions: string; }): Promise<string> {
  const { transcript, systemInstructions } = input;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY missing");

  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", systemInstruction: systemInstructions });
  const result = await model.generateContent(transcript);
  return result.response.text();
}
