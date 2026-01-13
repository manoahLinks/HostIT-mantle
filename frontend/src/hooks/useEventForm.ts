// useEventForm.ts
import { useRef, useState } from "react";
import { createEvent } from "@/lib/eventApi";
import { useRouter } from "next/navigation";
import { prepareContractTicketData } from "@/lib/contractService";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { getAddress } from "viem";
import { toast } from "sonner";
import ticketFactory from "../abis/TicketFactoryFacet.json";

export type TicketType = {
  id: number;
  name: string;
  price: string;
  quantity: string;
};

export type EventFormData = {
  eventName: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  organizer: string;
  eventType: string;
  eventCategory: string;
  ticketTypes: TicketType[];
  eventImage: string;
  isFree: boolean;
  isRefundable: boolean;
};

export type ValidationErrors = {
  eventName?: string;
  organizer?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  eventType?: string;
  description?: string;
  ticketTypes?: string;
  eventImage?: string;
  ticketErrors?: { [key: number]: { name?: string; price?: string; quantity?: string } };
};

export const useEventForm = (opts?: { onValidSubmit?: (data: EventFormData) => void }) => {
  const [formData, setFormData] = useState<EventFormData>({
    eventName: "",
    startDate: "",
    endDate: "",
    description: "",
    organizer: "",
    eventCategory: "",
    ticketTypes: [{ id: 1, name: "", price: "", quantity: "" }],
    location: "",
    eventImage: "",
    eventType: "",
    isFree: false,
    isRefundable: false,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isCreatingContract, setIsCreatingContract] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Watch for contract transaction status
  const { isLoading: isConfirming, isSuccess: isContractSuccess } = useWaitForTransactionReceipt({
    // hash: contractTxHash,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleInputBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    // Validate only the blurred field
    const newErrors = validateForm();
    setErrors((prev) => ({ ...prev, [field]: newErrors[field as keyof ValidationErrors] }));
  };

  const handleDescriptionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, description: value }));
    if (errors.description) {
      setErrors((prev) => ({ ...prev, description: undefined }));
    }
  };

  const handleToggleChange = (field: "isFree" | "isRefundable", value: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear any ticket price errors when toggling free on
    if (field === "isFree" && value && errors.ticketErrors) {
      const cleared: { [key: number]: { name?: string; price?: string; quantity?: string } } = {};
      for (const [idStr, terr] of Object.entries(errors.ticketErrors)) {
        const id = Number(idStr);
        cleared[id] = { ...terr, price: undefined };
      }
      setErrors((prev) => ({ ...prev, ticketErrors: cleared }));
      // Also clear general ticketTypes error since price is no longer required when free
      if (errors.ticketTypes) {
        setErrors((prev) => ({ ...prev, ticketTypes: undefined }));
      }
    }
  };

  const handleTicketBlur = (id: number, field: keyof TicketType) => {
    setTouched((prev) => ({ ...prev, [`ticket_${id}_${field}`]: true }));
    // Validate ticket fields
    const newErrors = validateForm();
    setErrors((prev) => ({ ...prev, ticketErrors: newErrors.ticketErrors }));
  };

  const addTicketType = () => {
    const newId = Math.max(...formData.ticketTypes.map((t) => t.id), 0) + 1;
    setFormData((prev) => ({
      ...prev,
      ticketTypes: [
        ...prev.ticketTypes,
        { id: newId, name: "", price: "", quantity: "" },
      ],
    }));
    // Clear general ticketTypes error when adding a new ticket
    if (errors.ticketTypes) {
      setErrors((prev) => ({ ...prev, ticketTypes: undefined }));
    }
  };

  const removeTicketType = (id: number) => {
    if (formData.ticketTypes.length > 1) {
      setFormData((prev) => ({
        ...prev,
        ticketTypes: prev.ticketTypes.filter((ticket) => ticket.id !== id),
      }));
      // Clear ticket-specific errors for removed ticket
      setErrors((prev) => {
        const newTicketErrors = { ...prev.ticketErrors };
        delete newTicketErrors[id];
        return { ...prev, ticketErrors: newTicketErrors };
      });
    }
  };

  const updateTicketType = (
    id: number,
    field: keyof TicketType,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      ticketTypes: prev.ticketTypes.map((ticket) =>
        ticket.id === id ? { ...ticket, [field]: value } : ticket
      ),
    }));

    // Clear ticket-specific error for the updated field
    // Fix for Error 1: Exclude 'id' from the field check since it's not in the error object
    if (field !== 'id' && errors.ticketErrors?.[id]?.[field as keyof Omit<TicketType, 'id'>]) {
      setErrors((prev) => {
        const newTicketErrors = { ...prev.ticketErrors };
        if (newTicketErrors[id]) {
          newTicketErrors[id] = { 
            ...newTicketErrors[id], 
            [field as keyof Omit<TicketType, 'id'>]: undefined 
          };
        }
        return { ...prev, ticketErrors: newTicketErrors };
      });
    }
    // Clear general ticketTypes error
    if (errors.ticketTypes) {
      setErrors((prev) => ({ ...prev, ticketTypes: undefined }));
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Fix for Error 2: Add null check for e.target
        if (e.target?.result && typeof e.target.result === "string") {
          setSelectedImage(e.target.result);
          setFormData((prev) => ({ ...prev, eventImage: e.target!.result as string}));
          if (errors.eventImage) {
            setErrors((prev) => ({ ...prev, eventImage: undefined }));
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const openLocationPicker = () => {
    setShowLocationPicker(true);
  };

  const closeLocationPicker = () => {
    setShowLocationPicker(false);
  };

  const selectLocation = (location: string) => {
    setFormData((prev) => ({ ...prev, location }));
    if (errors.location) {
      setErrors((prev) => ({ ...prev, location: undefined }));
    }
    setShowLocationPicker(false);
  };

  const validateForm = (): ValidationErrors => {
    const newErrors: ValidationErrors = {};

    // Event name validation
    if (!formData.eventName.trim()) {
      newErrors.eventName = "Event name is required";
    } else if (formData.eventName.trim().length < 3) {
      newErrors.eventName = "Event name must be at least 3 characters";
    }

    // Organizer validation
    if (!formData.organizer.trim()) {
      newErrors.organizer = "Organizer name is required";
    }

    // Location validation
    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    // Event type validation
    if (!formData.eventType) {
      newErrors.eventType = "Event type is required";
    }

    // Date validation
    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const now = new Date();

      if (startDate < now) {
        newErrors.startDate = "Start date cannot be in the past";
      }

      if (endDate <= startDate) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    // Description validation
    const plainTextDescription = formData.description.replace(/<[^>]*>/g, "").trim();
    if (!plainTextDescription) {
      newErrors.description = "Event description is required";
    } else if (plainTextDescription.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    // Ticket types validation
    const ticketErrors: { [key: number]: { name?: string; price?: string; quantity?: string } } = {};
    let hasValidTicket = false;

    // First, check if there's at least one valid ticket (regardless of touched state)
    formData.ticketTypes.forEach((ticket) => {
      if (ticket.name.trim() && parseFloat(ticket.price) > 0 && parseInt(ticket.quantity) > 0) {
        hasValidTicket = true;
      }
    });

    // Then validate only touched tickets for showing error messages
    formData.ticketTypes.forEach((ticket) => {
      const ticketTouched = touched[`ticket_${ticket.id}_name`] || touched[`ticket_${ticket.id}_price`] || touched[`ticket_${ticket.id}_quantity`];
      if (!ticketTouched) return; // Skip validation for untouched tickets

      const ticketError: { name?: string; price?: string; quantity?: string } = {};

      if (!ticket.name.trim()) {
        ticketError.name = "Ticket name is required";
      }

      if (!formData.isFree) {
        if (!ticket.price.trim()) {
          ticketError.price = "Price is required";
        } else if (parseFloat(ticket.price) <= 0) {
          ticketError.price = "Price must be greater than 0";
        }
      }

      if (!ticket.quantity.trim()) {
        ticketError.quantity = "Quantity is required";
      } else if (parseInt(ticket.quantity) <= 0) {
        ticketError.quantity = "Quantity must be greater than 0";
      }

      if (formData.isFree) {
        if (ticket.name.trim() && parseInt(ticket.quantity) > 0) {
          hasValidTicket = true;
        }
      } else {
        if (ticket.name.trim() && parseFloat(ticket.price) > 0 && parseInt(ticket.quantity) > 0) {
          hasValidTicket = true;
        }
      }

      if (Object.keys(ticketError).length > 0) {
        ticketErrors[ticket.id] = ticketError;
      }
    });

    if (Object.keys(ticketErrors).length > 0) {
      newErrors.ticketErrors = ticketErrors;
    }

    if (!hasValidTicket) {
      newErrors.ticketTypes = formData.isFree
        ? "At least one valid ticket type is required (name, quantity > 0)"
        : "At least one valid ticket type is required (name, price > 0, quantity > 0)";
    }

    // Image validation
    if (!formData.eventImage) {
      newErrors.eventImage = "Event image is required";
    }

    return newErrors;
  };

  const hasErrors = (): boolean => {
    // Check for top-level errors
    if (errors.eventName || errors.organizer || errors.location ||
        errors.startDate || errors.endDate || errors.eventType ||
        errors.description || errors.eventImage || errors.ticketTypes) {
      return true;
    }

    // Check for ticket-specific errors
    if (errors.ticketErrors) {
      const hasTicketErrors = Object.values(errors.ticketErrors).some(
        ticketError => ticketError.name || ticketError.price || ticketError.quantity
      );
      if (hasTicketErrors) return true;
    }

    return false;
  };

  const isFormComplete = (): boolean => {
    // Check all required fields are filled
    if (!formData.eventName.trim()) return false;
    if (!formData.organizer.trim()) return false;
    if (!formData.location.trim()) return false;
    if (!formData.startDate) return false;
    if (!formData.endDate) return false;
    if (!formData.eventType) return false;
    if (!formData.eventImage) return false;

    // Check description has actual content (not just HTML tags)
    const plainTextDescription = formData.description.replace(/<[^>]*>/g, "").trim();
    if (!plainTextDescription) return false;

    // Check at least one ticket type is complete (has name, price > 0, quantity > 0)
    const hasCompleteTicket = formData.ticketTypes.some(
      ticket =>
        ticket.name.trim() !== "" &&
        ticket.price.trim() !== "" &&
        parseFloat(ticket.price) > 0 &&
        ticket.quantity.trim() !== "" &&
        parseInt(ticket.quantity) > 0
    );
    if (!hasCompleteTicket) return false;

    return true;
  };

  const handleSubmit = async () => {
    // Reset submission states
    setSubmitError(null);
    setSubmitSuccess(false);

    // Mark all fields as touched to show validation errors
    const allFields = ['eventName', 'organizer', 'location', 'startDate', 'endDate', 'eventType', 'description'];
    const newTouched: Record<string, boolean> = {};
    allFields.forEach(field => {
      newTouched[field] = true;
    });
    // Mark ticket fields as touched
    formData.ticketTypes.forEach((ticket) => {
      newTouched[`ticket_${ticket.id}_name`] = true;
      newTouched[`ticket_${ticket.id}_price`] = true;
      newTouched[`ticket_${ticket.id}_quantity`] = true;
    });
    setTouched(newTouched);

    // Validate entire form
    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      if (opts?.onValidSubmit) {
        opts.onValidSubmit(formData);
      } else {
        console.log('Form submitted:', formData);
      }
    }
  };

  return {
    formData,
    errors,
    touched,
    selectedImage,
    fileInputRef,
    showLocationPicker,
    isSubmitting,
    submitError,
    submitSuccess,
    // contractTxHash,
    isCreatingContract,
    isConfirming,
    isContractSuccess,
    handleInputChange,
    handleInputBlur,
    handleDescriptionChange,
    handleToggleChange,
    handleTicketBlur,
    addTicketType,
    removeTicketType,
    updateTicketType,
    handleFileSelect,
    handleSubmit,
    isFormComplete,
    hasErrors,
    openLocationPicker,
    closeLocationPicker,
    selectLocation,
  };
};