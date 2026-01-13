import { EventFormData } from "@/hooks/useEventForm";

export interface CreateEventPayload {
  name: string;
  image: string;
  description: string;
  organizer_name: string;
  event_type: string;
  event_category?: string;
  location: string;
  start_date: string;
  end_date: string;
  ticket_types: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
}

export interface CreateEventResponse {
  message: string;
  event: {
    id: string;
    name: string;
    link: string;
  };
}

export interface Event {
  _id: string;
  name: string;
  image: string;
  description: string;
  organizer_name: string;
  event_type: string;
  event_category?: string;
  location: string;
  start_date: string;
  end_date: string;
  ticket_types: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  schedule?: Array<{
    start_time: string;
    end_time: string;
    activity: string;
    description: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface GetEventsResponse {
  message: string;
  events: Event[];
  count: number;
}

// Helper function to convert date string to epoch timestamp (seconds)
export const dateToEpoch = (dateString: string): number => {
  return Math.floor(new Date(dateString).getTime() / 1000);
};

// Helper function to convert epoch timestamp to date
export const epochToDate = (epoch: number): Date => {
  return new Date(epoch * 1000);
};

export const createEvent = async (
  formData: EventFormData
): Promise<CreateEventResponse> => {
  // Transform form data to match API payload
  const payload: CreateEventPayload = {
    name: formData.eventName,
    image: formData.eventImage,
    description: formData.description,
    organizer_name: formData.organizer,
    event_type: formData.eventType,
    event_category: formData.eventCategory || undefined,
    location: formData.location,
    start_date: formData.startDate,
    end_date: formData.endDate,
    ticket_types: formData.ticketTypes.map((ticket) => ({
      name: ticket.name,
      price: parseFloat(ticket.price),
      quantity: parseInt(ticket.quantity),
    })),
  };

  const response = await fetch("/api/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create event");
  }

  return response.json();
};

export const fetchEvents = async (): Promise<GetEventsResponse> => {
  const response = await fetch("/api/events", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch events");
  }

  return response.json();
};
