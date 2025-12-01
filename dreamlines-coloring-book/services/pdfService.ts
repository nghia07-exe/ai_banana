import { jsPDF } from "jspdf";
import { GeneratedImage } from "../types";

export const generateBookPDF = (images: GeneratedImage[], title: string, childName: string) => {
  // A4 size in mm: 210 x 297
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // --- COVER PAGE ---
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(32);
  doc.setTextColor(50, 50, 50);
  const titleLines = doc.splitTextToSize(`${title} Coloring Book`, pageWidth - 40);
  doc.text(titleLines, pageWidth / 2, 60, { align: "center" });

  // Subtitle / Dedication
  doc.setFont("helvetica", "normal");
  doc.setFontSize(24);
  doc.setTextColor(100, 100, 100);
  doc.text(`Created especially for`, pageWidth / 2, 100, { align: "center" });
  
  doc.setFont("helvetica", "bolditalic");
  doc.setFontSize(40);
  doc.setTextColor(14, 165, 233); // Brand color
  doc.text(childName, pageWidth / 2, 120, { align: "center" });

  // Decorative Date
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 30, { align: "center" });

  // --- IMAGE PAGES ---
  images.forEach((img, index) => {
    doc.addPage();
    
    // Add border/frame
    const margin = 20;
    const boxSize = pageWidth - (margin * 2);
    
    // Image
    // Maintain 1:1 aspect ratio inside the A4 page
    // Center it vertically and horizontally
    const x = margin;
    const y = (pageHeight - boxSize) / 2;

    try {
        doc.addImage(img.dataUrl, "PNG", x, y, boxSize, boxSize);
    } catch (e) {
        console.warn("Could not add image to PDF", e);
    }

    // Page Number
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Page ${index + 1}`, pageWidth / 2, pageHeight - 10, { align: "center" });
  });

  doc.save(`${childName.replace(/\s+/g, '_')}_Coloring_Book.pdf`);
};
