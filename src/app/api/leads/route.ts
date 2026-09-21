import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { sendWhatsAppLeadNotification } from "@/lib/whatsapp";

const leadsFilePath = path.join(process.cwd(), "src/data/leads.json");

function getLeads() {
  try {
    if (!fs.existsSync(leadsFilePath)) {
      fs.writeFileSync(leadsFilePath, JSON.stringify([], null, 2), "utf-8");
      return [];
    }
    const data = fs.readFileSync(leadsFilePath, "utf-8");
    return JSON.parse(data || "[]");
  } catch (err) {
    console.error("Error reading leads:", err);
    return [];
  }
}

function saveLeads(leads: any[]) {
  fs.writeFileSync(leadsFilePath, JSON.stringify(leads, null, 2), "utf-8");
}

export async function GET() {
  const leads = getLeads();
  return NextResponse.json(leads, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

const PABBLY_WEBHOOK_URL =
  process.env.WHATSAPP_WEBHOOK_URL ||
  "https://connect.pabbly.com/webhook-listener/webhook/IjU3NjMwNTZmMDYzMDA0MzI1MjY4NTUzNCI_3D_pc/IjU3NjcwNTY4MDYzMzA0M2M1MjZkNTUzNzUxMzci_pc";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name || !body.phone) {
      return NextResponse.json(
        { error: "Name and Phone / WhatsApp number are required" },
        { status: 400 }
      );
    }

    const leads = getLeads();

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const clientWhatsAppNumber = "919540681934";
    const clientWhatsAppDisplay = "+91 95406 81934";

    const istTime =
      new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST";

    const formattedLeadText = [
      "🔥 *NEW DJ G SPARK LEAD / PASS RESERVATION* 🔥",
      "━━━━━━━━━━━━━━━━━━━━━━━━━",
      `👤 *Customer Name:* ${body.name.trim()}`,
      `📱 *Phone / WhatsApp:* ${body.phone.trim()}`,
      body.email ? `✉️ *Email:* ${body.email.trim()}` : "",
      body.type ? `📌 *Type:* ${body.type.replace(/_/g, " ").toUpperCase()}` : "",
      body.eventTitle ? `🎟️ *Event:* ${body.eventTitle}` : "",
      body.eventCity ? `📍 *City / Venue:* ${body.eventCity}` : "",
      body.eventDate ? `📅 *Date:* ${body.eventDate}` : "",
      body.tier ? `⭐ *Pass Category:* ${body.tier}` : "",
      body.quantity ? `🔢 *Quantity:* ${body.quantity} Pass${Number(body.quantity) > 1 ? "es" : ""}` : "",
      body.totalPrice ? `💰 *Total / Price:* ${body.totalPrice}` : "",
      body.eventType ? `🎪 *Event Type:* ${body.eventType}` : "",
      body.location ? `📍 *Location:* ${body.location}` : "",
      body.budget ? `💵 *Budget:* ${body.budget}` : "",
      body.notes || body.message
        ? `📝 *Notes / Requirements:* ${(body.notes || body.message).trim()}`
        : "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━",
      `🕒 *Received At:* ${istTime}`,
      "⚡ *Source:* DJ G Spark Official Website",
    ]
      .filter(Boolean)
      .join("\n");

    const encodedText = encodeURIComponent(formattedLeadText);
    const clientWhatsAppUrl = `https://api.whatsapp.com/send?phone=${clientWhatsAppNumber}&text=${encodedText}`;
    const cleanCustomerPhone = body.phone.replace(/[^0-9]/g, "");
    const customerWhatsAppUrl = `https://api.whatsapp.com/send?phone=${cleanCustomerPhone}&text=${encodeURIComponent(
      `Hi ${body.name.trim()}, thank you for your interest in DJ G Spark passes for ${
        body.eventTitle || "our upcoming tour"
      }. Our concierge team is reviewing your request.`
    )}`;

    const newLead = {
      id: `LEAD-${Date.now().toString(36).toUpperCase()}-${randomSuffix}`,
      type: body.type || "pass_booking",
      name: body.name.trim(),
      phone: body.phone.trim(),
      email: body.email ? body.email.trim() : "",
      eventTitle: body.eventTitle || "",
      eventCity: body.eventCity || "",
      eventDate: body.eventDate || "",
      tier: body.tier || "Standard Pass",
      quantity: Number(body.quantity) || 1,
      totalPrice: body.totalPrice !== undefined ? body.totalPrice : 0,
      notes: body.notes || body.message || "",
      eventType: body.eventType || "",
      location: body.location || "",
      budget: body.budget || "",
      timestamp: new Date().toISOString(),
      dateIST: istTime,
      status: "new",
      clientRecipientWhatsApp: clientWhatsAppDisplay,
      whatsappDispatched: true,
      clientWhatsAppUrl,
      customerWhatsAppUrl,
      webhookStatus: "pending",
      whatsappDeliveryStatus: "pending",
      whatsappMessageId: "",
    };

    // Prepare complete webhook payload for Pabbly Connect (for automated WhatsApp dispatch)
    const webhookPayload = {
      event: "new_lead",
      leadId: newLead.id,
      type: newLead.type,
      name: newLead.name,
      phone: newLead.phone,
      cleanPhone: cleanCustomerPhone,
      email: newLead.email,
      eventTitle: newLead.eventTitle,
      eventCity: newLead.eventCity,
      eventDate: newLead.eventDate,
      tier: newLead.tier,
      quantity: newLead.quantity,
      totalPrice: newLead.totalPrice,
      notes: newLead.notes,
      eventType: newLead.eventType,
      location: newLead.location,
      budget: newLead.budget,
      timestamp: newLead.timestamp,
      dateIST: istTime,
      source: "DJ G Spark Official Website",
      clientWhatsAppRecipient: clientWhatsAppNumber,
      clientWhatsAppDisplay,
      clientWhatsAppUrl,
      customerWhatsAppUrl,
      whatsappMessage: formattedLeadText,
      // Root convenience properties for instant Pabbly mapping
      customer_name: newLead.name,
      customer_phone: newLead.phone,
      customer_email: newLead.email,
      event_name: newLead.eventTitle,
      event_city: newLead.eventCity,
      event_date: newLead.eventDate,
      pass_tier: newLead.tier,
      pass_quantity: newLead.quantity,
      total_price: newLead.totalPrice,
      user_message: newLead.notes,
    };

    // 1. Automatic dispatch to official Meta WhatsApp Cloud API
    try {
      const waResult = await sendWhatsAppLeadNotification({
        name: newLead.name,
        phone: newLead.phone,
        email: newLead.email,
        type: newLead.type,
        eventTitle: newLead.eventTitle,
        eventCity: newLead.eventCity,
        eventDate: newLead.eventDate,
        tier: newLead.tier,
        quantity: newLead.quantity,
        totalPrice: newLead.totalPrice,
        notes: newLead.notes,
        eventType: newLead.eventType,
        location: newLead.location,
        budget: newLead.budget,
      });

      newLead.whatsappDeliveryStatus = waResult.success ? "delivered" : "failed";
      if (waResult.messageId) {
        newLead.whatsappMessageId = waResult.messageId;
      }
      if (waResult.error) {
        (newLead as any).whatsappError = waResult.error;
      }
    } catch (waErr: any) {
      console.error("Meta WhatsApp Cloud API dispatch error:", waErr?.message || waErr);
      newLead.whatsappDeliveryStatus = "failed";
      (newLead as any).whatsappError = waErr?.message || "Unknown error";
    }

    // 2. Automatic dispatch to Pabbly Webhook (redundancy backup)
    try {
      const webhookRes = await fetch(PABBLY_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookPayload),
      });
      if (webhookRes.ok) {
        newLead.webhookStatus = "delivered";
      } else {
        newLead.webhookStatus = `http_${webhookRes.status}`;
      }
    } catch (e: any) {
      console.error("Pabbly WhatsApp webhook dispatch error:", e?.message || e);
      newLead.webhookStatus = "failed";
    }

    leads.unshift(newLead);
    saveLeads(leads);

    return NextResponse.json(
      {
        success: true,
        message: "Thank you! Lead received and dispatched.",
        lead: newLead,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Error saving lead:", err);
    return NextResponse.json(
      { error: "Failed to record lead: " + err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });
    }

    const leads = getLeads();
    const filtered = leads.filter((l: any) => l.id !== id);

    if (filtered.length === leads.length) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    saveLeads(filtered);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
