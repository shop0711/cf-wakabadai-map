import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Star } from "lucide-react";
import { getCategoryColor, getCategoryIcon, getStatusColor } from "../../data/mapData";
import type { MapPinData } from "../../data/mapData";
import "./MapBottomSheet.css";

interface MapBottomSheetProps {
  pin: MapPinData | null;
  onClose: () => void;
}

export const MapBottomSheet: React.FC<MapBottomSheetProps> = ({ pin, onClose }) => {
  return (
    <AnimatePresence>
      {pin && (
        <>
          {/* Backdrop */}
          <motion.div
            className="bottom-sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Sheet */}
          <motion.div
            className="bottom-sheet-container"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_e, { offset, velocity }) => {
              if (offset.y > 100 || velocity.y > 500) {
                onClose();
              }
            }}
          >
            <div className="bottom-sheet-handle-container">
              <div className="bottom-sheet-handle" />
            </div>
            
            <button className="bottom-sheet-close-btn" onClick={onClose}>
              <X size={24} color="#757575" />
            </button>

            <div className="bottom-sheet-content">
              {/* Category color bar */}
              <div
                className="bottom-sheet-color-bar"
                style={{ backgroundColor: getCategoryColor(pin.category) }}
              >
                {(() => {
                  const Icon = getCategoryIcon(pin.category);
                  return <Icon size={28} color="#fff" />;
                })()}
                <span className="color-bar-title">{pin.title.split("（")[0]}</span>
              </div>
              
              <div className="bottom-sheet-details">
                <h2 className="bottom-sheet-title">{pin.title}</h2>
                
                <div className="bottom-sheet-info-row">
                  <div className="info-item">
                    <Users size={16} />
                    <span style={{ color: getStatusColor(pin.status), fontWeight: "bold" }}>
                      {pin.status}
                    </span>
                  </div>
                </div>

                <div className="bottom-sheet-recommendation">
                  <div className="recommendation-header">
                    <Star size={18} color="#e7732d" fill="#e7732d" />
                    <span className="recommendation-badge">詳細情報</span>
                  </div>
                  <p className="recommendation-text">{pin.description}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
