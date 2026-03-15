"use client";

import React, { useState } from "react";

export default function QrCodePage() {
  const [text, setText] = useState("");
  const [qrUrl, setQrUrl] = useState("");

  const generateQRCode = () => {
    if (!text) {
      setQrUrl("");
      return;
    }
    // Using a free QR Code API for simplicity without adding new npm packages
    const encodedUrl = encodeURIComponent(text);
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodedUrl}`);
  };

  return (
    <div className="max-w-md mx-auto p-6 rounded-xl shadow-lg border border-opacity-20 border-current bg-white/10 backdrop-blur-sm">
      <h1 className="text-2xl font-bold mb-6 text-center">QRコード生成</h1>

      <div className="mb-6 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2 opacity-80">テキストまたはURL</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-3 rounded-lg bg-black/10 border-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://google.com/"
          />
        </div>
        
        <button
          onClick={generateQRCode}
          className="w-full py-3 rounded-lg bg-blue-500/80 hover:bg-blue-600/80 text-white font-bold transition-colors"
        >
          生成する
        </button>
      </div>

      {qrUrl && (
        <div className="mt-8 flex flex-col items-center">
          <div className="p-4 bg-white rounded-xl mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl} alt="QR Code" width={250} height={250} />
          </div>
          <a
            href={qrUrl}
            download="qrcode.png"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-2 rounded-lg bg-black/20 hover:bg-black/30 transition-colors text-sm font-bold"
          >
            画像を保存
          </a>
        </div>
      )}
    </div>
  );
}
