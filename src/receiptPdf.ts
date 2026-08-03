import jsPDF from "jspdf";
import QRCode from "qrcode";
import govTrackLogo from "./assets/govtrack-logo-transparent.png";
import { activeProcesses } from "./data";
import { formatDate } from "./store";
import type { RequestRecord } from "./types";

const imageDataUrl = async (url: string) => {
  const blob = await fetch(url).then((response) => response.blob());
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const whiteImageDataUrl = async (url: string) => {
  const source = await imageDataUrl(url);
  return await new Promise<string>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d");
      if (!context) return reject(new Error("Unable to prepare logo"));
      context.drawImage(image, 0, 0);
      context.globalCompositeOperation = "source-in";
      context.fillStyle = "#FFFFFF";
      context.fillRect(0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = reject;
    image.src = source;
  });
};

export const getStatusUrl = (request: RequestRecord) =>
  `${window.location.origin}/status?serial=${
    encodeURIComponent(request.serialCode)
  }`;

export const createTrackingQr = (request: RequestRecord) =>
  QRCode.toDataURL(getStatusUrl(request), {
    width: 480,
    margin: 1,
    color: { dark: "#0B2E8A", light: "#FFFFFF" },
  });

export async function downloadReceipt(request: RequestRecord) {
  const [logo, qrCode] = await Promise.all([
    whiteImageDataUrl(govTrackLogo),
    createTrackingQr(request),
  ]);
  const pdf = new jsPDF();
  pdf.setFillColor(11, 46, 138);
  pdf.rect(0, 0, 210, 43, "F");
  pdf.setFillColor(214, 31, 58);
  pdf.rect(0, 43, 210, 2.5, "F");
  pdf.addImage(logo, "PNG", 16, 9, 45, 23);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.text("SERVICE RECEIPT", 194, 19, { align: "right" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text(request.serialCode, 194, 27, { align: "right" });

  pdf.setTextColor(11, 46, 138);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text("Government Service Record", 16, 61);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(88, 105, 148);
  pdf.text(
    "Keep this receipt and scan the QR code to track this service.",
    16,
    68,
  );

  pdf.setFillColor(246, 248, 252);
  pdf.roundedRect(15, 77, 180, 54, 3, 3, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(11, 46, 138);
  pdf.setFontSize(8);
  pdf.text("SERIAL CODE", 23, 89);
  pdf.setFontSize(20);
  pdf.text(request.serialCode, 23, 101);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(88, 105, 148);
  pdf.text(`Generated ${formatDate(request.dateSubmitted)}`, 23, 109);
  pdf.addImage(qrCode, "PNG", 143, 81, 45, 45);

  const entries = [
    ["Service", request.processName],
    ["Assigned agency", request.agency],
    ["Current status", request.status],
    ["Estimated processing", activeProcesses[request.processId].estimate],
  ];
  let y = 147;
  entries.forEach(([label, value]) => {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(88, 105, 148);
    pdf.text(label.toUpperCase(), 17, y);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(15, 31, 85);
    pdf.text(value, 17, y + 7, { maxWidth: 176 });
    y += value.length > 70 ? 24 : 19;
  });

  pdf.setFillColor(214, 31, 58);
  pdf.rect(0, 267, 210, 2.5, "F");
  pdf.setFillColor(11, 46, 138);
  pdf.rect(0, 269.5, 210, 27.5, "F");
  pdf.setFontSize(8);
  pdf.setTextColor(255, 255, 255);
  pdf.text("Government processes, made easy.", 16, 284);
  pdf.text("Scan the QR code above to view the latest status.", 194, 284, {
    align: "right",
  });
  pdf.save(`${request.serialCode}-receipt.pdf`);
}
