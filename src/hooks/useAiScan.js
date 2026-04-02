import { useState } from 'react';

const MODEL_FALLBACKS = ['gemini-flash-latest', 'gemini-1.5-flash-8b'];

export function useAiScan(apiKey) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const [scanDetail, setScanDetail] = useState('');
  const [scanResults, setScanResults] = useState([]);

  const compressImage = async (file, maxWidth = 900) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/webp', 0.6).split(',')[1]);
      };
    });
  };

  const handleScan = async (file) => {
    if (!apiKey) return alert("API anahtarı bulunamadı.");
    setIsScanning(true);
    setScanStatus("Görüntü Hazırlanıyor...");
    setScanDetail("Sıkıştırılıyor (WebP)...");

    try {
      const compressedBase64 = await compressImage(file);
      let success = false;
      let lastError = "";

      for (let model of MODEL_FALLBACKS) {
        setScanStatus("Buluta Gönderiliyor...");
        setScanDetail(`${model.split('-').pop()} deneniyor...`);
        
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              contents: [{ 
                parts: [
                  { text: "Analyze this image and identify all items that could be part of a shopping list. Return a JSON array of objects with 'title', 'qty', and 'brand' keys. Use Turkish for titles." },
                  { inline_data: { mime_type: 'image/webp', data: compressedBase64 } }
                ]
              }],
              generationConfig: { responseMimeType: "application/json" }
            })
          });
          
          const data = await response.json();
          if (data.error) throw new Error(data.error.message);
          
          setScanStatus("Analiz Tamamlandı!");
          const text = data.candidates[0].content.parts[0].text;
          const items = JSON.parse(text).map(i => ({ ...i, selected: true }));
          setScanResults(items);
          success = true;
          break;
        } catch (e) {
          console.error(`Model ${model} failed:`, e);
          lastError = e.message;
        }
      }

      if (!success) throw new Error(lastError || "Tüm modeller meşgul görünüyor.");
    } catch (e) {
      console.error("AI Error:", e);
      alert(`Hata: ${e.message}`);
      setIsScanning(false);
    }
  };

  return {
    isScanning,
    scanStatus,
    scanDetail,
    scanResults,
    setScanResults,
    handleScan,
    resetScan: () => {
      setIsScanning(false);
      setScanResults([]);
    }
  };
}
