

import { jsPDF } from 'jspdf';
import { Shotlist, ShotlistItem } from '../types';

export const downloadScriptAsPDF = (
    scriptText: string, 
    scriptTitle: string,
    authorName: string,
    logline: string | undefined,
    synopsis: string | undefined,
    fileName: string
) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxLineWidth = pageWidth - margin * 2;
    const fontSize = 12;
    const lineSpacing = 6;

    // --- Cover Page ---
    doc.setFont('Courier', 'bold');
    doc.setFontSize(18);
    
    // Manual underline for Courier font
    const titleText = scriptTitle.toUpperCase();
    const titleWidth = doc.getTextWidth(titleText);
    const titleX = (pageWidth - titleWidth) / 2;
    const titleY = pageHeight * 0.4;
    doc.text(titleText, titleX, titleY);
    doc.setLineWidth(0.5);
    doc.line(titleX, titleY + 1, titleX + titleWidth, titleY + 1);

    doc.setFont('Courier', 'normal');
    doc.setFontSize(12);
    const writtenByY = titleY + 20;
    doc.text('Written by', pageWidth / 2, writtenByY, { align: 'center' });
    const authorY = writtenByY + 10;
    doc.text(authorName, pageWidth / 2, authorY, { align: 'center' });

    // --- Script Pages ---
    doc.addPage();
    let pageNumber = 1;
    let cursorY = margin;

    const addPageNumber = () => {
        doc.setFontSize(10);
        doc.text(String(pageNumber), pageWidth - margin, margin / 2, { align: 'right' });
        doc.setFont('Courier', 'normal');
        doc.setFontSize(fontSize);
    };

    addPageNumber();

    const checkNewPage = (requiredHeight: number) => {
        if (cursorY + requiredHeight > pageHeight - margin) {
            doc.addPage();
            pageNumber++;
            addPageNumber();
            cursorY = margin;
        }
    };

    // Render Synopsis
    if (synopsis) {
        doc.setFont('Courier', 'bold');
        doc.setFontSize(14);
        let synopsisLines = doc.splitTextToSize("SINOPSIS", maxLineWidth);
        checkNewPage(synopsisLines.length * lineSpacing);
        doc.text("SINOPSIS", margin, cursorY);
        cursorY += lineSpacing * synopsisLines.length;

        doc.setFontSize(fontSize);
        doc.setFont('Courier', 'normal');
        cursorY += lineSpacing / 2;

        synopsisLines = doc.splitTextToSize(synopsis, maxLineWidth);
        checkNewPage(synopsisLines.length * lineSpacing);
        doc.text(synopsis, margin, cursorY, { maxWidth: maxLineWidth, align: 'justify' });
        cursorY += lineSpacing * synopsisLines.length;
        
        cursorY += lineSpacing; // Extra space after synopsis
    }
    
    // Render Script
    const scriptLines = scriptText.split('\n');

    for (const line of scriptLines) {
        const isSceneHeading = line.startsWith('**') && line.endsWith('**');
        const content = isSceneHeading ? line.substring(2, line.length - 2).trim() : line;

        const wrappedLines = doc.splitTextToSize(content, maxLineWidth);
        checkNewPage(wrappedLines.length * lineSpacing);

        if (isSceneHeading) {
            doc.setFont('Courier', 'bold');
            doc.text(content, margin, cursorY, { maxWidth: maxLineWidth, align: 'left' });
        } else {
            doc.setFont('Courier', 'normal');
            // Justify normal text lines
            doc.text(content, margin, cursorY, { maxWidth: maxLineWidth, align: 'justify' });
        }
        
        cursorY += wrappedLines.length * lineSpacing;
    }
    
    doc.save(fileName);
};


const parseSceneShot = (sceneShot: string): [string, string] => {
    if (!sceneShot || typeof sceneShot !== 'string') return ['', ''];
    const sceneMatch = sceneShot.match(/scene (\d+)/i);
    const shotMatch = sceneShot.match(/shot (\d+)/i);
    return [
        sceneMatch ? sceneMatch[1] : '',
        shotMatch ? shotMatch[1] : ''
    ];
};

