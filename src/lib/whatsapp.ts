/**
 * WhatsApp Cloud API Service
 * Official integration using Meta Graph API v25.0
 * Strictly server-side only: tokens and API calls are never exposed to the client.
 */

interface LeadPayload {
  name: string;
  phone: string;
  email?: string;
  type?: string;
  eventTitle?: string;
  eventCity?: string;
  eventDate?: string;
  tier?: string;
  quantity?: number | string;
  totalPrice?: number | string;
  notes?: string;
  eventType?: string;
  location?: string;
  budget?: string;
}

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  skipped?: boolean;
}

// In-memory deduplication cache: prevents duplicate messages from double-clicks within 5 seconds
const recentSubmissions = new Map<string, number>();
const DEDUP_WINDOW_MS = 5000;

function cleanOldSubmissions() {
  const now = Date.now();
  for (const [key, timestamp] of recentSubmissions.entries()) {
    if (now - timestamp > DEDUP_WINDOW_MS) {
      recentSubmissions.delete(key);
    }
  }
}

/**
 * Sends a WhatsApp lead notification to the client's registered number using the Meta Cloud API.
 * Uses template "website_lead_aj" (or configured fallback).
 */
export async function sendWhatsAppLeadNotification(
  lead: LeadPayload
): Promise<WhatsAppSendResult> {
  const accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId =
    process.env.META_WHATSAPP_PHONE_NUMBER_ID || "1240253442514864";
  const recipientNumber =
    process.env.META_WHATSAPP_RECIPIENT_NUMBER || "919540681934";
  const apiVersion = process.env.META_WHATSAPP_API_VERSION || "v25.0";
  const templateName =
    process.env.META_WHATSAPP_TEMPLATE_NAME || "website_lead_aj";
  const templateLang = process.env.META_WHATSAPP_TEMPLATE_LANG || "en";

  if (!accessToken) {
    console.warn(
      "[WhatsApp Cloud API] Skipping dispatch: META_WHATSAPP_ACCESS_TOKEN is not configured."
    );
    return {
      success: false,
      error: "META_WHATSAPP_ACCESS_TOKEN is not configured",
      skipped: true,
    };
  }

  // 1. Deduplication check
  cleanOldSubmissions();
  const dedupKey = `${lead.phone?.trim()}_${lead.name?.trim()}_${lead.type || ""}_${lead.eventTitle || ""}`;
  const lastSent = recentSubmissions.get(dedupKey);
  const now = Date.now();

  if (lastSent && now - lastSent < DEDUP_WINDOW_MS) {
    console.log(
      `[WhatsApp Cloud API] Duplicate lead submission detected within 5s for ${lead.phone}. Skipping duplicate dispatch.`
    );
    return {
      success: true,
      skipped: true,
    };
  }
  recentSubmissions.set(dedupKey, now);

  // 2. Strict 7-parameter mapping for template "website_lead_aj"
  // Meta Cloud API strictly rejects empty strings ("") in template body parameters.
  // Every parameter has a guaranteed fallback.
  const fullName = lead.name?.trim() || "Guest";
  const phoneNumber = lead.phone?.trim() || "Not Provided";
  const email = lead.email?.trim() || "Not Provided";

  const category =
    lead.tier ||
    lead.eventType ||
    (lead.type ? lead.type.replace(/_/g, " ").toUpperCase() : "Pass Reservation");

  const quantityNum = Number(lead.quantity) || 1;
  const passes = `${quantityNum} Pass${quantityNum > 1 ? "es" : ""}`;

  const totalPrice =
    lead.totalPrice !== undefined && lead.totalPrice !== null && lead.totalPrice !== ""
      ? String(lead.totalPrice)
      : lead.budget
      ? String(lead.budget)
      : "On Request";

  const eventName =
    lead.eventTitle || lead.location || "Dj G-spark World Tour";

  const templateParameters = [
    { type: "text", text: fullName },       // {{1}} Full Name
    { type: "text", text: phoneNumber },    // {{2}} Phone Number
    { type: "text", text: email },          // {{3}} Email
    { type: "text", text: category },       // {{4}} Category
    { type: "text", text: passes },         // {{5}} Passes
    { type: "text", text: totalPrice },     // {{6}} Total Price
    { type: "text", text: eventName },      // {{7}} Event Name
  ];

  const payload = {
    messaging_product: "whatsapp",
    to: recipientNumber,
    type: "template",
    template: {
      name: templateName,
      language: {
        code: templateLang,
      },
      components: [
        {
          type: "body",
          parameters: templateParameters,
        },
      ],
    },
  };

  const endpoint = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      const errorMsg =
        data.error?.error_data?.details ||
        data.error?.message ||
        `HTTP ${res.status} error`;

      console.error(
        `[WhatsApp Cloud API] Failed to send template "${templateName}" (${templateLang}):`,
        errorMsg
      );

      return {
        success: false,
        error: errorMsg,
      };
    }

    const messageId = data.messages?.[0]?.id;
    console.log(
      `[WhatsApp Cloud API] Successfully dispatched template "${templateName}" to ${recipientNumber}. Message ID: ${messageId}`
    );

    return {
      success: true,
      messageId,
    };
  } catch (err: any) {
    console.error("[WhatsApp Cloud API] Network / dispatch exception:", err?.message || err);
    return {
      success: false,
      error: err?.message || "Network error",
    };
  }
}
