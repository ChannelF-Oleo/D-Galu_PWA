import React from "react";
import { TrendingUp } from "lucide-react";
import "./StatCard.css";

const StatCard = ({ title, value, icon: Icon, color, trend }) => {
  return (
    <div className="stat-card-container">
      <div
        className="stat-icon-wrapper"
        style={{ backgroundColor: color }}
      >
        <Icon size={24} />
      </div>
      <div>
        <p className="stat-title">{title}</p>
        <h3 className="stat-value">{value}</h3>
        {trend && (
          <span className="stat-trend">
            <TrendingUp size={10} /> {trend}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;