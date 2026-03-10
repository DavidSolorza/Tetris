import React from "react";

function PopupMessage({ text }) {
  return (
    <div className="popup-message">
      <div className="popup-bubble">{text}</div>
    </div>
  );
}

export default PopupMessage;

