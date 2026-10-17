import "./StatCard.css";

interface StatCardProps{
title : string;
value : number;
description : string;
}

function StatCard({
  title,
  value,
  description,
}: StatCardProps){
  return (
    <div className="stat-card">
        <p className="stat-card-title">
            {title}
        </p>
        <h3 className="stat-card-value">
            {value}
        </h3>
        <p className="stat-card-description">
            {description}
        </p>


    </div>
  )
}

export default StatCard