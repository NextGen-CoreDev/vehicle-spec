"use client";
import React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useVehicleData } from "@/hooks/useVehicleData";

interface PhotoType {
  label: string;
  id: string;
  airtableColumn: string;
  images: string[];
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
  const [isMobile, setIsMobile] = useState(false);

  // Current image navigation state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [allImages, setAllImages] = useState<
    Array<{ url: string; type: string; typeIndex: number }>
  >([]);

  // Touch/swipe handling
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(
    null
  );

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Create photo types with actual images only
  const photoTypes: PhotoType[] = React.useMemo(() => {
    const typeConfig = [
      { label: "Front", airtableColumn: "Front Image" },
      { label: "Rear", airtableColumn: "Rear Image" },
      {
        label: "Driver Side",
        airtableColumn: "Drive Side Image",
      },
      {
        label: "Passenger Side",
        airtableColumn: "Passenger Side Image",
      },
      {
        label: "Interior",
        airtableColumn: "Interior Image",
      },
      {
        label: "Dashboard",
        airtableColumn: "Dashboard Image",
      },
      { label: "Tires", airtableColumn: "Tires Image" },
      {
        label: "Window Sticker",
        airtableColumn: "Window Sticker Image",
      },
      {
        label: "Add-Ons Damage",
        airtableColumn: "Add-ons Damage Image",
      },
    ];

    return typeConfig
      .map((config) => ({
        label: config.label,
        id: config.label.toLowerCase().replace(/\s+/g, "-"),
        airtableColumn: config.airtableColumn,
        images: images[config.airtableColumn as keyof typeof images] || [],
      }))
      .filter((type) => type.images.length > 0); // Only include types with actual images
  }, [images]);

