import React from "react";
import { LOCATION_MARKER_STYLES } from "../../hooks/useGeolocation";
import type { GeoPosition } from "../../hooks/useGeolocation";
import "./UserLocationMarker.css";

interface UserLocationMarkerProps {
  /** useGeolocation フックから取得した位置情報 */
  position: GeoPosition;
  /** 現在のマップズーム倍率（ピンと同じスケールロック用） */
  zoomScale?: number;
}

/**
 * ユーザーの現在地を示す青いパルスマーカー。
 * マップキャンバス上に absolute 配置で表示される。
 */
export const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({
  position,
  zoomScale = 1,
}) => {
  const { mapX, mapY, accuracyPercent, isInsideStore, accuracy } = position;

  // 店舗範囲外にいる場合は表示しない
  if (!isInsideStore) return null;

  // 精度サークルの直径（マップ%単位 → 実際の表示サイズ）
  // 精度サークルはズームに追従するのでスケールロックしない
  const accuracyDiameter = Math.max(accuracyPercent * 2, 5);

  return (
    <div
      className="user-location-container"
      style={{
        left: `${mapX}%`,
        top: `${mapY}%`,
        // ピンと同様にズームスケールロック
        transform: `translate(-50%, -50%) scale(${1 / zoomScale})`,
      }}
    >
      {/* 精度サークル（位置精度の範囲を視覚化） */}
      <div
        className="user-location-accuracy-circle"
        style={{
          width: `${accuracyDiameter * zoomScale}px`,
          height: `${accuracyDiameter * zoomScale}px`,
          backgroundColor: LOCATION_MARKER_STYLES.accuracyCircleColor,
          borderColor: LOCATION_MARKER_STYLES.accuracyCircleBorder,
        }}
      />

      {/* パルスアニメーション（外側のリング） */}
      <div
        className="user-location-pulse"
        style={{
          width: `${LOCATION_MARKER_STYLES.pulseMaxSize}px`,
          height: `${LOCATION_MARKER_STYLES.pulseMaxSize}px`,
        }}
      />

      {/* 中心のドット */}
      <div
        className="user-location-dot"
        style={{
          width: `${LOCATION_MARKER_STYLES.dotSize}px`,
          height: `${LOCATION_MARKER_STYLES.dotSize}px`,
          backgroundColor: LOCATION_MARKER_STYLES.dotColor,
        }}
      />

      {/* 精度ラベル（精度が50m以上の場合に「目安」と注釈を表示） */}
      {accuracy > 50 && (
        <div className="user-location-accuracy-label">
          ≈ 目安（精度 {Math.round(accuracy)}m）
        </div>
      )}
    </div>
  );
};
