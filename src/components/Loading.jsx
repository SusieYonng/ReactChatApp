import "./Loading.css";

function Loading({ overlay = false, children }) {
  return (
    <div className={`loading-container ${overlay ? "overlay" : ""}`}>
      <div className="loading-spinner" />
      {children && <p>{children}</p>}
    </div>
  );
}

export default Loading;
