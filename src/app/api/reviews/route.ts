import { NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/serverData";
import { ReviewItem } from "@/types";

// Sanitize string to prevent XSS / script injection
function sanitizeString(str: unknown, maxLength: number): string {
  if (typeof str !== "string") return "";
  return str
    .replace(/<[^>]*>?/gm, "") // Strip HTML tags
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .trim()
    .slice(0, maxLength);
}

// Generate initials from name (e.g. "Rohit Verma" -> "RV")
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Public GET: returns ONLY approved reviews (optionally filtered by articleSlug or eventSlug)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const articleSlug = searchParams.get("articleSlug");
    const eventSlug = searchParams.get("eventSlug");

    const reviews = await readJsonFile<ReviewItem[]>("reviews.json");
    const allApproved = (reviews || []).filter((r) => r.status === "approved");

    if (articleSlug) {
      // Filter reviews specific to this article
      const articleReviews = allApproved.filter(
        (r) => r.targetType === "article" && r.articleSlug === articleSlug
      );

      const total = articleReviews.length;
      const sumRatings = articleReviews.reduce((acc, curr) => acc + (curr.rating || 5), 0);
      const averageRating = total > 0 ? Number((sumRatings / total).toFixed(1)) : 5.0;

      const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      articleReviews.forEach((r) => {
        const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
        breakdown[star] = (breakdown[star] || 0) + 1;
      });

      return NextResponse.json(
        {
          success: true,
          reviews: articleReviews,
          stats: {
            total,
            averageRating,
            breakdown,
          },
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-store, max-age=0",
          },
        }
      );
    }

    if (eventSlug) {
      // Filter reviews specific to this event
      const eventReviews = allApproved.filter(
        (r) =>
          r.targetType === "event" &&
          (r.eventSlug === eventSlug ||
            (r.event && r.event.toLowerCase().includes(eventSlug.toLowerCase())))
      );

      const total = eventReviews.length;
      const sumRatings = eventReviews.reduce((acc, curr) => acc + (curr.rating || 5), 0);
      const averageRating = total > 0 ? Number((sumRatings / total).toFixed(1)) : 5.0;

      const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      eventReviews.forEach((r) => {
        const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
        breakdown[star] = (breakdown[star] || 0) + 1;
      });

      return NextResponse.json(
        {
          success: true,
          reviews: eventReviews,
          stats: {
            total,
            averageRating,
            breakdown,
          },
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-store, max-age=0",
          },
        }
      );
    }

    // Default: Return event / general approved reviews for homepage
    const generalApproved = allApproved.filter((r) => r.targetType !== "article");

    return NextResponse.json(
      { success: true, reviews: generalApproved },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// Public POST: Fans/Readers submit review for moderation
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const rawName = body.name;
    const rawQuote = body.quote || body.review;
    const rawRating = Number(body.rating);
    const rawEmail = body.email || body.userEmail;
    const rawRole = body.role;
    const rawOrg = body.organization || "";
    const isArticleReview = body.targetType === "article" || Boolean(body.articleSlug);
    const rawArticleSlug = body.articleSlug;
    const rawArticleTitle = body.articleTitle;
    const rawEventId = body.eventId;
    const rawEventSlug = body.eventSlug;
    const rawEventTitle = body.eventTitle || body.event;
    const rawEvent = rawEventTitle || (isArticleReview ? rawArticleTitle || "Article Reader" : "DJ G Spark Live Tour");

    if (!rawName || typeof rawName !== "string" || rawName.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Name must be at least 2 characters." },
        { status: 400 }
      );
    }

    if (!rawQuote || typeof rawQuote !== "string" || rawQuote.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: "Review text must be at least 10 characters." },
        { status: 400 }
      );
    }

    if (!rawRating || isNaN(rawRating) || rawRating < 1 || rawRating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be between 1 and 5 stars." },
        { status: 400 }
      );
    }

    // Sanitize fields (XSS defense)
    const sanitizedName = sanitizeString(rawName, 60);
    const sanitizedEmail = rawEmail ? sanitizeString(rawEmail, 100) : undefined;
    const sanitizedQuote = sanitizeString(rawQuote, 800);
    const sanitizedRole = sanitizeString(rawRole, 60) || (isArticleReview ? "Chronicle Reader" : "Concert Attendee");
    const sanitizedEvent = sanitizeString(rawEvent, 100);
    const sanitizedOrg = sanitizeString(rawOrg, 80);
    const sanitizedArticleSlug = isArticleReview ? sanitizeString(rawArticleSlug, 100) : undefined;
    const sanitizedArticleTitle = isArticleReview ? sanitizeString(rawArticleTitle, 150) : undefined;
    const sanitizedEventId = rawEventId ? sanitizeString(rawEventId, 80) : undefined;
    const sanitizedEventSlug = rawEventSlug ? sanitizeString(rawEventSlug, 100) : undefined;
    const sanitizedEventTitle = rawEventTitle ? sanitizeString(rawEventTitle, 150) : undefined;

    const now = new Date();
    const dateFormatted = now.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).toUpperCase();

    // Determine category and badge
    let category: "promoter" | "critic" | "fan" | "reader" | "attendee" = isArticleReview ? "reader" : "attendee";
    const roleLower = sanitizedRole.toLowerCase();
    if (roleLower.includes("promoter") || roleLower.includes("director") || roleLower.includes("organizer")) {
      category = "promoter";
    } else if (roleLower.includes("critic") || roleLower.includes("editor") || roleLower.includes("press")) {
      category = "critic";
    }

    const badge = isArticleReview
      ? "ARTICLE READER"
      : category === "promoter"
      ? "PROMOTER REVIEW"
      : category === "critic"
      ? "PRESS REVIEW"
      : "VERIFIED ATTENDEE";

    const badgeColor = isArticleReview
      ? "text-[#00B4D8] bg-[#00E5FF]/10 border-[#00E5FF]/30"
      : category === "promoter"
      ? "text-[#00B4D8] bg-[#00E5FF]/10 border-[#00E5FF]/30"
      : category === "critic"
      ? "text-[#00E5FF] bg-[#00E5FF]/10 border-[#00E5FF]/30"
      : "text-[#10B981] bg-[#10B981]/10 border-[#10B981]/30";

    const newReview: ReviewItem = {
      id: `r-${Date.now()}`,
      name: sanitizedName,
      userEmail: sanitizedEmail,
      role: sanitizedRole,
      organization: sanitizedOrg || undefined,
      initials: getInitials(sanitizedName),
      rating: Math.round(rawRating),
      badge,
      badgeColor,
      event: sanitizedEvent,
      quote: sanitizedQuote,
      date: dateFormatted,
      category,
      status: "pending", // Strictly pending - admin approval required
      createdAt: now.toISOString(),
      targetType: isArticleReview ? "article" : "event",
      articleSlug: sanitizedArticleSlug,
      articleTitle: sanitizedArticleTitle,
      eventId: sanitizedEventId,
      eventSlug: sanitizedEventSlug,
      eventTitle: sanitizedEventTitle,
    };

    const existingReviews = await readJsonFile<ReviewItem[]>("reviews.json");
    const updated = [newReview, ...(existingReviews || [])];
    await writeJsonFile("reviews.json", updated);

    return NextResponse.json(
      {
        success: true,
        message: "Your review has been submitted for moderation! DJ G SPARK management will verify and publish it to the website.",
        reviewId: newReview.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit review." },
      { status: 500 }
    );
  }
}

