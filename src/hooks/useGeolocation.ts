import { useState, useEffect, useCallback } from "react";

// ============================================================
// 📐 キャリブレーション定数
// 店舗建物の4隅（または対角2点）のGPS座標を設定してください。
// Googleマップで建物の角を右クリック→「座標をコピー」で取得できます。
//
// topLeft     = マップ画像の左上（店舗の北西の角）
// bottomRight = マップ画像の右下（店舗の南東の角）
//
// ※ 実際の店舗に行ってGPS座標を計測し、精度を上げてください。
// ============================================================
export const MAP_CALIBRATION = {
  // コーチャンフォー若葉台店のおおよその建物範囲
  // 注意: 以下は推定値です。現地で正確な値に調整してください。
  topLeft: {
    lat: 35.62390, // 店舗北西角の緯度
    lng: 139.47250, // 店舗北西角の経度
  },
  bottomRight: {
    lat: 35.62310, // 店舗南東角の緯度
    lng: 139.47400, // 店舗南東角の経度
  },
} as const;

// ============================================================
// 🎨 デザイン定数（マーカーのサイズ・色は後から簡単に変更可能）
// ============================================================
export const LOCATION_MARKER_STYLES = {
  dotColor: "#2196F3",            // 青いドットの色
  dotSize: 14,                    // ドットの直径 (px)
  pulseColor: "rgba(33, 150, 243, 0.3)", // パルスアニメーションの色
  pulseMaxSize: 40,               // パルスの最大サイズ (px)
  accuracyCircleColor: "rgba(33, 150, 243, 0.1)",  // 精度サークルの塗りつぶし色
  accuracyCircleBorder: "rgba(33, 150, 243, 0.3)",  // 精度サークルのボーダー色
} as const;

// ============================================================
// Geolocation API の設定
// ============================================================
export const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true, // GPS・Wi-Fi・セルラーを全て活用して最高精度で取得
  timeout: 15000,           // 15秒以内に取得できなければタイムアウト
  maximumAge: 5000,         // 5秒以内のキャッシュを許容
};

// ============================================================
// 型定義
// ============================================================
export type LocationStatus =
  | "idle"           // 初期状態（まだ取得していない）
  | "requesting"     // 位置情報の許可を要求中
  | "tracking"       // 正常に追跡中
  | "error"          // エラーが発生
  | "denied"         // ユーザーが位置情報を拒否
  | "unavailable"    // 位置情報が利用不可
  | "timeout";       // タイムアウト

export interface GeoPosition {
  /** マップ画像上のX座標（0-100%） */
  mapX: number;
  /** マップ画像上のY座標（0-100%） */
  mapY: number;
  /** 精度（メートル単位） */
  accuracy: number;
  /** 精度をマップ上の%サイズに変換した値 */
  accuracyPercent: number;
  /** ユーザーが店舗建物の範囲内にいるか */
  isInsideStore: boolean;
  /** 生のGPS緯度 */
  rawLat: number;
  /** 生のGPS経度 */
  rawLng: number;
  /** 最終更新タイムスタンプ */
  timestamp: number;
}

export interface UseGeolocationReturn {
  /** 現在の位置情報（null = 未取得） */
  position: GeoPosition | null;
  /** 現在のステータス */
  status: LocationStatus;
  /** エラーメッセージ（日本語） */
  errorMessage: string | null;
  /** 位置情報の追跡を開始する */
  startTracking: () => void;
  /** 位置情報の追跡を停止する */
  stopTracking: () => void;
  /** 追跡中かどうか */
  isTracking: boolean;
}

// ============================================================
// GPS座標 → マップ画像%座標への変換関数
// ============================================================
function gpsToMapPercent(
  lat: number,
  lng: number
): { x: number; y: number } {
  const { topLeft, bottomRight } = MAP_CALIBRATION;

  // 緯度は北が大きく南が小さいが、マップ画像のY軸は上が0%・下が100%
  // そのため、緯度が減少する方向がY軸の正の方向
  const x = ((lng - topLeft.lng) / (bottomRight.lng - topLeft.lng)) * 100;
  const y = ((topLeft.lat - lat) / (topLeft.lat - bottomRight.lat)) * 100;

  return { x, y };
}

