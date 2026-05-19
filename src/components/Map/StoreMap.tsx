import React, { useState, useCallback, useRef, useEffect } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Trees, Car, Compass, Navigation } from "lucide-react";
import { mapPins } from "../../data/mapData";
import type { MapPinData } from "../../data/mapData";
import { MapPin } from "./MapPin";
import { MapBottomSheet } from "./MapBottomSheet";
import { UserLocationMarker } from "./UserLocationMarker";
import { useGeolocation } from "../../hooks/useGeolocation";
import "./StoreMap.css";
import "./UserLocationMarker.css";
import "./SurroundingArea.css";

const IS_DEV = import.meta.env.DEV;

export const StoreMap: React.FC = () => {
  const [pins, setPins] = useState<MapPinData[]>([]);
  const [selectedPin, setSelectedPin] = useState<MapPinData | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isDraggingPin, setIsDraggingPin] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [hasEditPermission, setHasEditPermission] = useState<boolean>(false);
  const [isEmbed, setIsEmbed] = useState<boolean>(false);
  const [isMobile] = useState<boolean>(window.innerWidth < 600);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef<any>(null);

  // Geolocation（現在地追跡）
  const {
    position: userPosition,
    status: locationStatus,
    errorMessage: locationError,
    startTracking,
    stopTracking,
    isTracking,
  } = useGeolocation();
  const [showLocationBanner, setShowLocationBanner] = useState<boolean>(false);

  // Sync pins when mapPins database is updated, or load from localStorage
  useEffect(() => {
    const savedPins = localStorage.getItem("cf_wakabadai_map_pins");
    if (savedPins) {
      try {
        const parsed = JSON.parse(savedPins) as MapPinData[];
        // Validate if they are matching the expected format
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with any potentially new pins from mapPins to be robust
          const merged = mapPins.map((dbPin) => {
            const saved = parsed.find((p) => p.id === dbPin.id);
            return saved ? { ...dbPin, x: saved.x, y: saved.y } : dbPin;
          });
          setPins(merged);
          return;
        }
      } catch (err) {
        console.error("Failed to load pins from localStorage", err);
      }
    }
    setPins(mapPins);
  }, []);

  // Determine if editing options should be enabled and if map is embedded (URL parameters)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasParam = params.get("edit") === "true" || params.get("dev") === "true";
    setHasEditPermission(IS_DEV || hasParam);
    setIsEmbed(params.get("embed") === "true");
  }, []);

  const handlePinClick = (pin: MapPinData) => {
    setSelectedPin(pin);
    
    // Smoothly focus and zoom onto the clicked pin (highly premium UX transition)
    setTimeout(() => {
      const pinElement = document.getElementById(`pin-${pin.id}`);
      if (pinElement && transformRef.current) {
        // Zoom to clicked element: Target, scale (1.8), duration (500ms)
        transformRef.current.zoomToElement(pinElement, 1.8, 500);
      }
    }, 50);
  };

  // Debug: Log coordinates (X%, Y%) when clicking on the map canvas (dev only)
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasEditPermission) return;
    if (isEditMode) return; // Skip coordinate logging on standard click if in edit mode

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;

    const clickString = `📍 [DEV] Map Click → x: ${xPct.toFixed(1)}, y: ${yPct.toFixed(1)}`;
    console.log(clickString);

    navigator.clipboard.writeText(clickString).then(() => {
      setToastMessage(`座標をコピーしました！\nx: ${xPct.toFixed(1)}, y: ${yPct.toFixed(1)}`);
    }).catch(() => {
      setToastMessage(`座標を取得しました！\nx: ${xPct.toFixed(1)}, y: ${yPct.toFixed(1)}`);
    });
  }, [isEditMode]);

  // Handle drag start - temporarily disable map panning/zooming to allow smooth pin drag
  const handlePinDragStart = () => {
    setIsDraggingPin(true);
  };

  // Handle drag end - compute final position, log it, copy to clipboard, and update local state
  const handlePinDragEnd = (id: string, newX: number, newY: number) => {
    setIsDraggingPin(false);
    
    // Update local pins array so the dragged pin remains exactly where it was dropped
    setPins((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, x: newX, y: newY } : p));
      localStorage.setItem("cf_wakabadai_map_pins", JSON.stringify(updated));
      return updated;
    });

    // Sync selected pin if it was the one dragged
    if (selectedPin?.id === id) {
      setSelectedPin((prev) => prev ? { ...prev, x: newX, y: newY } : null);
    }

    const pin = mapPins.find((p) => p.id === id);
    if (pin) {
      const shortTitle = pin.title.split("（")[0].split("・")[0];
      const clickString = `📍 [DEV] Map Click → x: ${newX.toFixed(1)}, y: ${newY.toFixed(1)} ${shortTitle}`;
      console.log(clickString);

      // Copy the code coordinate format to the clipboard!
      navigator.clipboard.writeText(clickString).then(() => {
        setToastMessage(`「${shortTitle}」の位置を調整しました！\n座標: x: ${newX.toFixed(1)}, y: ${newY.toFixed(1)}\n(ローカルに自動保存されました)`);
      }).catch(() => {
        setToastMessage(`「${shortTitle}」の位置を調整しました！\n座標: x: ${newX.toFixed(1)}, y: ${newY.toFixed(1)}`);
      });
    }
  };

  // Listen for arrow keys to nudge the selected pin in Edit Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isEditMode || !selectedPin) return;

      const step = e.shiftKey ? 1.0 : 0.1;
      let dx = 0;
      let dy = 0;

      switch (e.key) {
        case "ArrowLeft":
          dx = -step;
          e.preventDefault();
          break;
        case "ArrowRight":
          dx = step;
          e.preventDefault();
          break;
        case "ArrowUp":
          dy = -step;
          e.preventDefault();
          break;
        case "ArrowDown":
          dy = step;
          e.preventDefault();
          break;
        case "Escape":
          setSelectedPin(null);
          e.preventDefault();
          break;
        default:
          return;
      }

      if (dx !== 0 || dy !== 0) {
        const newX = parseFloat(Math.max(0, Math.min(100, selectedPin.x + dx)).toFixed(1));
        const newY = parseFloat(Math.max(0, Math.min(100, selectedPin.y + dy)).toFixed(1));

        // Update selected pin state
        setSelectedPin((prev) => (prev ? { ...prev, x: newX, y: newY } : null));

        // Update pins list and save to localStorage
        setPins((prev) => {
          const updated = prev.map((p) =>
            p.id === selectedPin.id ? { ...p, x: newX, y: newY } : p
          );
          localStorage.setItem("cf_wakabadai_map_pins", JSON.stringify(updated));
          return updated;
        });

        const shortTitle = selectedPin.title.split("（")[0].split("・")[0];
        setToastMessage(`「${shortTitle}」微調整中...\nx: ${newX.toFixed(1)}, y: ${newY.toFixed(1)}\n(矢印キーで0.1%刻み、Shift+矢印で1%刻み)`);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditMode, selectedPin]);

  // Export current pin coordinates as code to clipboard
  const handleExportCoordinates = () => {
    const pinsString = pins.map((p) => {
      const orig = mapPins.find((o) => o.id === p.id) || p;
      return `  {
    id: "${p.id}",
    title: "${orig.title}",
    category: "${orig.category}",
    x: ${p.x.toFixed(1)},
    y: ${p.y.toFixed(1)},
    status: "${orig.status}",
    description: "${orig.description.replace(/"/g, '\\"')}",
  },`;
    }).join("\n");

    const codeTemplate = `export const mapPins: MapPinData[] = [\n${pinsString}\n];`;

    navigator.clipboard.writeText(codeTemplate).then(() => {
      setToastMessage("全ピンのTSコード用配列データをコピーしました！\nmapData.ts の mapPins 配列にそのまま貼り付けられます。");
    }).catch(() => {
      setToastMessage("コピーに失敗しました。コンソールログをご確認ください。");
      console.log(codeTemplate);
    });
  };

  // Reset pins to original values
  const handleResetToDefault = () => {
    if (window.confirm("ピンの位置をすべて初期値（デフォルト）に戻しますか？")) {
      localStorage.removeItem("cf_wakabadai_map_pins");
      setPins(mapPins);
      setSelectedPin(null);
      setToastMessage("ピンの位置を初期値にリセットしました。");
    }
  };

  // Auto-clear toast notification
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  return (
    <div className={`store-map-container ${isEmbed ? "embed" : ""}`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="map-toast-notification">
          {toastMessage.split("\n").map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}

      {/* Header */}
      {!isEmbed && (
        <header className="store-map-header">
          <div>
            <h1>コーチャンフォー若葉台店</h1>
            <p>インタラクティブ・フロアマップ</p>
          </div>
          
          <div className="header-actions">
            {hasEditPermission && (
              <>
                {isEditMode && (
                  <>
                    <button 
                      className="export-coords-btn" 
                      onClick={handleExportCoordinates}
                      title="現在の座標を TypeScript の配列定義の形でコピーします"
                    >
                      📋 座標コードをコピー
                    </button>
                    <button 
                      className="reset-coords-btn" 
                      onClick={handleResetToDefault}
                      title="ピンの位置をすべてデフォルトの初期位置に戻します"
                    >
                      🔄 位置を初期化
                    </button>
                  </>
                )}

                <button
                  className={`edit-mode-toggle-btn ${isEditMode ? "active" : ""}`}
                  onClick={() => {
                    setIsEditMode(!isEditMode);
                    setSelectedPin(null); // Close sheet when switching modes
                  }}
                >
                  {isEditMode ? "💾 調整完了 (通常モードへ)" : "📍 ピン調整モード (ドラッグ＆ドロップ可)"}
                </button>
              </>
            )}
          </div>
        </header>
      )}

      {/* Map Area */}
      <div className="store-map-viewport">
        <TransformWrapper
          ref={transformRef}
          initialScale={isMobile ? 1.6 : 1}
          initialPositionX={0}
          initialPositionY={0}
          minScale={0.5}
          maxScale={3}
          centerOnInit
          wheel={{ step: 0.1, disabled: isDraggingPin }} // Disable wheel zoom when dragging pin
          panning={{ disabled: isDraggingPin }} // Disable map panning when dragging pin
          doubleClick={{ disabled: true }}
          onTransform={(ref: any) => {
            setZoomScale(ref.state.scale);
          }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              {/* Map Controls */}
              <div className="store-map-controls">
                <button onClick={() => zoomIn()}>+</button>
                <button onClick={() => zoomOut()}>−</button>
                <button onClick={() => resetTransform()}>リセット</button>
                {/* 現在地ボタン */}
                <button
                  className={`location-btn ${
                    isTracking ? "tracking" : ""
                  } ${
                    locationStatus === "denied" || locationStatus === "error" || locationStatus === "unavailable"
                      ? "error"
                      : ""
                  }`}
                  onClick={() => {
                    if (isTracking) {
                      stopTracking();
                      setShowLocationBanner(false);
                    } else {
                      startTracking();
                      setShowLocationBanner(true);
                      // 5秒後にバナーを自動的に消す
                      setTimeout(() => setShowLocationBanner(false), 5000);
                    }
                  }}
                  title={isTracking ? "現在地の追跡を停止" : "現在地を表示"}
                >
                  📍
                </button>
              </div>

              <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
                <div className="store-map-world">
                  {/* 🧭 北を示す方位磁針 */}
                  <div className="surrounding-compass">
                    <Compass size={14} />
                    <span>N</span>
                  </div>

                  {/* 🌳 北側：若葉台遊歩道 (Flex子要素 - 高さ 15%) */}
                  <div className="surrounding-north">
                    <div className="greenery-strip" />
                    <div className="walkway-path">
                      <Trees size={12} className="icon-trees" />
                      <span>若葉台遊歩道 (緑豊かな散策路)</span>
                    </div>
                    {/* 遊歩道沿いの木々のビジュアル装飾 */}
                    <div className="tree-decorations">
                      <span className="tree-emoji">🌳</span>
                      <span className="tree-emoji">🌲</span>
                      <span className="tree-emoji">🌳</span>
                      <span className="tree-emoji">🌲</span>
                    </div>
                    {/* 境界線とエリア外注釈 */}
                    <div className="area-boundary-label north-boundary">
                      <span>⚠ これより先は店舗外（遊歩道エリア）です</span>
                    </div>
                  </div>

                  {/* 🏢 中央：店舗マップエリア (Flex子要素 - 高さ 60%) */}
                  <div className="store-map-canvas-wrapper">
                    {/* 🛣️ 東西の周辺道路 (店舗の左右に絶対配置) */}
                    <div className="surrounding-roads">
                      <div className="road-west">
                        <div className="road-label">若葉台通り</div>
                        <div className="station-guide">
                          <Navigation size={10} className="icon-nav-west" />
                          <span>至 若葉台駅 (徒歩5分)</span>
                        </div>
                      </div>
                      <div className="road-east">
                        <div className="road-label">鶴川街道方面 →</div>
                      </div>
                    </div>

                    <div
                      ref={canvasRef}
                      className="store-map-canvas"
                      onClick={handleCanvasClick}
                    >
                      {/* Floor map image as background */}
                      <img
                        src={`${import.meta.env.BASE_URL}images/floor-map.png`}
                        alt="コーチャンフォー若葉台店 フロアマップ"
                        className="store-map-image"
                        draggable={false}
                      />

                      {/* Pins */}
                      {pins.map((pin) => (
                        <MapPin
                          key={`${pin.id}-${pin.x}-${pin.y}`} // Key changes on coordinates update to force component reset
                          pin={pin}
                          isSelected={selectedPin?.id === pin.id}
                          onClick={handlePinClick}
                          isEditMode={isEditMode}
                          onDragStart={handlePinDragStart}
                          onDragEnd={handlePinDragEnd}
                          dragConstraintsRef={canvasRef}
                          zoomScale={zoomScale}
                        />
                      ))}

                      {/* ユーザー現在地マーカー */}
                      {userPosition && (
                        <UserLocationMarker
                          position={userPosition}
                          zoomScale={zoomScale}
                        />
                      )}
                    </div>
                  </div>

                  {/* 🚗 南側：お客様駐車場 (Flex子要素 - 高さ 25%) */}
                  <div className="surrounding-south">
                    <div className="parking-lots">
                      <div className="parking-row" />
                      <div className="parking-row" />
                    </div>

                    <div className="parking-banner">
                      <Car size={12} className="icon-car" />
                      <span>お客様駐車場 (約605台収容・店舗利用で無料)</span>
                    </div>

                    <div className="parking-notes">
                      ※南側道路および遊歩道からの車両進入はできません。専用入口をご利用ください。
                    </div>

                    <div className="area-boundary-label south-boundary">
                      <span>⚠ これより先は店舗外（駐車場エリア）です</span>
                    </div>
                  </div>
                </div>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>

      {/* Dev mode indicator */}
      {hasEditPermission && (
        <div className="dev-indicator">
          {isEditMode 
            ? "【編集モード】ピンを選択：ドラッグで移動、矢印キーで微調整(Shiftで大きく)、Escapeで選択解除" 
            : "DEV: クリックで座標コピー | 右上のボタンでドラッグ調整可能（隠し編集モード有効）"}
        </div>
      )}

      {/* 位置情報ステータスバナー */}
      {showLocationBanner && locationStatus === "requesting" && (
        <div className="location-status-banner">
          <span>📡 位置情報を取得中...</span>
          <button className="banner-close" onClick={() => setShowLocationBanner(false)}>✕</button>
        </div>
      )}
      {locationError && (
        <div className={`location-status-banner ${locationStatus === "denied" ? "error" : "warning"}`}>
          <span>{locationError}</span>
          <button className="banner-close" onClick={() => { stopTracking(); }}>✕</button>
        </div>
      )}
      {userPosition && !userPosition.isInsideStore && isTracking && (
        <div className="location-status-banner warning">
          <span>📍 現在、店舗の建物範囲外にいるようです。店内に入ると正確な位置が表示されます。</span>
          <button className="banner-close" onClick={() => stopTracking()}>✕</button>
        </div>
      )}

      {/* Bottom Sheet */}
      {!isEditMode && (
        <MapBottomSheet
          pin={selectedPin}
          onClose={() => setSelectedPin(null)}
        />
      )}
    </div>
  );
};
