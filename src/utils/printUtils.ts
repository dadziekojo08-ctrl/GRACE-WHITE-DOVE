/**
 * Print utility for Grace White Dove School Complex Management System.
 * Provides reliable, high-resolution printing for Report Cards, Invoices, Receipts, and ID Cards.
 * Fixes blank sheet issues by ensuring full rendering, correct viewport dimensions, font loading,
 * and high-fidelity print color adjustments.
 */

export function printReportSheet(elementId: string, title = 'Grace White Dove School Complex Report') {
  const targetElement = document.getElementById(elementId);

  if (!targetElement) {
    console.warn(`[printReportSheet] Element with ID "${elementId}" not found. Falling back to native print.`);
    window.print();
    return;
  }

  // Remove any stale print iframes from previous clicks
  const oldIframes = document.querySelectorAll('.gwd-print-sandbox-iframe');
  oldIframes.forEach((el) => el.remove());

  // Create an invisible, but full-size printing iframe.
  // CRITICAL: Must NOT use `visibility: hidden` or `display: none` or `width: 0; height: 0`
  // because browsers will skip pagination layout for hidden/0x0 iframes, resulting in a blank sheet.
  const iframe = document.createElement('iframe');
  iframe.className = 'gwd-print-sandbox-iframe';
  iframe.style.position = 'fixed';
  iframe.style.top = '0';
  iframe.style.left = '0';
  iframe.style.width = '100vw';
  iframe.style.height = '100vh';
  iframe.style.border = '0';
  iframe.style.opacity = '0.001';
  iframe.style.pointerEvents = 'none';
  iframe.style.zIndex = '-99999';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  // Collect all existing stylesheets & style blocks from the host document
  const headStyles: string[] = [];

  // Copy <link rel="stylesheet"> tags
  const links = document.querySelectorAll('link[rel="stylesheet"]');
  links.forEach((link) => {
    headStyles.push(link.outerHTML);
  });

  // Copy <style> tags (Tailwind & custom css)
  const styles = document.querySelectorAll('style');
  styles.forEach((style) => {
    headStyles.push(style.outerHTML);
  });

  // Clone the target element
  const clonedContent = targetElement.cloneNode(true) as HTMLElement;

  // Remove any interactive or no-print elements from the clone
  const noPrintElements = clonedContent.querySelectorAll('.no-print, [data-no-print], button');
  noPrintElements.forEach((btn) => btn.remove());

  // Construct printable HTML document with explicit, high-contrast print rules
  const printHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        ${headStyles.join('\n')}
        <style>
          @page {
            size: A4 portrait;
            margin: 6mm 7mm;
          }
          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            box-sizing: border-box !important;
          }
          html, body {
            background-color: #ffffff !important;
            background: #ffffff !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: 100% !important;
            overflow: hidden !important;
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif !important;
            font-size: 9.5pt !important;
            line-height: 1.3 !important;
            visibility: visible !important;
            display: block !important;
          }
          .font-\\[\\'Outfit\\'\\] {
            font-family: 'Outfit', sans-serif !important;
          }
          .no-print, [data-no-print], button {
            display: none !important;
          }
          .printable-container {
            width: 100% !important;
            max-width: 100% !important;
            height: 100% !important;
            margin: 0 auto !important;
            padding: 0 !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
          }

          /* Full-page single sheet styling for official report cards */
          .printable-sheet,
          .report-card-print-sheet {
            width: 100% !important;
            max-width: 100% !important;
            height: 283mm !important;
            max-height: 283mm !important;
            min-height: 280mm !important;
            margin: 0 !important;
            padding: 5mm 6mm !important;
            border: 2.5px solid #064e3b !important;
            border-radius: 8px !important;
            box-shadow: none !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
            overflow: hidden !important;
          }

          /* Compact & elegant tables for print */
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          th {
            padding: 4px 6px !important;
            font-size: 8.5pt !important;
            font-weight: 800 !important;
            line-height: 1.2 !important;
          }
          td {
            padding: 3.5px 6px !important;
            font-size: 8.5pt !important;
            line-height: 1.2 !important;
          }
          thead {
            display: table-header-group;
          }
          tfoot {
            display: table-footer-group;
          }
          img {
            max-width: 100% !important;
            height: auto !important;
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
        </style>
      </head>
      <body>
        <div class="printable-container">
          ${clonedContent.outerHTML}
        </div>
      </body>
    </html>
  `;

  doc.open();
  doc.write(printHtml);
  doc.close();

  // Trigger print after fonts and images have completed layout
  const triggerPrint = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.error('[printReportSheet] Error during iframe print:', e);
      window.print();
    } finally {
      // Clean up sandbox iframe after 2 minutes
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 120000);
    }
  };

  // Wait for document fonts to finish loading
  const readyPromise = (doc as any).fonts?.ready ? (doc as any).fonts.ready : Promise.resolve();

  readyPromise.then(() => {
    const images = doc.images;
    let loadedCount = 0;
    const totalImages = images.length;

    if (totalImages === 0) {
      setTimeout(triggerPrint, 250);
    } else {
      const onImgLoad = () => {
        loadedCount++;
        if (loadedCount >= totalImages) {
          setTimeout(triggerPrint, 200);
        }
      };

      for (let i = 0; i < totalImages; i++) {
        if (images[i].complete) {
          onImgLoad();
        } else {
          images[i].onload = onImgLoad;
          images[i].onerror = onImgLoad;
        }
      }

      // Safety timeout in case an image takes too long
      setTimeout(triggerPrint, 1200);
    }
  }).catch(() => {
    setTimeout(triggerPrint, 300);
  });
}