export const downloadShotlistAsPDF = (
    shotlist: Shotlist,
    authorName: string, // Not used in this layout, but kept for consistency
    fileName: string
) => {
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    const { productionTitle, director, locations, items } = shotlist;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - margin * 2;
    
    // --- Calculate Totals ---
    const totalSeconds = items.reduce((acc, item) => {
        if (!item.duration || typeof item.duration !== 'string') return acc;
        const parts = item.duration.split(':').map(Number);
        let seconds = 0;
        if (parts.length === 3) { seconds = parts[0] * 3600 + parts[1] * 60 + parts[2]; } 
        else if (parts.length === 2) { seconds = parts[0] * 60 + parts[1]; }
        return acc + (isNaN(seconds) ? 0 : seconds);
    }, 0);
    const totalHours = Math.floor(totalSeconds / 3600);
    const totalMinutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;
    const totalTimeFormatted = `${String(totalHours).padStart(2, '0')}:${String(totalMinutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    
    const getSceneNumber = (sceneShot: string): number => {
        if (!sceneShot || typeof sceneShot !== 'string') return 0;
        const match = sceneShot.match(/scene (\d+)/i);
        return match ? parseInt(match[1], 10) : 0;
    };
    const totalScenes = new Set(items.map(item => getSceneNumber(item.sceneShot))).size;
    const currentDate = new Date().toLocaleDateString('en-GB');

    // --- Draw Header ---
    const metaY = margin + 10;
    doc.setFillColor(0, 0, 0);
    doc.rect(margin, margin, contentWidth, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text('Camera Shot List', margin + 3, margin + 7);
    
    doc.setFontSize(9);
    doc.text('Total Time', pageWidth - margin - 3, margin + 4, { align: 'right' });
    doc.setFontSize(10);
    doc.text(totalTimeFormatted, pageWidth - margin - 3, margin + 8, { align: 'right' });

    // --- Draw Metadata Box ---
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(margin, metaY, contentWidth, 20);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    const metaLeftX = margin + 3;
    const metaRightX = pageWidth - margin - 3;

    // Left side metadata
    doc.setFont('helvetica', 'bold');
    doc.text('Title:', metaLeftX, metaY + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(productionTitle, metaLeftX + doc.getTextWidth('Title:') + 2, metaY + 5);

    doc.setFont('helvetica', 'bold');
    doc.text('Director:', metaLeftX, metaY + 11);
    doc.setFont('helvetica', 'normal');
    doc.text(director, metaLeftX + doc.getTextWidth('Director:') + 2, metaY + 11);

    doc.setFont('helvetica', 'bold');
    doc.text('Locations:', metaLeftX, metaY + 17);
    doc.setFont('helvetica', 'normal');
    doc.text(locations, metaLeftX + doc.getTextWidth('Locations:') + 2, metaY + 17);
    
    // Right side metadata
    doc.setFont('helvetica', 'bold');
    doc.text('Sheet #', metaRightX, metaY + 5, { align: 'right' });

    const dateValueWidth = doc.getTextWidth(currentDate);
    doc.setFont('helvetica', 'normal');
    doc.text(currentDate, metaRightX, metaY + 11, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text('Date:', metaRightX - dateValueWidth - 2, metaY + 11, { align: 'right' });

    const totalScenesValueWidth = doc.getTextWidth(String(totalScenes));
    doc.setFont('helvetica', 'normal');
    doc.text(String(totalScenes), metaRightX, metaY + 17, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text('Total Scenes:', metaRightX - totalScenesValueWidth - 2, metaY + 17, { align: 'right' });

    // --- Draw Table Manually ---
    const tableY = metaY + 20;
    const headers = ['Scene', 'Shot', 'Shot Size', 'Movement', 'Gear', 'Location', 'EXT/INT', 'Notes', 'Preferred', 'Duration', 'Sound'];
    const colWidths = [15, 15, 26, 30, 30, 30, 15, 65, 18, 18, 15];
    
    const drawHeaders = (yPos: number) => {
        let xPos = margin;
        doc.setFillColor(230, 230, 230);
        doc.rect(margin, yPos, contentWidth, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.setLineWidth(0.2);

        headers.forEach((header, i) => {
            doc.rect(xPos, yPos, colWidths[i], 8);
            doc.text(header, xPos + colWidths[i] / 2, yPos + 5, { align: 'center', maxWidth: colWidths[i] - 2 });
            xPos += colWidths[i];
        });
    };

    drawHeaders(tableY);

    // Draw table rows
    let currentY = tableY + 8;
    const minRowHeight = 7; // Sensible minimum height for one line
    const textLineHeight = 5; // The height of each line of text.
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    items.forEach(item => {
        const [scene, shot] = parseSceneShot(item.sceneShot);
        const rowData = [
            scene, shot, item.shotSize, item.movement, item.gear,
            item.location, item.extInt, item.notes, item.preferred ? 'yes' : 'no', item.duration, item.sound ? 'yes' : 'no'
        ];
        
        // Calculate the required height for this row based on text wrapping
        let maxLines = 1;
        rowData.forEach((cell, i) => {
            const textLines = doc.splitTextToSize(String(cell), colWidths[i] - 4);
            if (textLines.length > maxLines) {
                maxLines = textLines.length;
            }
        });
        
        const currentRowHeight = Math.max(minRowHeight, maxLines * textLineHeight);
        
        // Check for page break
        if (currentY + currentRowHeight > pageHeight - margin - 4) { // -4 for the final bar
            doc.addPage();
            currentY = margin;
            drawHeaders(currentY);
            currentY += 8;
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        
        // Draw the row with the calculated height
        let currentX = margin;
        rowData.forEach((cell, i) => {
            doc.rect(currentX, currentY, colWidths[i], currentRowHeight);
            
            const align = (i === 0 || i === 1 || i >= 8) ? 'center' : 'left';
            const textX = (i === 0 || i === 1 || i >= 8) ? currentX + colWidths[i] / 2 : currentX + 2;
            
            const textLines = doc.splitTextToSize(String(cell), colWidths[i] - 4);
            // Vertically align top with a small padding
            doc.text(textLines, textX, currentY + 2, { align: align, baseline: 'top', maxWidth: colWidths[i] - 4 });
            currentX += colWidths[i];
        });
        
        currentY += currentRowHeight;
    });

    // Draw final colored bar
    doc.setFillColor(72, 207, 207); // Teal color
    doc.rect(margin, currentY, contentWidth, 4, 'F');

    doc.save(fileName);
};