  // Create flattened array of all images for modal navigation
  useEffect(() => {
    const flatImages: Array<{ url: string; type: string; typeIndex: number }> =
      [];
    photoTypes.forEach((type) => {
      type.images.forEach((imageUrl, index) => {
        flatImages.push({
          url: imageUrl,
          type: type.label,
          typeIndex: index,
        });
      });
    });
    setAllImages(flatImages);
  }, [photoTypes]);

  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
    // Find the index of the selected image in the flattened array
    const index = allImages.findIndex((img) => img.url === imageUrl);
    setCurrentImageIndex(index);
  };

  const closeImageModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
    resetZoom();
  };

  const resetZoom = () => {
    setZoom(1);
    setImagePosition({ x: 0, y: 0 });
    setIsDragging(false);
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
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      // Calculate the maximum drag bounds based on zoom level
      const containerWidth = 800;
      const containerHeight = 600;
      const scaledWidth = containerWidth * zoom;
      const scaledHeight = containerHeight * zoom;

      const maxDragX = Math.max(0, (scaledWidth - containerWidth) / 2);
      const maxDragY = Math.max(0, (scaledHeight - containerHeight) / 2);

      const constrainedX = Math.max(-maxDragX, Math.min(maxDragX, newX));
      const constrainedY = Math.max(-maxDragY, Math.min(maxDragY, newY));

      setImagePosition({
        x: constrainedX,
        y: constrainedY,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for swipe functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > 50;
    const isRightSwipe = distanceX < -50;
    const isVerticalSwipe = Math.abs(distanceY) > Math.abs(distanceX);

    if (!isVerticalSwipe) {
      if (isLeftSwipe && currentImageIndex < allImages.length - 1) {
        navigateToImage(currentImageIndex + 1);
      }
      if (isRightSwipe && currentImageIndex > 0) {
        navigateToImage(currentImageIndex - 1);
      }
    }
  };

  const navigateToImage = (index: number) => {
    if (index >= 0 && index < allImages.length) {
      setCurrentImageIndex(index);
      setSelectedImage(allImages[index].url);
      resetZoom();
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      navigateToImage(currentImageIndex - 1);
    }
  };

  const handleNextImage = () => {
    if (currentImageIndex < allImages.length - 1) {
      navigateToImage(currentImageIndex + 1);
    }
  };

  // Handle keyboard events
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isModalOpen) {
        if (event.key === "Escape") {
          closeImageModal();
        } else if (event.key === "ArrowLeft") {
          handlePrevImage();
        } else if (event.key === "ArrowRight") {
          handleNextImage();
        }
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
  }, [isModalOpen, currentImageIndex]);

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

  const selectedImageData = allImages[currentImageIndex];

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
        <img className="h-48 m-auto" src="/images/logo.png" />
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
          <span className="text-yellow-400 text-sm mb-1">Trim</span>
          <span className="text-white font-medium">{displayData.Trim}</span>
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

        <div className="flex flex-col">
          <span className="text-yellow-400 text-sm mb-1">Add-ons</span>
          <span className="text-white font-medium">
            {displayData["Add-ons"]}
          </span>
        </div>
      </div>

      {/* Photo Display - Grouped by Type */}
      {photoTypes.length > 0 ? (
        <div className="max-w-6xl mx-auto w-full mb-8 flex-1">
          {photoTypes.map((photoType) => (
            <div key={photoType.id} className="mb-8">
              {/* Photo Type Header */}
              <h3 className="text-yellow-400 text-xl font-bold mb-4 border-b border-yellow-400/30 pb-2">
                {photoType.label}
                <span className="text-sm text-gray-400 ml-2 font-normal">
                  ({photoType.images.length}{" "}
                  {photoType.images.length === 1 ? "photo" : "photos"})
                </span>
              </h3>

              {/* Images Grid */}
              <div
                className={`grid gap-4 ${
                  isMobile
                    ? "grid-cols-1"
                    : photoType.images.length === 1
                    ? "grid-cols-1 max-w-md"
                    : photoType.images.length === 2
                    ? "grid-cols-2"
                    : "grid-cols-3"
                }`}
              >
                {photoType.images.map((imageUrl, index) => (
                  <div
                    key={`${photoType.id}-${index}`}
                    className="aspect-square border-2 border-yellow-400 bg-black rounded-sm cursor-pointer hover:border-yellow-300 transition-colors duration-200 group overflow-hidden"
                    onClick={() => openImageModal(imageUrl)}
                  >
                    <div className="w-full h-full relative group-hover:scale-105 transition-transform duration-200">
                      <Image
                        src={imageUrl}
                        alt={`${displayData.Year} ${displayData.Make} ${
                          displayData.Model
                        } - ${photoType.label} ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={photoType.id === "front" && index === 0}
                      />
                      {photoType.images.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                          {index + 1}/{photoType.images.length}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto w-full mb-8 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 text-6xl mb-4">📷</div>
            <h3 className="text-yellow-400 text-xl font-bold mb-2">
              No Photos Available
            </h3>
            <p className="text-gray-300">
              Photos for this vehicle haven't been uploaded yet.
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-white text-sm max-w-4xl mx-auto">
        <p>
          This vehicle is currently being shopped through TRADELUX&apos;s
          private network.
        </p>
        <p className="mt-1">
          To submit an offer, reply to{" "}
          <a
            href={`mailto:Pricing@tradelux.us?subject=Vehicle Offer - ${displayData.Year} ${displayData.Make} ${displayData.Model}&body=Hello TRADELUX,%0D%0A%0D%0AI am interested in submitting an offer for the ${displayData.Year} ${displayData.Make} ${displayData.Model} (VIN: ${displayData.VIN}).%0D%0A%0D%0AMy offer details:%0D%0A- Offer Amount: $%0D%0A- Financing: %0D%0A- Additional Comments: %0D%0A%0D%0APlease let me know if you need any additional information.%0D%0A%0D%0AThank you,%0D%0A[Your Name]`}
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
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close Button */}
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

          {/* Navigation Arrows */}
          {!isMobile && (
            <>
              {currentImageIndex > 0 && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handlePrevImage();
                  }}
                  className="fixed left-6 top-1/2 -translate-y-1/2 z-50 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full p-3 transition-all duration-200 hover:scale-110 border border-yellow-400/30 hover:border-yellow-400"
                  aria-label="Previous image"
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
              )}

              {currentImageIndex < allImages.length - 1 && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleNextImage();
                  }}
                  className="fixed right-6 top-1/2 -translate-y-1/2 z-50 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full p-3 transition-all duration-200 hover:scale-110 border border-yellow-400/30 hover:border-yellow-400"
                  aria-label="Next image"
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              )}
            </>
          )}

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

          {/* Image Counter */}
          <div className="fixed top-6 right-20 z-50 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg border border-yellow-400/30">
            <span className="text-sm text-yellow-400">
              {currentImageIndex + 1} / {allImages.length}
            </span>
          </div>

          {/* Zoom Level Indicator */}
          <div className="fixed bottom-6 left-6 z-50 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg border border-yellow-400/30">
            <span className="text-sm text-yellow-400">
              Zoom: {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Current Image Type Indicator */}
          <div className="fixed bottom-6 right-6 z-50 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg border border-yellow-400/30">
            <span className="text-sm text-yellow-400">
              {selectedImageData.type}
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
                    transform: `scale(${zoom}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                    transformOrigin: "center center",
                    cursor:
                      zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
                  }}
                >
                  <Image
                    src={selectedImageData.url}
                    alt={`${displayData.Year} ${displayData.Make} ${displayData.Model} - ${selectedImageData.type}`}
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
                  />
                </div>
              </div>

              {/* Image Info */}
              <div className="text-center">
                <h3 className="text-yellow-400 text-xl font-bold mb-2">
                  {selectedImageData.type}
                </h3>
                <p className="text-gray-300 text-sm">
                  {displayData.Year} {displayData.Make} {displayData.Model}
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="fixed bottom-6 right-20 z-50 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg border border-yellow-400/30 max-w-xs">
            <p className="text-xs text-gray-300">
              {isMobile
                ? "Swipe left/right to navigate • Pinch to zoom • Tap outside to close"
                : "Use mouse wheel to zoom • Drag to pan when zoomed • Arrow keys to navigate • Click outside to close"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
