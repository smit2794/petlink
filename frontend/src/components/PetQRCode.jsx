import React, { useRef, useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download } from "lucide-react";
import client from "../api/client";

const PUBLIC_BASE_URL = import.meta.env.VITE_PUBLIC_URL || "http://localhost:5173";

const PetQRCode = ({ animalId, tokenId: tokenIdProp, size = 70, showDownload = false }) => {
    // If a tokenId is explicitly passed, use it; otherwise try to look up the linked token
    const [resolvedTokenId, setResolvedTokenId] = useState(tokenIdProp || null);
    const wrapperRef = useRef(null);

    // Auto-resolve token from animalId if no tokenId prop was provided
    useEffect(() => {
        if (tokenIdProp) {
            setResolvedTokenId(tokenIdProp);
            return;
        }
        // Try to fetch the linked token for this animal
        let cancelled = false;
        client.get(`/tokens/by-animal/${animalId}`)
            .then((res) => {
                if (!cancelled) setResolvedTokenId(res.data.tokenId);
            })
            .catch(() => {
                // No token linked — use legacy animal ID (fine)
                if (!cancelled) setResolvedTokenId(null);
            });
        return () => { cancelled = true; };
    }, [animalId, tokenIdProp]);

    // Prefer token-based URL when available, fall back to animal ID
    const scanId = resolvedTokenId || animalId;
    const scanUrl = `${PUBLIC_BASE_URL}/scan/${scanId}`;

    const handleDownload = () => {
        const svgElement = wrapperRef.current.querySelector("svg");
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const canvas = document.createElement("canvas");
        const padding = 20;
        canvas.width = size + padding * 2;
        canvas.height = size + padding * 2 + 30; // extra space for ID text
        const ctx = canvas.getContext("2d");

        const img = new Image();
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, padding, padding, size, size);
            ctx.fillStyle = "#1a1a1a";
            ctx.font = "bold 12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(scanId, canvas.width / 2, size + padding + 20);
            URL.revokeObjectURL(url);

            const pngUrl = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = pngUrl;
            link.download = `petlink-qr-${scanId}.png`;
            link.click();
        };
        img.src = url;
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <div ref={wrapperRef} style={{ backgroundColor: "#F7F5F0", padding: "6px", borderRadius: "6px", border: "1px solid var(--border-color)", display: "inline-flex" }}>
                <QRCodeSVG value={scanUrl} size={size} bgColor="#F7F5F0" fgColor="var(--primary-color)" level="M" />
            </div>
            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", fontFamily: "monospace" }}>
                {scanId}
            </span>
            {showDownload && (
                <button
                    type="button"
                    onClick={handleDownload}
                    className="btn btn-outline btn-sm"
                    style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", padding: "6px 12px" }}
                >
                    <Download size={14} /> Download QR
                </button>
            )}
        </div>
    );
};

export default PetQRCode;