/**
 * GPS精度（メートル）をマップ画像上の%サイズに変換する。
 * 店舗建物の幅（東西方向のメートル数）を基準に換算。
 */
function accuracyToPercent(accuracyMeters: number): number {
  const { topLeft, bottomRight } = MAP_CALIBRATION;

  // 緯度1度 ≈ 111,320m、経度1度 ≈ 111,320m × cos(緯度)
  const avgLat = (topLeft.lat + bottomRight.lat) / 2;
  const cosLat = Math.cos((avgLat * Math.PI) / 180);

  // 店舗の東西方向の幅（メートル）
  const storeLngDelta = Math.abs(bottomRight.lng - topLeft.lng);
  const storeWidthMeters = storeLngDelta * 111320 * cosLat;

  // 精度をマップ幅に対する%に変換
  return (accuracyMeters / storeWidthMeters) * 100;
}

/**
 * 座標が店舗建物範囲内にあるかチェック（マージン付き）
 */
function isInsideBounds(mapX: number, mapY: number, margin: number = 15): boolean {
  return (
    mapX >= -margin &&
    mapX <= 100 + margin &&
    mapY >= -margin &&
    mapY <= 100 + margin
  );
}

// ============================================================
// カスタムフック: useGeolocation
// ============================================================
export function useGeolocation(): UseGeolocationReturn {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  const isTracking = status === "tracking" || status === "requesting";

  // 成功コールバック
  const onSuccess = useCallback((pos: GeolocationPosition) => {
    const { latitude, longitude, accuracy } = pos.coords;
    const mapped = gpsToMapPercent(latitude, longitude);
    const accPct = accuracyToPercent(accuracy);

    setPosition({
      mapX: mapped.x,
      mapY: mapped.y,
      accuracy,
      accuracyPercent: accPct,
      isInsideStore: isInsideBounds(mapped.x, mapped.y),
      rawLat: latitude,
      rawLng: longitude,
      timestamp: pos.timestamp,
    });

    setStatus("tracking");
    setErrorMessage(null);
  }, []);

  // エラーコールバック
  const onError = useCallback((err: GeolocationPositionError) => {
    switch (err.code) {
      case err.PERMISSION_DENIED:
        setStatus("denied");
        setErrorMessage("位置情報の使用が許可されていません。ブラウザの設定から許可してください。");
        break;
      case err.POSITION_UNAVAILABLE:
        setStatus("unavailable");
        setErrorMessage("位置情報を取得できませんでした。GPS信号が届かない場所にいる可能性があります。");
        break;
      case err.TIMEOUT:
        setStatus("timeout");
        setErrorMessage("位置情報の取得がタイムアウトしました。しばらく経ってからもう一度お試しください。");
        break;
      default:
        setStatus("error");
        setErrorMessage("位置情報の取得中に不明なエラーが発生しました。");
    }
  }, []);

  // 追跡を開始
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("unavailable");
      setErrorMessage("お使いのブラウザは位置情報に対応していません。");
      return;
    }

    // 既存のウォッチをクリーンアップ
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }

    setStatus("requesting");
    setErrorMessage(null);

    const id = navigator.geolocation.watchPosition(
      onSuccess,
      onError,
      GEOLOCATION_OPTIONS
    );

    setWatchId(id);
  }, [watchId, onSuccess, onError]);

  // 追跡を停止
  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setStatus("idle");
    setPosition(null);
    setErrorMessage(null);
  }, [watchId]);

  // コンポーネントのアンマウント時にリソースを解放
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    position,
    status,
    errorMessage,
    startTracking,
    stopTracking,
    isTracking,
  };
}
