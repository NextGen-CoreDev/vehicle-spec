"use client"
import React from "react"
import { useState } from "react"
import Image from "next/image"

export default function VehicleDisplay() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })

  const openImageModal = (imageId: string) => {
    setSelectedImage(imageId)
    setIsModalOpen(true)
  }

  const closeImageModal = () => {
    setIsModalOpen(false)
    setSelectedImage(null)
    resetZoom()
  }

  const resetZoom = () => {
    setZoom(1)
    setImagePosition({ x: 0, y: 0 })
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 3))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.5, 0.5))
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    if (e.deltaY < 0) {
      handleZoomIn()
    } else {
      handleZoomOut()
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Handle keyboard events
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isModalOpen) {
        closeImageModal()
      }
    }

    if (isModalOpen) {
      document.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "unset"
    }
  }, [isModalOpen])

  const vehicleData = {
    year: "2023",
    make: "Mercedes Benz",
    model: "S580",
    vin: "W1K6G7GB1PA123456",
    mileage: "10,420",
    zipCode: "",
    exteriorColor: "Obsidian Black",
    interiorColor: "Macchiato Beige",
    vehicleCondition: "Excellent",
    tireCondition: "Medium Wear",
    addOns: 'AMG Line Package, Ceramic Coating, 22" AMG Wheels',
  }

  const photoSections = [
    { label: "Front", id: "front", imagePath: "/images/front-view.png" },
    { label: "Rear", id: "rear", imagePath: "/images/rear-view.png" },
    { label: "Driver Side", id: "driver-side", imagePath: "/images/driver-side.png" },
    { label: "Passenger Side", id: "passenger-side", imagePath: "/images/passenger-side.png" },
    { label: "Interior", id: "interior", imagePath: "/images/interior.png" },
    { label: "Dashboard", id: "dashboard", imagePath: "/images/dashboard.png" },
    { label: "Tires", id: "tires", imagePath: "/images/tires.png" },
    { label: "Window Sticker", id: "window-sticker", imagePath: "/images/window-sticker.png" },
    { label: "Add-Ons Damage", id: "add-ons-damage", imagePath: "/images/add-ons-damage.png" },
  ]

  const selectedImageData = photoSections.find((section) => section.id === selectedImage)

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-yellow-400 tracking-wider mb-4">TRADELUX</h1>
      </div>

      {/* Vehicle Specifications Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 mb-8 max-w-6xl mx-auto w-full">
        <div className="flex flex-col">
          <span className="text-yellow-400 text-sm mb-1">Year</span>
          <span className="text-white font-medium">{vehicleData.year}</span>
        </div>

        <div className="flex flex-col">
          <span className="text-yellow-400 text-sm mb-1">Make</span>
          <span className="text-white font-medium">{vehicleData.make}</span>
        </div>

        <div className="flex flex-col">
          <span className="text-yellow-400 text-sm mb-1">Model</span>
          <span className="text-white font-medium">{vehicleData.model}</span>
        </div>

        <div className="flex flex-col">
          <span className="text-yellow-400 text-sm mb-1">VIN</span>
          <span className="text-white font-medium">{vehicleData.vin}</span>
        </div>

        <div className="flex flex-col">
          <span className="text-yellow-400 text-sm mb-1">Mileage</span>
          <span className="text-white font-medium">{vehicleData.mileage}</span>
        </div>

        <div className="flex flex-col">
          <span className="text-yellow-400 text-sm mb-1">Zip Code</span>
          <span className="text-white font-medium">{vehicleData.zipCode || "—"}</span>
        </div>

        <div className="flex flex-col">
          <span className="text-yellow-400 text-sm mb-1">Exterior Color</span>
          <span className="text-white font-medium">{vehicleData.exteriorColor}</span>
        </div>

        <div className="flex flex-col">
          <span className="text-yellow-400 text-sm mb-1">Interior Color</span>
          <span className="text-white font-medium">{vehicleData.interiorColor}</span>
        </div>

        <div className="flex flex-col">
          <span className="text-yellow-400 text-sm mb-1">Vehicle Condition</span>
          <span className="text-white font-medium">{vehicleData.vehicleCondition}</span>
        </div>

        <div className="flex flex-col">
          <span className="text-yellow-400 text-sm mb-1">Tire Condition</span>
          <span className="text-white font-medium">{vehicleData.tireCondition}</span>
        </div>

        <div className="flex flex-col col-span-2">
          <span className="text-yellow-400 text-sm mb-1">Add-ons</span>
          <span className="text-white font-medium">{vehicleData.addOns}</span>
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
                  alt={`${vehicleData.year} ${vehicleData.make} ${vehicleData.model} - ${section.label}`}
                  fill
                  className="object-cover"
                  crossOrigin="anonymous"
                />
              </div>
            </div>
            <span className="text-yellow-400 text-sm text-center font-medium">{section.label}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center text-white text-sm max-w-4xl mx-auto">
        <p>This vehicle is currently being shopped through TRADELUX's private network.</p>
        <p className="mt-1">
          To submit an offer, reply to <span className="text-yellow-400">Pricing@tradelux.us</span> or respond directly
          to the TRADELUX text notification.
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
              e.preventDefault()
              e.stopPropagation()
              closeImageModal()
            }}
            className="fixed top-6 right-6 z-50 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full p-3 transition-all duration-200 hover:scale-110 border border-yellow-400/30 hover:border-yellow-400"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Zoom Controls */}
          <div className="fixed top-6 left-6 z-50 flex flex-col gap-2">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleZoomIn()
              }}
              disabled={zoom >= 3}
              className="bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full p-3 transition-all duration-200 hover:scale-110 border border-yellow-400/30 hover:border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleZoomOut()
              }}
              disabled={zoom <= 0.5}
              className="bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full p-3 transition-all duration-200 hover:scale-110 border border-yellow-400/30 hover:border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                resetZoom()
              }}
              className="bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full p-3 transition-all duration-200 hover:scale-110 border border-yellow-400/30 hover:border-yellow-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <span className="text-sm text-yellow-400">Zoom: {Math.round(zoom * 100)}%</span>
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
                  cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
                  width: "auto",
                  height: "auto",
                  maxWidth: "80vw",
                  maxHeight: "60vh",
                }}
              >
                <div
                  className="relative transition-transform duration-200 ease-out"
                  style={{
                    transform: `scale(${zoom}) translate(${imagePosition.x / zoom}px, ${imagePosition.y / zoom}px)`,
                    transformOrigin: "center center",
                  }}
                >
                  <Image
                    src={selectedImageData.imagePath || "/placeholder.svg"}
                    alt={`${vehicleData.year} ${vehicleData.make} ${vehicleData.model} - ${selectedImageData.label}`}
                    width={800}
                    height={600}
                    className="object-contain"
                    crossOrigin="anonymous"
                    style={{
                      width: "auto",
                      height: "auto",
                      maxWidth: "80vw",
                      maxHeight: "60vh",
                    }}
                  />
                </div>
              </div>

              {/* Image Info */}
              <div className="text-center">
                <h3 className="text-yellow-400 text-xl font-bold mb-2">{selectedImageData.label}</h3>
                <p className="text-gray-300 text-sm">
                  {vehicleData.year} {vehicleData.make} {vehicleData.model}
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="fixed bottom-6 right-6 z-50 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg border border-yellow-400/30 max-w-xs">
            <p className="text-xs text-gray-300">
              Use mouse wheel to zoom • Drag to pan when zoomed • Click outside to close
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
