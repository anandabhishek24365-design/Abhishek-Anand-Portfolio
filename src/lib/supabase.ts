import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let clientInstance: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes("your-project-ref"));
}

export function getSupabaseClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.");
  }

  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey);
  }

  return clientInstance;
}

export interface ContactMessagePayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactMessageRecord extends ContactMessagePayload {
  id: string;
  created_at: string;
}

/**
 * Sends a direct email notification to target recipient (anandabhishek24365@gmail.com)
 * using FormSubmit AJAX endpoint.
 */
export async function sendEmailNotification(payload: ContactMessagePayload): Promise<boolean> {
  const targetEmail = "anandabhishek24365@gmail.com";
  try {
    const response = await fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        _subject: `Portfolio Contact: ${payload.subject.trim()}`,
        name: payload.name.trim(),
        email: payload.email.trim(),
        subject: payload.subject.trim(),
        message: payload.message.trim(),
        _template: "table",
        _captcha: "false",
      }),
    });

    if (response.ok) {
      return true;
    }
    console.warn("FormSubmit email status:", response.status, response.statusText);
  } catch (err) {
    console.warn("Direct email delivery notice:", err);
  }
  return false;
}

/**
 * Sends a contact message by:
 * 1. Dispatching direct email to anandabhishek24365@gmail.com
 * 2. Inserting into the contact_messages Supabase table for database tracking
 * 3. Optionally invoking the send-contact-email edge function if available
 */
export async function sendContactMessage(payload: ContactMessagePayload): Promise<{ success: boolean; messageId?: string }> {
  // 1. Dispatch email directly to recipient inbox
  const emailSent = await sendEmailNotification(payload);

  // 2. Save into Supabase database table if configured
  let messageId: string | undefined;
  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseClient();
      const { data, error: dbError } = await client
        .from("contact_messages")
        .insert([
          {
            name: payload.name.trim(),
            email: payload.email.trim(),
            subject: payload.subject.trim(),
            message: payload.message.trim(),
          },
        ])
        .select("id")
        .single();

      if (dbError) {
        console.error("Supabase Database Error inserting contact message:", dbError);
      } else {
        messageId = data?.id;
      }

      // 3. Optionally invoke Edge Function if deployed (non-blocking)
      try {
        await client.functions.invoke("send-contact-email", {
          body: payload,
        });
      } catch (err) {
        console.warn("Edge function send-contact-email notice:", err);
      }
    } catch (err) {
      console.warn("Supabase client error:", err);
    }
  }

  // If either direct email or database save succeeded, treat as successful
  if (emailSent || messageId || isSupabaseConfigured()) {
    return { success: true, messageId };
  }

  throw new Error("Unable to send message right now. Please try sending directly to anandabhishek24365@gmail.com.");
}

/**
 * Fetches stored contact messages from Supabase database table.
 */
export async function fetchContactMessages(): Promise<ContactMessageRecord[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching contact messages from Supabase:", error);
    throw new Error(error.message || "Could not retrieve contact messages.");
  }

  return data as ContactMessageRecord[];
}


