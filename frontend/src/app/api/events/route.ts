import { NextRequest, NextResponse } from "next/server";
import Event from "../../models/eventModel";
import { connectDB } from "@/app/lib/db";

export async function POST(request: NextRequest) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_TEST;
  try {
    await connectDB();

    const {
      name,
      image,
      description,
      organizer_name,
      event_type,
      event_category,
      location,
      schedule,
    } = await request.json();

    // Input validation
    if (
      !name ||
      !image ||
      !description ||
      !organizer_name ||
      !event_type ||
      // !event_category ||
      !location ||
      !schedule
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }


    // Create the event in the database
    const event = await Event.create({
      name,
      image,
      description,
      organizer_name,
      event_type,
      event_category: 'free',
      location,
      schedule,
    });

    // Generate the JSON link for the created event
    const jsonLink = `${baseUrl}events/${event._id}`;

    // Return the response with the JSON link and newly created event id
    return NextResponse.json({ id: event._id, link: jsonLink }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error creating event:", error.message);
      return NextResponse.json(
        { message: "Failed to create event" },
        { status: 500 }
      );
    } else {
      console.error("An unknown error occurred:", error);
      return NextResponse.json(
        { message: "An unknown error occurred" },
        { status: 500 }
      );
    }
  }
}

export async function GET() {
  try {
    const conn = await connectDB();
    // If DB is not configured, return an empty list to avoid 500s
    if (!conn) {
      return NextResponse.json({ events: [] }, { status: 200 });
    }
    const events = await Event.find({}).lean();
    return NextResponse.json({ events }, { status: 200 });
  } catch (error) {
    console.error("Error fetching events:", error);
    // Be resilient: return empty list rather than breaking the UX
    return NextResponse.json({ events: [] }, { status: 200 });
  }
}