import "./Loading.css";

export interface SkeletonProps {
  variant?: "text" | "rectangular" | "circular" | "card";
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
}

export const Skeleton = ({
  variant = "text",
  width,
  height,
  className = "",
  count = 1,
}: SkeletonProps) => {
  const items = Array.from({ length: count });

  return (
    <>
      {items.map((_, i) => (
        <div
          key={i}
          className={`careflow-skeleton skeleton-${variant} ${className}`}
          style={{
            width: typeof width === "number" ? `${width}px` : width,
            height: typeof height === "number" ? `${height}px` : height,
          }}
          aria-hidden="true"
        />
      ))}
    </>
  );
};

export default Skeleton;
