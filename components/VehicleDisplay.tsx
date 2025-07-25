"use client";
import React from "react";
import { useState } from "react";
import Image from "next/image";
import { useVehicleData } from "@/hooks/useVehicleData";

interface PhotoSection {
  label: string;
  id: string;
  imagePath: string;
  fallbackPath: string;
}

interface VehicleDisplayProps {
  vehicleId?: string;
}

export default function VehicleDisplay({
  vehicleId = "default-vehicle",
}: VehicleDisplayProps) {
  const { vehicleData, images, loading, error } = useVehicleData(vehicleId);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const openImageModal = (imageId: string) => {
    setSelectedImage(imageId);
    setIsModalOpen(true);
  };

  const closeImageModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
    resetZoom();
  };

  const resetZoom = () => {
    setZoom(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.5, 0.5));
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleImageError = (imageId: string) => {
    setImageErrors((prev) => ({ ...prev, [imageId]: true }));
  };

  // Handle keyboard events
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isModalOpen) {
        closeImageModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  // Fallback data when Airtable is not available
  const fallbackVehicleData = {
    "Vehicle ID": "MERC2023001",
    Year: 2023,
    Make: "Mercedes Benz",
    Model: "S580",
    Trim: "4MATIC",
    VIN: "W1K6G7GB1PA123456",
    Mileage: 10420,
    "Zip Code": "90210",
    "Exterior Color": "Obsidian Black",
    "Interior Color": "Macchiato Beige",
    "Vehicle Condition": "Excellent",
    "Tire Condition": "Medium Wear",
    "Add-ons": 'AMG Line Package, Ceramic Coating, 22" AMG Wheels',
    Status: "Active",
  };

  // Use Airtable data if available, otherwise use fallback
  const displayData = vehicleData || fallbackVehicleData;

  // Create photo sections with beautiful placeholder images
  const photoSections: PhotoSection[] = React.useMemo(() => {
    const imageTypes = [
      "Front",
      "Rear",
      "Driver Side",
      "Passenger Side",
      "Interior",
      "Dashboard",
      "Tires",
      "Window Sticker",
      "Add-Ons Damage",
    ];

    return imageTypes.map((type) => {
      // Try to get image from Airtable first
      const airtableImage = images.find((img) => img["Image Type"] === type);

      // Beautiful placeholder images matching the TRADELUX aesthetic
      const placeholderImages: Record<string, string> = {
        Front: "/images/placeholders/front-placeholder.png",
        Rear: "/images/placeholders/rear-placeholder.png",
        "Driver Side": "/images/placeholders/driver-side-placeholder.png",
        "Passenger Side": "/images/placeholders/passenger-side-placeholder.png",
        Interior: "/images/placeholders/interior-placeholder.png",
        Dashboard: "/images/placeholders/dashboard-placeholder.png",
        Tires: "/images/placeholders/tires-placeholder.png",
        "Window Sticker": "/images/placeholders/window-sticker-placeholder.png",
        "Add-Ons Damage": "/images/placeholders/damage-placeholder.png",
      };

      const imageId = type.toLowerCase().replace(/\s+/g, "-");
      const hasError = imageErrors[imageId];
      const airtableUrl = airtableImage?.["Image URL"];

      return {
        label: type,
        id: imageId,
        imagePath:
          hasError || !airtableUrl ? placeholderImages[type] : airtableUrl,
        fallbackPath: placeholderImages[type],
      };
    });
  }, [images, imageErrors]);

  const selectedImageData = photoSections.find(
    (section) => section.id === selectedImage
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-yellow-400 mb-2">TRADELUX</h2>
          <p className="text-gray-300">Loading vehicle information...</p>
        </div>
      </div>
    );
  }

  // Show error but continue with fallback data
  const showError = error && !vehicleData;

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-yellow-400 tracking-wider mb-4">
          TRADELUX
        </h1>
        {showError && (
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 max-w-md mx-auto mb-4">
            <p className="text-yellow-300 text-sm">
              ⚠️ Using demo data - Airtable connection unavailable
            </p>
          </div>
        )}
      </div>

      {/* Vehicle Specifications Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 mb-8 max-w-6xl mx-auto w-full">
        <div className="flex flex-col">
          <span className="text-yellow-400 text-sm mb-1">Year</span>
          <span className="text-white font-medium">{displayData.Year}</span>
        </div>

        <div className="flex flex-col">
          <span className="text-yellow-400 text-sm mb-1">Make</span>
          <span className="text-white font-medium">{displayData.Make}</span>
        </div>

        <div className="flex flex-col">
          <span className="text-yellow-400 text-sm mb-1">Model</span>
          <span className="text-white font-medium">{displayData.Model}</span>
        </div>

        <div className="flex flex-col">
          <span className="text-yellow-400 text-sm mb-1">VIN</span>
          <span className="text-white font-medium">{displayData.VIN}</span>
        </div>

        <div className="flex flex-col">
          <span className="text-yellow-400 text-sm mb-1">Mileage</span>
          <span className="text-white font-medium">
            {displayData.Mileage?.toLocaleString()}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-yellow-400 text-sm mb-1">Zip Code</span>
          <span className="text-white font-medium">
            {displayData["Zip Code"] || "—"}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-yellow-400 text-sm mb-1">Exterior Color</span>
          <span className="text-white font-medium">
            {displayData["Exterior Color"]}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-yellow-400 text-sm mb-1">Interior Color</span>
          <span className="text-white font-medium">
            {displayData["Interior Color"]}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-yellow-400 text-sm mb-1">
            Vehicle Condition
          </span>
          <span className="text-white font-medium">
            {displayData["Vehicle Condition"]}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-yellow-400 text-sm mb-1">Tire Condition</span>
          <span className="text-white font-medium">
            {displayData["Tire Condition"]}
          </span>
        </div>

        <div className="flex flex-col col-span-2">
          <span className="text-yellow-400 text-sm mb-1">Add-ons</span>
          <span className="text-white font-medium">
            {displayData["Add-ons"]}
          </span>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto w-full mb-8 flex-1">
        {photoSections.map((section) => (
          <div key={section.id} className="flex flex-col">
            <div
              className="aspect-square border-2 border-yellow-400 bg-black rounded-sm mb-2 flex items-center justify-center cursor-pointer hover:border-yellow-300 transition-colors duration-200 group overflow-hidden"
              onClick={() => openImageModal(section.id)}
            >
              <div className="w-full h-full relative group-hover:scale-105 transition-transform duration-200">
                <Image
                  src={section.imagePath || "/placeholder.svg"}
                  alt={`${displayData.Year} ${displayData.Make} ${displayData.Model} - ${section.label}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={section.id === "front"}
                  onError={() => handleImageError(section.id)}
                />
              </div>
            </div>
            <span className="text-yellow-400 text-sm text-center font-medium">
              {section.label}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center text-white text-sm max-w-4xl mx-auto">
        <p>
          This vehicle is currently being shopped through TRADELUX&apos;s
          private network.
        </p>
        <p className="mt-1">
          To submit an offer, reply to{" "}
          <a
            href="mailto:Pricing@tradelux.us?subject=Vehicle Offer - 2023 Mercedes Benz S580&body=Hello TRADELUX,%0D%0A%0D%0AI am interested in submitting an offer for the 2023 Mercedes Benz S580 (VIN: W1K6G7GB1PA123456).%0D%0A%0D%0AMy offer details:%0D%0A- Offer Amount: $%0D%0A- Financing: %0D%0A- Additional Comments: %0D%0A%0D%0APlease let me know if you need any additional information.%0D%0A%0D%0AThank you,%0D%0A[Your Name]"
            className="text-yellow-400 hover:text-yellow-300 transition-colors duration-200 underline decoration-yellow-400/50 hover:decoration-yellow-300 underline-offset-2"
          >
            Pricing@tradelux.us
          </a>{" "}
          or respond directly to the TRADELUX text notification.
        </p>
      </div>

      {/* Image Modal */}
      {isModalOpen && selectedImageData && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4"
          onClick={closeImageModal}
        >
          {/* Close Button - Fixed position */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              closeImageModal();
            }}
            className="fixed top-6 right-6 z-50 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full p-3 transition-all duration-200 hover:scale-110 border border-yellow-400/30 hover:border-yellow-400"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Zoom Controls */}
          <div className="fixed top-6 left-6 z-50 flex flex-col gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleZoomIn();
              }}
              disabled={zoom >= 3}
              className="bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full p-3 transition-all duration-200 hover:scale-110 border border-yellow-400/30 hover:border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Zoom in"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleZoomOut();
              }}
              disabled={zoom <= 0.5}
              className="bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full p-3 transition-all duration-200 hover:scale-110 border border-yellow-400/30 hover:border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Zoom out"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 12H6"
                />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                resetZoom();
              }}
              className="bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full p-3 transition-all duration-200 hover:scale-110 border border-yellow-400/30 hover:border-yellow-400"
              aria-label="Reset zoom"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>

          {/* Zoom Level Indicator */}
          <div className="fixed bottom-6 left-6 z-50 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg border border-yellow-400/30">
            <span className="text-sm text-yellow-400">
              Zoom: {Math.round(zoom * 100)}%
            </span>
          </div>

          <div
            className="relative w-auto h-auto max-w-[90vw] max-h-[80vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Image Container */}
            <div className="bg-black border-2 border-yellow-400 rounded-lg p-6 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
              <div
                className="relative bg-gray-900 rounded-lg mb-4 border border-yellow-400/30 overflow-hidden"
                style={{
                  cursor:
                    zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
                  width: "auto",
                  height: "auto",
                  maxWidth: "80vw",
                  maxHeight: "60vh",
                }}
              >
                <div
                  className="relative transition-transform duration-200 ease-out"
                  style={{
                    transform: `scale(${zoom}) translate(${
                      imagePosition.x / zoom
                    }px, ${imagePosition.y / zoom}px)`,
                    transformOrigin: "center center",
                  }}
                >
                  <Image
                    src={selectedImageData.imagePath || "/placeholder.svg"}
                    alt={`${displayData.Year} ${displayData.Make} ${displayData.Model} - ${selectedImageData.label}`}
                    width={800}
                    height={600}
                    className="object-contain"
                    style={{
                      width: "auto",
                      height: "auto",
                      maxWidth: "80vw",
                      maxHeight: "60vh",
                    }}
                    priority
                    onError={() => handleImageError(selectedImageData.id)}
                  />
                </div>
              </div>

              {/* Image Info */}
              <div className="text-center">
                <h3 className="text-yellow-400 text-xl font-bold mb-2">
                  {selectedImageData.label}
                </h3>
                <p className="text-gray-300 text-sm">
                  {displayData.Year} {displayData.Make} {displayData.Model}
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="fixed bottom-6 right-6 z-50 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg border border-yellow-400/30 max-w-xs">
            <p className="text-xs text-gray-300">
              Use mouse wheel to zoom • Drag to pan when zoomed • Click outside
              to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
