import { NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/serverData";
import { ReviewItem } from "@/types";

// Admin GET: Returns all reviews with counts
export async function GET() {
  try {
    const reviews = await readJsonFile<ReviewItem[]>("reviews.json");
    const all = reviews || [];
    const counts = {
      total: all.length,
      pending: all.filter((r) => r.status === "pending").length,
      approved: all.filter((r) => r.status === "approved").length,
      rejected: all.filter((r) => r.status === "rejected").length,
    };

    return NextResponse.json(
      { success: true, reviews: all, counts },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching admin reviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// Admin PUT: Moderate review status (approve or reject)
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !["approved", "rejected", "pending"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid review ID or status" },
        { status: 400 }
      );
    }

    const reviews = await readJsonFile<ReviewItem[]>("reviews.json");
    const index = (reviews || []).findIndex((r) => r.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 }
      );
    }

    reviews[index].status = status;
    await writeJsonFile("reviews.json", reviews);

    return NextResponse.json({
      success: true,
      message: `Review marked as ${status}`,
      review: reviews[index],
    });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update review" },
      { status: 500 }
    );
  }
}

// Admin DELETE: Remove review permanently
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing review ID" },
        { status: 400 }
      );
    }

    const reviews = await readJsonFile<ReviewItem[]>("reviews.json");
    const updated = (reviews || []).filter((r) => r.id !== id);

    await writeJsonFile("reviews.json", updated);

    return NextResponse.json({
      success: true,
      message: "Review permanently deleted",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete review" },
      { status: 500 }
    );
  }
}

