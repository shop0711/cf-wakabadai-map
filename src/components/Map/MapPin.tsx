import React from "react";
import { motion } from "framer-motion";
import { getCategoryColor, getCategoryIcon } from "../../data/mapData";
import type { MapPinData } from "../../data/mapData";
import "./MapPin.css";

interface MapPinProps {
  pin: MapPinData;
  onClick: (pin: MapPinData) => void;
  isSelected: boolean;
  isEditMode?: boolean;
  onDragStart?: () => void;
  onDragEnd?: (id: string, newX: number, newY: number) => void;
  dragConstraintsRef?: React.RefObject<HTMLDivElement | null>;
  zoomScale?: number;
}

export const MapPin: React.FC<MapPinProps> = ({
  pin,
  onClick,
  isSelected,
  isEditMode = false,
  onDragStart,
  onDragEnd,
  dragConstraintsRef,
  zoomScale = 1,
}) => {
  const Icon = getCategoryIcon(pin.category);
  const color = getCategoryColor(pin.category);

  const handleDragEnd = (_event: any, info: any) => {
    if (!onDragEnd || !dragConstraintsRef?.current) return;
    const canvas = dragConstraintsRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Calculate percentages relative to the zoomed/panned canvas bounding rect
    const newX = ((info.point.x - rect.left) / rect.width) * 100;
    const newY = ((info.point.y - rect.top) / rect.height) * 100;
    
    // Clamping to [0, 100]
    const clampedX = Math.max(0, Math.min(100, newX));
    const clampedY = Math.max(0, Math.min(100, newY));
    
    onDragEnd(pin.id, parseFloat(clampedX.toFixed(1)), parseFloat(clampedY.toFixed(1)));
  };

  return (
    <motion.div
      id={`pin-${pin.id}`}
      className={`map-pin-container ${isSelected ? "selected" : ""} ${isEditMode ? "edit-mode" : ""}`}
      style={{
        left: `${pin.x}%`,
        top: `${pin.y}%`,
        scale: 1 / zoomScale,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(pin);
      }}
      // Framer Motion Drag configuration
      drag={isEditMode}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={dragConstraintsRef}
      onDragStart={onDragStart}
      onDragEnd={handleDragEnd}
      
      // Stop bouncing animation when in edit mode
      animate={isEditMode ? { y: 0 } : { y: [0, -5, 0] }}
      transition={{ 
        repeat: isEditMode ? 0 : Infinity, 
        duration: 2, 
        ease: "easeInOut",
        delay: Math.random() // Stagger animations slightly
      }}
      whileTap={{ scale: isEditMode ? 1.1 : 0.9 }}
    >
      <div className="map-pin-marker" style={{ backgroundColor: color }}>
        <Icon size={16} color="#fff" />
      </div>
      <div className="map-pin-label">
        {pin.title.split("（")[0].split("・")[0]}
      </div>
    </motion.div>
  );
};
