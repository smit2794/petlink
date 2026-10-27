import React, { useRef, useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download } from "lucide-react";
import client from "../api/client";
import { getScanUrl } from "../utils/publicUrl";

const PetQRCode = ({ animalId, tokenId: tokenIdProp, size = 80, showDownload = false }) => {
    const [resolvedTokenId, setResolvedTokenId] = useState(tokenIdProp || null);
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState(null);
    const wrapperRef = useRef(null);

    // Auto-resolve token from animalId if no tokenId was explicitly passed
    useEffect(() => {
        if (tokenIdProp) {
            setResolvedTokenId(tokenIdProp);
        }
        let cancelled = false;
        const lookupId = tokenIdProp || animalId;
        if (!lookupId) return;

        client.get(`/tokens/by-animal/${animalId || tokenIdProp}`)
            .then((res) => {
                if (!cancelled) {
                    if (res.data.tokenId) setResolvedTokenId(res.data.tokenId);
                    if (res.data.qrCodeDataUrl) setQrCodeDataUrl(res.data.qrCodeDataUrl);
                }
            })
            .catch(() => {
                if (!cancelled && !tokenIdProp) setResolvedTokenId(null);
            });
        return () => { cancelled = true; };
    }, [animalId, tokenIdProp]);

    // Prefer token-based URL when available, fall back to animal ID
    const scanId = resolvedTokenId || animalId;
    const scanUrl = getScanUrl(scanId);

    const handleDownload = () => {
        if (qrCodeDataUrl) {
            const link = document.createElement("a");
            link.href = qrCodeDataUrl;
            link.download = `petlink-qr-${scanId}.png`;
            link.click();
            return;
        }

        const svgElement = wrapperRef.current.querySelector("svg");
        if (!svgElement) return;
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
            ctx.fillStyle = "#1D1311";
            ctx.font = "bold 12px monospace";
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
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <div
                ref={wrapperRef}
                style={{
                    backgroundColor: "#FFFFFF",
                    padding: "8px",
                    borderRadius: "12px",
                    border: "1.5px solid #E5E7EB",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                <QRCodeSVG
                    value={scanUrl}
                    size={size}
                    bgColor="#FFFFFF"
                    fgColor="#1D1311"
                    level="M"
                />
            </div>
            <code style={{ fontSize: "0.8rem", fontWeight: 800, color: "#3730A3", fontFamily: "monospace" }}>
                {scanId}
            </code>
            {showDownload && (
                <button
                    type="button"
                    onClick={handleDownload}
                    className="btn btn-outline btn-sm"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "0.75rem",
                        padding: "5px 12px",
                        borderRadius: "8px",
                        color: "#4F46E5",
                        borderColor: "#C7D2FE",
                        backgroundColor: "#EEF2FF"
                    }}
                >
                    <Download size={13} /> Save QR Tag
                </button>
            )}
        </div>
    );
};

export default PetQRCode;