"use client";

import { Button } from "@/components/ui/button";
import { useEventForm } from "@/hooks/useEventForm";
import { useCreateEvent } from "@/hooks/useCreateEvent";
import { getWalletClient } from "@/lib/chain";
import { Upload, Plus, X } from "lucide-react";
import Switch from "@/components/ui/switch";
import dynamic from "next/dynamic";
import { MdAddLocationAlt } from "react-icons/md";
import "react-quill/dist/quill.snow.css";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useIsLoggedIn, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import Link from "next/link";
import { useWalletClient } from "wagmi";
import { MdEventBusy } from "react-icons/md";
import { BsStars } from "react-icons/bs";
import axios from 'axios';

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
});

const Page = () => {
  const createEventMutation = useCreateEvent();
  const router = useRouter();
  const isLoggedIn = useIsLoggedIn();
  const { data: walletClient } = useWalletClient();
  const { primaryWallet } = useDynamicContext();
  const {
    formData,
    errors,
    touched,
    selectedImage,
    imageFile,
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
  } = useEventForm({
    onValidSubmit: async (data) => {
      const firstTicket = data.ticketTypes[0];
      let imageCid = "";

      try {
        // Upload image to IPFS
        if (imageFile) {
          toast.loading("Uploading image to IPFS...");
          const uploadFormData = new FormData();
          uploadFormData.append("file", imageFile);

          const response = await axios.post(
            "https://api.pinata.cloud/pinning/pinFileToIPFS",
            uploadFormData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
              },
            }
          );

          if (response.data && response.data.IpfsHash) {
            imageCid = response.data.IpfsHash;
            toast.dismiss();
            toast.success("Image uploaded to IPFS!");
            console.log("IPFS CID:", imageCid);
          } else {
            throw new Error("Failed to get IPFS hash from response");
          }
        } else {
          throw new Error("No image file selected");
        }

        // Create event with IPFS CID
        toast.loading("Creating event...");

        // Check wallet is connected
        let activeWalletClient = walletClient;

        if (!activeWalletClient && primaryWallet) {
          try {
            // @ts-ignore
            const provider = await (primaryWallet.connector as any).getWalletClient?.();
            if (provider) {
              // @ts-ignore
              activeWalletClient = provider;
            }
          } catch (e) {
            console.error("Failed to get wallet client from dynamic", e);
          }
        }

        if (!activeWalletClient) {
          throw new Error("Please connect your wallet first");
        }

        await createEventMutation.mutateAsync({
          name: data.eventName,
          image: imageCid,
          description: data.description,
          organizer_name: data.organizer,
          event_type: data.eventType,
          event_category: data.eventCategory,
          location: data.location,
          schedule: [],
          ticketName: firstTicket.name,
          ticketSymbol: "HIT",
          ticketPriceEth: data.isFree ? "0" : firstTicket.price,
          ticketQuantity: parseInt(firstTicket.quantity, 10),
          startDateIso: data.startDate,
          endDateIso: data.endDate,
          maxTicketsPerUser: 1,
          isRefundable: data.isRefundable,
          walletClient: activeWalletClient,
        });

        toast.dismiss();
        toast.success("Event created successfully!");
        router.push("/dashboard/organizer/event-analytics");
      } catch (err) {
        toast.dismiss();
        console.error("Error creating event:", err);
        if (err instanceof Error) {
          toast.error(err.message || "Failed to create event");
        } else {
          toast.error("Failed to create event");
        }
      }
    },
  });

  if (!isLoggedIn) {
    return (
      <div className="pb-24 relative min-h-[82vh] px-4 sm:px-6 md:px-8 lg:px-12 2xl:px-16 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-6 w-24 h-24 rounded-full bg-[#131939] border border-subsidiary flex items-center justify-center shadow-[0_0_40px_#131939]">
            <MdEventBusy size={38} className="text-white" />
          </div>
          <h2 className="text-white text-2xl font-semibold Aeonik-bold flex items-center justify-center gap-2">
            No access <BsStars className="text-indigo-300" />
          </h2>
          <p className="text-white/70 text-sm mt-2">Login to create your event.</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/organizer-login" className="inline-flex">
              <button className="px-4 py-2 rounded-full bg-white text-black font-medium hover:opacity-90 transition">
                Organizer login
              </button>
            </Link>
            <Link href="/attendee-login" className="inline-flex">
              <button className="px-4 py-2 rounded-full border border-white text-white font-medium hover:bg-white/10 transition">
                Attendee login
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6 mx-auto w-full max-w-[1200px] p-4 md:p-6 mb-14">
        {/* Left Column - Image and Location */}
        <div className="flex flex-col md:flex-row lg:flex-col gap-6 w-full lg:w-auto">
          <div className="gap-3 flex flex-col">
            <h3 className="text-lg font-bold text-white">Upload Image *</h3>
            <div
              className="h-64 w-full sm:w-64 md:h-80 md:w-80 relative cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <img
                src={selectedImage ?? "/upload-image.png"}
                alt="Upload preview"
                className="h-full w-full rounded-2xl object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-2xl flex flex-col items-center justify-center hover:bg-opacity-40 transition-all duration-200">
                <div className="bg-black rounded-full p-3 md:p-4">
                  <Upload className="text-white" size={20} />
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            {errors.eventImage && (
              <p className="text-red-400 text-sm">{errors.eventImage}</p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-bold text-white">Pick a Location</h3>
            <div
              className="h-64 w-full sm:w-64 md:h-80 md:w-80 relative cursor-pointer"
            // onClick={openLocationPicker}
            >
              <img
                src="/pick-location.png"
                alt="Location picker"
                className="h-full w-full rounded-2xl object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-2xl flex items-center justify-center hover:bg-opacity-40 transition-all duration-200">
                <div className="bg-black rounded-full p-3 md:p-4">
                  <MdAddLocationAlt className="text-white" size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Form Fields */}
        <div className="min-w-0 flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Event Name */}
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-bold text-white">Event Name *</h3>
            <input
              name="eventName"
              value={formData.eventName}
              onChange={handleInputChange}
              onBlur={() => handleInputBlur('eventName')}
              placeholder="Enter the name of your event"
              className={`bg-transparent border-[0.5px] ${errors.eventName && touched.eventName ? 'border-red-400' : 'border-white/60'
                } h-14 md:h-16 text-base md:text-lg p-4 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/80`}
            />
            {errors.eventName && touched.eventName && (
              <p className="text-red-400 text-sm">{errors.eventName}</p>
            )}
          </div>

          {/* Organizer's Name */}
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-bold text-white">Organizer's Name *</h3>
            <input
              name="organizer"
              value={formData.organizer}
              onChange={handleInputChange}
              onBlur={() => handleInputBlur('organizer')}
              placeholder="Enter the organizer's name"
              className={`bg-transparent border-[0.5px] ${errors.organizer && touched.organizer ? 'border-red-400' : 'border-white/60'
                } h-14 md:h-16 text-base md:text-lg p-4 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/80`}
            />
            {errors.organizer && touched.organizer && (
              <p className="text-red-400 text-sm">{errors.organizer}</p>
            )}
          </div>

          {/* Location */}
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-bold text-white">Location *</h3>
            <input
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              onBlur={() => handleInputBlur('location')}
              placeholder="Enter event location"
              className={`bg-transparent border-[0.5px] ${errors.location && touched.location ? 'border-red-400' : 'border-white/60'
                } h-14 md:h-16 text-base md:text-lg p-4 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/80`}
            />
            {errors.location && touched.location && (
              <p className="text-red-400 text-sm">{errors.location}</p>
            )}
          </div>

          {/* Start Date */}
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-bold text-white">Start Date *</h3>
            <input
              name="startDate"
              type="datetime-local"
              value={formData.startDate}
              onChange={handleInputChange}
              onBlur={() => handleInputBlur('startDate')}
              className={`bg-transparent border-[0.5px] ${errors.startDate && touched.startDate ? 'border-red-400' : 'border-white/60'
                } h-14 md:h-16 text-base md:text-lg p-4 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/80`}
            />
            {errors.startDate && touched.startDate && (
              <p className="text-red-400 text-sm">{errors.startDate}</p>
            )}
          </div>

          {/* Event Type */}
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-bold text-white">Event Type *</h3>
            <select
              name="eventType"
              value={formData.eventType}
              onChange={handleInputChange}
              onBlur={() => handleInputBlur('eventType')}
              className={`bg-transparent border-[0.5px] ${errors.eventType && touched.eventType ? 'border-red-400' : 'border-white/60'
                } h-14 md:h-16 text-base md:text-lg p-4 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/80 custom-select`}
            >
              <option value="" disabled className="text-white/60">
                Select event type
              </option>
              <option value="online" className="text-black">
                Online
              </option>
              <option value="physical" className="text-black">
                Physical
              </option>
            </select>
            {errors.eventType && touched.eventType && (
              <p className="text-red-400 text-sm">{errors.eventType}</p>
            )}
          </div>

          {/* End Date */}
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-bold text-white">End Date *</h3>
            <input
              name="endDate"
              type="datetime-local"
              value={formData.endDate}
              onChange={handleInputChange}
              onBlur={() => handleInputBlur('endDate')}
              className={`bg-transparent border-[0.5px] ${errors.endDate && touched.endDate ? 'border-red-400' : 'border-white/60'
                } h-14 md:h-16 text-base md:text-lg p-4 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/80`}
            />
            {errors.endDate && touched.endDate && (
              <p className="text-red-400 text-sm">{errors.endDate}</p>
            )}
          </div>

          {/* Ticket Types Section */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-white">Ticket Types *</h3>
              <button
                type="button"
                onClick={addTicketType}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors w-full sm:w-auto justify-center"
              >
                <Plus size={16} />
                Add Ticket Type
              </button>
            </div>

            {/* Toggles: Free / Refundable (Switch) */}

            {/* Toggles: Free / Refundable */}
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.isFree}
                  onCheckedChange={(val) => handleToggleChange("isFree", val)}
                  size="lg"
                  label="Free Event"
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.isRefundable}
                  onCheckedChange={(val) => handleToggleChange("isRefundable", val)}
                  size="lg"
                  label="Refundable"
                />
              </div>
            </div>

            {formData.ticketTypes.map((ticket) => (
              <div key={ticket.id} className="flex flex-col sm:flex-row gap-3">
                {/* Ticket Name Input */}
                <div className="flex-1">
                  <input
                    type="text"
                    value={ticket.name}
                    onChange={(e) =>
                      updateTicketType(ticket.id, "name", e.target.value)
                    }
                    onBlur={() => handleTicketBlur(ticket.id, "name")}
                    placeholder="Ticket name"
                    className={`w-full bg-transparent border-[0.5px] ${errors.ticketErrors?.[ticket.id]?.name && touched[`ticket_${ticket.id}_name`]
                        ? "border-red-400"
                        : "border-white/60"
                      } h-14 md:h-16 text-base md:text-lg p-4 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/80`}
                  />
                  {errors.ticketErrors?.[ticket.id]?.name && touched[`ticket_${ticket.id}_name`] && (
                    <p className="text-red-400 text-sm">{errors.ticketErrors[ticket.id].name}</p>
                  )}
                </div>

                {/* Ticket Price Input (hidden/disabled when free) */}
                {formData.isFree ? (
                  <div className="flex-1">
                    <div className="w-full h-14 md:h-16 flex items-center justify-center rounded-xl border-[0.5px] border-white/60 text-white bg-[#13193980]">
                      Free
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={ticket.price}
                      onChange={(e) =>
                        updateTicketType(ticket.id, "price", e.target.value)
                      }
                      onBlur={() => handleTicketBlur(ticket.id, "price")}
                      placeholder="Ticket price"
                      className={`w-full bg-transparent border-[0.5px] ${errors.ticketErrors?.[ticket.id]?.price && touched[`ticket_${ticket.id}_price`]
                          ? "border-red-400"
                          : "border-white/60"
                        } h-14 md:h-16 text-base md:text-lg p-4 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/80`}
                    />
                    {errors.ticketErrors?.[ticket.id]?.price && touched[`ticket_${ticket.id}_price`] && (
                      <p className="text-red-400 text-sm">{errors.ticketErrors[ticket.id].price}</p>
                    )}
                  </div>
                )}

                {/* Ticket Quantity Input */}
                <div className="flex-1">
                  <input
                    type="number"
                    min="1"
                    value={ticket.quantity}
                    onChange={(e) =>
                      updateTicketType(ticket.id, "quantity", e.target.value)
                    }
                    onBlur={() => handleTicketBlur(ticket.id, "quantity")}
                    placeholder="Quantity"
                    className={`w-full bg-transparent border-[0.5px] ${errors.ticketErrors?.[ticket.id]?.quantity && touched[`ticket_${ticket.id}_quantity`]
                        ? "border-red-400"
                        : "border-white/60"
                      } h-14 md:h-16 text-base md:text-lg p-4 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/80`}
                  />
                  {errors.ticketErrors?.[ticket.id]?.quantity && touched[`ticket_${ticket.id}_quantity`] && (
                    <p className="text-red-400 text-sm">{errors.ticketErrors[ticket.id].quantity}</p>
                  )}
                </div>

                {/* Remove Button */}
                {formData.ticketTypes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTicketType(ticket.id)}
                    className="flex items-center justify-center w-full sm:w-16 h-14 md:h-16 text-white/60 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            ))}

            {errors.ticketTypes && (
              <p className="text-red-400 text-sm">{errors.ticketTypes}</p>
            )}
          </div>

          {/* Event Description */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <h3 className="text-lg font-bold text-white">Event Description *</h3>
            <div
              className={`rounded-xl overflow-hidden border-[0.5px] ${errors.description && touched.description ? "border-red-400" : "border-white/60"
                } focus-within:ring-2 focus-within:ring-white/80`}
            >
              <ReactQuill
                value={formData.description}
                onChange={handleDescriptionChange}
                onBlur={() => handleInputBlur("description")}
                placeholder="Enter a brief description of the event"
                className="bg-transparent text-white h-48 md:h-64"
                theme="snow"
              />
            </div>
            {errors.description && touched.description && (
              <p className="text-red-400 text-sm">{errors.description}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 flex flex-col gap-3">
            {(() => {
              const plain = formData.description.replace(/<[^>]*>/g, "").trim();
              const hasTicket = formData.ticketTypes.some((t) => {
                const qtyOk = parseInt(t.quantity) > 0;
                const priceOk = formData.isFree ? true : parseFloat(t.price) > 0;
                return t.name.trim() && qtyOk && priceOk;
              });
              const start = formData.startDate ? new Date(formData.startDate) : null;
              const end = formData.endDate ? new Date(formData.endDate) : null;
              const now = new Date();
              const datesOk = Boolean(start && end && start >= now && end > start);
              const hasRequired = Boolean(
                formData.eventName.trim().length >= 3 &&
                formData.organizer.trim() &&
                formData.location.trim() &&
                formData.eventType &&
                formData.eventImage &&
                plain.length >= 10 &&
                datesOk &&
                hasTicket
              );
              const canCreate = hasRequired && !createEventMutation.isPending;
              return (
                <Button
                  onClick={handleSubmit}
                  className={`p-4 md:p-6 text-white font-bold text-base md:text-lg transition-all duration-200 ${canCreate
                      ? "bg-subsidiary hover:bg-subsidiary/80 hover:scale-105 cursor-pointer"
                      : "bg-gray-600 cursor-not-allowed opacity-50"
                    }`}
                  disabled={!canCreate}
                >
                  {createEventMutation.isPending ? "Creating..." : "Create Event"}
                </Button>
              );
            })()}
          </div>
        </div>

        {/* Custom styles for ReactQuill and Select */}
        <style jsx global>{`
        .quill {
          background: none;
        }
        .ql-container {
          background: transparent;
          border: none !important;
          color: white;
          font-size: 1rem;
          padding: 0.5rem;
          border-radius: 0 0 0.5rem 0.5rem;
          height: calc(100% - 2.5rem);
        }
        .ql-editor {
          color: white !important;
          font-size: 1rem;
        }
        .ql-editor.ql-blank::before {
          color: rgba(255, 255, 255, 0.6) !important;
          opacity: 1 !important;
          font-style: normal !important;
        }
        .ql-toolbar {
          border: none !important;
          border-bottom: 0.5px solid rgba(255, 255, 255, 0.6) !important;
          border-radius: 0.5rem 0.5rem 0 0;
          padding: 0.5rem !important;
        }
        .ql-toolbar .ql-formats {
          margin-right: 8px;
        }
        .ql-toolbar .ql-formats button {
          color: white !important;
          width: 24px;
          height: 24px;
        }
        .ql-toolbar .ql-formats button:hover,
        .ql-toolbar .ql-formats button.ql-active {
          color: #fff !important;
        }
        .ql-toolbar .ql-formats .ql-stroke {
          stroke: white !important;
        }
        .ql-toolbar .ql-formats .ql-fill {
          fill: white !important;
        }
        .ql-toolbar .ql-formats .ql-picker-label {
          color: white !important;
        }
        .ql-toolbar .ql-formats .ql-picker-options {
          background: #333 !important;
          color: white !important;
        }

        /* Custom select styling for chevron-down */
        .custom-select {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.6)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 1rem;
          padding-right: 2.5rem;
        }
        .custom-select option {
          color: black;
          background: #333;
        }

        @media (max-width: 640px) {
          .ql-toolbar .ql-formats {
            margin-right: 4px;
          }
          .ql-toolbar .ql-formats button {
            width: 20px;
            height: 20px;
          }
        }
      `}</style>
      </div>

      {/* Location Picker Modal */}
      {showLocationPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Pick a Location</h2>
              <button
                // onClick={closeLocationPicker}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Search/Input Location */}
              <div>
                <label className="block text-white mb-2 font-medium">
                  Search or Enter Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => {
                    handleInputChange(e);
                  }}
                  name="location"
                  placeholder="Enter location address"
                  className="w-full bg-transparent border border-white/60 h-14 text-lg p-4 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/80"
                />
              </div>

              {/* Map Placeholder - Replace with actual map component */}
              <div className="h-96 bg-gray-800 rounded-xl border border-white/20 flex items-center justify-center relative overflow-hidden">
                <img
                  src="/pick-location.png"
                  alt="Map placeholder"
                  className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60">
                  <MdAddLocationAlt size={48} className="mb-2" />
                  <p className="text-center">
                    Map integration coming soon
                    <br />
                    <span className="text-sm">
                      Enter location manually above
                    </span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  // onClick={closeLocationPicker}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white"
                >
                  Cancel
                </Button>
                <Button
                  // onClick={() => selectLocation(formData.location)}
                  className="flex-1 bg-subsidiary hover:bg-subsidiary/80 text-white"
                  disabled={!formData.location.trim()}
                >
                  Confirm Location
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Page;