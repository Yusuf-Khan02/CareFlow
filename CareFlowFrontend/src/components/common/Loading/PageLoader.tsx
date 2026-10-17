import Spinner from "./Spinner";
import "./Loading.css";

export const PageLoader = ({ message = "Loading CareFlow Operations..." }: { message?: string }) => {
  return (
    <div className="page-loader-container">
      <div className="page-loader-box">
        <div className="page-loader-brand">
          <div className="page-loader-icon">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              <path d="M12 5v6" />
              <path d="M9 8h6" />
            </svg>
          </div>
          <span className="page-loader-title">CareFlow</span>
        </div>
        <Spinner size="lg" color="primary" />
        <p className="page-loader-message">{message}</p>
      </div>
    </div>
  );
};

export default PageLoader;
