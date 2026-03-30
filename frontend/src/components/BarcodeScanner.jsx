import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

const CATEGORY_MAP = {
  // Dairy
  "en:dairies": "dairy", "en:milks": "dairy", "en:cheeses": "dairy",
  "en:yogurts": "dairy", "en:butters": "dairy", "en:creams": "dairy",
  // Meat & protein
  "en:meats": "meat", "en:poultry": "meat", "en:beef": "meat",
  "en:pork": "meat", "en:seafoods": "meat", "en:fishes": "meat",
  "en:eggs": "meat",
  // Produce
  "en:fruits": "produce", "en:vegetables": "produce",
  "en:fruits-and-vegetables-based-foods": "produce",
  "en:fresh-foods": "produce", "en:salads": "produce",
  // Grains
  "en:cereals-and-potatoes": "grains", "en:breads": "grains",
  "en:pastas": "grains", "en:cereals": "grains", "en:rice": "grains",
  "en:noodles": "grains", "en:tortillas": "grains",
  // Beverages
  "en:beverages": "beverages", "en:waters": "beverages",
  "en:juices": "beverages", "en:sodas": "beverages",
  "en:bebidas": "beverages", "en:refrescos": "beverages",
  "en:teas": "beverages", "en:coffees": "beverages",
  // Snacks
  "en:snacks": "snacks", "en:salty-snacks": "snacks",
  "en:chips-and-fries": "snacks", "en:crisps": "snacks",
  "en:cookies": "snacks", "en:chocolates": "snacks",
  "en:candies": "snacks", "en:nuts": "snacks",
  // Frozen
  "en:frozen-foods": "frozen", "en:frozen-pizzas": "frozen",
  "en:ice-creams-and-sorbets": "frozen",
  // Canned
  "en:canned-foods": "canned", "en:canned-vegetables": "canned",
  "en:canned-fruits": "canned", "en:soups": "canned",
  // Condiments
  "en:condiments": "condiments", "en:sauces": "condiments",
  "en:dressings": "condiments", "en:spices": "condiments",
  "en:ketchup": "condiments", "en:mustards": "condiments",
  "en:mayonnaises": "condiments",
  // Catch-all
  "en:plant-based-foods-and-beverages": "produce",
  "en:plant-based-foods": "produce",
};

function mapCategory(categories = []) {
  // Check most specific tags first (they come later in the array)
  for (let i = categories.length - 1; i >= 0; i--) {
    if (CATEGORY_MAP[categories[i]]) return CATEGORY_MAP[categories[i]];
  }
  return "other";
}

function parseQuantity(quantityStr) {
  if (!quantityStr) return { quantity: 1, unit: "unit" };
  // Match patterns like "5.2 oz", "355 ml", "1L", "500g"
  const match = quantityStr.match(/^([\d.]+)\s*(.+)$/);
  if (match) {
    return { quantity: parseFloat(match[1]), unit: match[2].trim() };
  }
  return { quantity: 1, unit: quantityStr };
}

export default function BarcodeScanner({ onResult, onClose }) {
  const [status, setStatus] = useState("Starting camera...");
  const [lastCode, setLastCode] = useState(null);
  const scannerRef = useRef(null);
  const isRunningRef = useRef(false);
  const isMountedRef = useRef(true);
  const containerId = useRef(`scanner-${Date.now()}`);

  const cleanup = async () => {
    if (scannerRef.current && isRunningRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {
        // ignore
      }
      isRunningRef.current = false;
    }
    try {
      scannerRef.current?.clear();
    } catch {
      // ignore
    }
    scannerRef.current = null;
  };

  const handleClose = async () => {
    await cleanup();
    onClose();
  };

  const lookupAndClose = async (code) => {
    if (!isMountedRef.current) return;
    setLastCode(code);
    setStatus(`Found ${code} — looking up...`);

    // Stop scanner first
    if (scannerRef.current && isRunningRef.current) {
      try {
        await scannerRef.current.stop();
        isRunningRef.current = false;
      } catch {
        // ignore
      }
    }

    try {
      const res = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${code}?fields=product_name,brands,quantity,categories_tags`
      );
      const data = await res.json();

      if (!isMountedRef.current) return;

      if (data.status === 1 && data.product?.product_name) {
        const p = data.product;
        const name = p.brands
          ? `${p.product_name} (${p.brands})`
          : p.product_name;

        const parsed = parseQuantity(p.quantity);
        await cleanup();
        onResult({
          name,
          category: mapCategory(p.categories_tags || []),
          quantity: parsed.quantity,
          unit: parsed.unit,
        });
        return;
      }

      setStatus(`Not found for ${code}. Try another.`);
      setLastCode(null);
    } catch {
      if (!isMountedRef.current) return;
      setStatus("Lookup failed. Try again.");
      setLastCode(null);
    }

    // Restart scanner
    if (isMountedRef.current && scannerRef.current && !isRunningRef.current) {
      try {
        await scannerRef.current.start(
          { facingMode: "environment" },
          { fps: 5, qrbox: { width: 250, height: 150 }, aspectRatio: 1.333 },
          () => {},
          () => {}
        );
        isRunningRef.current = true;
        setStatus("Point camera at a barcode");
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    let initTimeout;

    const init = async () => {
      // Wait for DOM
      await new Promise((r) => { initTimeout = setTimeout(r, 300); });
      if (!isMountedRef.current) return;

      const el = document.getElementById(containerId.current);
      if (!el) {
        setStatus("Scanner container not found.");
        return;
      }

      const scanner = new Html5Qrcode(containerId.current, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
        ],
        verbose: false,
      });
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 5,
            qrbox: { width: 250, height: 150 },
            aspectRatio: 1.333,
            disableFlip: false,
          },
          (decodedText) => {
            if (isMountedRef.current && !lastCode) {
              lookupAndClose(decodedText);
            }
          },
          () => {
            // ignore scan failures (no barcode in frame)
          }
        );
        isRunningRef.current = true;
        if (isMountedRef.current) {
          setStatus("Point camera at a barcode");
        }
      } catch (err) {
        if (isMountedRef.current) {
          setStatus(`Camera error: ${err?.message || err}`);
        }
      }
    };

    init();

    return () => {
      isMountedRef.current = false;
      clearTimeout(initTimeout);
      if (scannerRef.current && isRunningRef.current) {
        scannerRef.current.stop().catch(() => {});
        isRunningRef.current = false;
      }
      try {
        scannerRef.current?.clear();
      } catch {
        // ignore
      }
    };
  }, []);

  return (
    <div className="scanner-overlay" onClick={handleClose}>
      <div className="scanner-modal" onClick={(e) => e.stopPropagation()}>
        <div className="scanner-header">
          <strong>Scan Barcode</strong>
          <button className="btn-danger btn-sm" onClick={handleClose}>Close</button>
        </div>
        <div className="scanner-video-wrap">
          <div id={containerId.current} className="scanner-reader" />
        </div>
        <p className="scanner-status">{status}</p>
      </div>
    </div>
  );
}
