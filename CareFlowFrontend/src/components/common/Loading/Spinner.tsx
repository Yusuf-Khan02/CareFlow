import "./Loading.css";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  color?: "primary" | "white" | "muted";
}

export const Spinner = ({
  size = "md",
  className = "",
  color = "primary",
}: SpinnerProps) => {
  return (
    <div
      className={`careflow-spinner spinner-${size} spinner-${color} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

export default Spinner;
