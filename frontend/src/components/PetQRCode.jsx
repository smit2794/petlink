import React from "react";
import { QRCodeSVG } from "qrcode.react";

// The real, publicly reachable base URL where scans should resolve.
// Falls back to localhost only for local development testing.
const PUBLIC_BASE_URL = import.meta.env.VITE_PUBLIC_URL || "http://localhost:5173";

const PetQRCode = ({ animalId, size = 70 }) => {
    const scanUrl = `${PUBLIC_BASE_URL}/scan/${animalId}`;

    return (
        <div style={{ backgroundColor: "#F7F5F0", padding: "6px", borderRadius: "6px", border: "1px solid var(--border-color)", display: "inline-flex" }}>
            <QRCodeSVG value={scanUrl} size={size} bgColor="#F7F5F0" fgColor="var(--primary-color)" level="M" />
        </div>
    );
};

export default PetQRCode;