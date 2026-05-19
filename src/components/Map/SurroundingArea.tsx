import React from "react";
import { Trees, Car, Compass, Navigation } from "lucide-react";
import "./SurroundingArea.css";

/**
 * 店舗周辺の環境（北側の遊歩道、南側の駐車場、道路等）を視覚的に表現する背景レイヤー。
 * 既存のマップ画像（StoreMap）の背後に配置され、広域ガイドとしての役割を果たす。
 */
export const SurroundingArea: React.FC = () => {
  return (
    <div className="surrounding-area">
      {/* 🧭 北を示す方位磁針 */}
      <div className="surrounding-compass">
        <Compass size={16} />
        <span>N</span>
      </div>

      {/* 🌳 北側：若葉台遊歩道（散策路） */}
      <div className="surrounding-north">
        <div className="greenery-strip" />
        <div className="walkway-path">
          <Trees size={14} className="icon-trees" />
          <span>若葉台遊歩道 (緑豊かな散策路)</span>
        </div>
        {/* 遊歩道沿いの木々のビジュアル装飾 */}
        <div className="tree-decorations">
          <span className="tree-emoji">🌳</span>
          <span className="tree-emoji">🌲</span>
          <span className="tree-emoji">🌳</span>
          <span className="tree-emoji">🌲</span>
        </div>
      </div>

      {/* 🚗 南側：広大な駐車場エリア */}
      <div className="surrounding-south">
        {/* 駐車場の区画線（CSSのグラデーションで軽量描画） */}
        <div className="parking-lots">
          <div className="parking-row" />
          <div className="parking-row" />
        </div>
        
        <div className="parking-banner">
          <Car size={14} className="icon-car" />
          <span>お客様駐車場 (約605台収容・店舗利用で無料)</span>
        </div>
        
        <div className="parking-notes">
          ※南側道路および遊歩道からの車両進入はできません。専用入口をご利用ください。
        </div>
      </div>

      {/* 🛣️ 西・東側：周辺道路および駅方向案内 */}
      <div className="surrounding-roads">
        <div className="road-west">
          <div className="road-label">若葉台通り</div>
          <div className="station-guide">
            <Navigation size={12} className="icon-nav-west" />
            <span>至 若葉台駅 (徒歩約5分)</span>
          </div>
        </div>
        <div className="road-east">
          <div className="road-label">鶴川街道方面 →</div>
        </div>
      </div>

      {/* ⚠️ 境界線とエリア外注釈 */}
      <div className="area-boundary-label north-boundary">
        <span>⚠ これより先は店舗外（若葉台遊歩道エリア）です</span>
      </div>
      <div className="area-boundary-label south-boundary">
        <span>⚠ これより先は店舗外（駐車場エリア）です</span>
      </div>
    </div>
  );
};
