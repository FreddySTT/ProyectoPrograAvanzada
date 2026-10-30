import React, { useState, useEffect } from "react";
import { Icon } from "../../atoms/Icon/Icon";
import { Badge } from "../../atoms/Badge/Badge";
import type { PlaceItem } from "../../../types/auth";

interface PaymentModalProps {
  isOpen: boolean;
  place: PlaceItem | null;
  onClose: () => void;
  onSuccess: (bookingData: any) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  place,
  onClose,
  onSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<"qr" | "card" | "cash">("qr");
  const [travelersCount, setTravelersCount] = useState<number>(2);

  // Add-ons
  const [addGuide, setAddGuide] = useState<boolean>(true);
  const [addTransport, setAddTransport] = useState<boolean>(false);
  const [addLunch, setAddLunch] = useState<boolean>(true);

  // Billing Form
  const [clientName, setClientName] = useState<string>("Freddy Tejerina");
  const [clientCI, setClientCI] = useState<string>("8765432-CBBA");
  const [clientEmail, setClientEmail] = useState<string>("freddy@riqsirutas.bo");
  const [clientPhone, setClientPhone] = useState<string>("+591 700 12345");

  // Card Form & 3D Flip
  const [cardNumber, setCardNumber] = useState<string>("4532 8920 1234 5678");
  const [cardHolder, setCardHolder] = useState<string>("FREDDY TEJERINA");
  const [cardExpiry, setCardExpiry] = useState<string>("12/28");
  const [cardCvv, setCardCvv] = useState<string>("789");
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);

  // Promo Code
  const [couponCode, setCouponCode] = useState<string>("");
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent: number } | null>(null);
  const [couponError, setCouponError] = useState<string>("");

  // Processing & Success Receipt State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);

  // Countdown timer for QR (10:00)
  const [qrSecondsLeft, setQrSecondsLeft] = useState<number>(600);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setConfirmedBooking(null);
      setIsProcessing(false);
      setQrSecondsLeft(600);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || paymentMethod !== "qr" || qrSecondsLeft <= 0) return;
    const interval = setInterval(() => {
      setQrSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, paymentMethod, qrSecondsLeft]);

  if (!isOpen || !place) return null;

  // Pricing calculations
  const basePricePerPerson = 85; // Bs.
  const subtotalExperiences = basePricePerPerson * travelersCount;
  const guideFee = addGuide ? 50 : 0;
  const transportFee = addTransport ? 40 * travelersCount : 0;
  const lunchFee = addLunch ? 35 * travelersCount : 0;
  const rawTotal = subtotalExperiences + guideFee + transportFee + lunchFee;

  const discountAmount = appliedDiscount ? Math.round(rawTotal * (appliedDiscount.percent / 100)) : 0;
  const finalTotalBob = Math.max(rawTotal - discountAmount, 0);
  const finalTotalUsd = (finalTotalBob / 6.96).toFixed(2);

  const applyCoupon = () => {
    setCouponError("");
    const clean = couponCode.trim().toUpperCase();
    if (clean === "COCHABAMBA2026") {
      setAppliedDiscount({ code: "COCHABAMBA2026", percent: 20 });
    } else if (clean === "RIQSI10") {
      setAppliedDiscount({ code: "RIQSI10", percent: 10 });
    } else if (clean === "BIENVENIDO") {
      setAppliedDiscount({ code: "BIENVENIDO", percent: 15 });
    } else {
      setCouponError("Cupón inválido. Prueba con 'COCHABAMBA2026' o 'RIQSI10'.");
    }
  };

  const handleProcessPayment = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const bookingData = {
        bookingCode: `RQ-${Math.floor(100000 + Math.random() * 900000)}`,
        placeTitle: place.title,
        placeArea: place.area,
        placeImage: place.image,
        travelers: travelersCount,
        totalBob: finalTotalBob,
        totalUsd: finalTotalUsd,
        paymentMethod: paymentMethod === "qr" ? "QR Simple Bolivia" : paymentMethod === "card" ? "Tarjeta Visa/Mastercard" : "Efectivo / Transferencia",
        clientName,
        clientCI,
        clientEmail,
        clientPhone,
        date: new Date().toLocaleDateString("es-BO", { day: "numeric", month: "long", year: "numeric" }),
      };

      setConfirmedBooking(bookingData);
      setIsProcessing(false);
      onSuccess(bookingData);
    }, 1800);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl border border-[#E2D9CC] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <header className="px-6 py-4 bg-gradient-to-r from-[#1E293B] via-[#0F172A] to-[#1E293B] text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#D81B60] text-white shadow-md">
              <Icon name="ticket" size={20} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-subtitle text-base sm:text-lg font-extrabold text-white">
                  Pasarela de Pago Segura
                </h2>
                <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold">
                  SSL 256-Bit
                </span>
              </div>
              <p className="text-xs text-white/70">
                Reserva oficial para turismo & experiencias en Cochabamba
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
            title="Cerrar ventana"
          >
            <Icon name="close" size={18} />
          </button>
        </header>

        {/* Content Body: if confirmed, show Receipt; else show Checkout */}
        {confirmedBooking ? (
          <div className="p-6 sm:p-10 overflow-y-auto flex-1 flex flex-col items-center text-center animate-in zoom-in-95 duration-250">
            {/* Success Check Animation */}
            <div className="grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-emerald-600 shadow-xl mb-4 border-4 border-emerald-200">
              <Icon name="check" size={40} />
            </div>

            <Badge variant="success" size="lg" className="mb-2">
              ¡Pago y Reserva Confirmados!
            </Badge>

            <h3 className="font-subtitle text-2xl sm:text-3xl font-extrabold text-[#37474F] mt-1">
              Código de Reserva: <span className="text-[#D81B60]">{confirmedBooking.bookingCode}</span>
            </h3>

            <p className="mt-2 text-sm text-[#6D4C41] max-w-md">
              Hemos emitido tu comprobante oficial. Se ha enviado una copia digital con código QR a tu correo <strong>{confirmedBooking.clientEmail}</strong>.
            </p>

            {/* Official Digital Ticket Card */}
            <div className="mt-6 w-full max-w-lg rounded-2xl border-2 border-dashed border-[#E2D9CC] bg-[#FAF7F2] p-5 text-left shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2D9CC]">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏔️</span>
                  <div>
                    <h4 className="font-subtitle font-black text-sm text-[#37474F]">Riqsi Rutas Oficial</h4>
                    <span className="text-[10px] text-[#6D4C41]">Turismo Inteligente Cochabamba</span>
                  </div>
                </div>
                <span className="font-subtitle text-xs font-bold text-[#D81B60]">
                  {confirmedBooking.date}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 py-4 text-xs">
                <div>
                  <span className="text-[#6D4C41] block text-[10px] uppercase font-bold">Experiencia</span>
                  <strong className="text-[#37474F] text-sm">{confirmedBooking.placeTitle}</strong>
                  <span className="text-gray-500 block text-[11px]">{confirmedBooking.placeArea}</span>
                </div>
                <div>
                  <span className="text-[#6D4C41] block text-[10px] uppercase font-bold">Titular</span>
                  <strong className="text-[#37474F]">{confirmedBooking.clientName}</strong>
                  <span className="text-gray-500 block text-[11px]">CI: {confirmedBooking.clientCI}</span>
                </div>
                <div>
                  <span className="text-[#6D4C41] block text-[10px] uppercase font-bold">Viajeros</span>
                  <strong className="text-[#37474F]">{confirmedBooking.travelers} Personas</strong>
                </div>
                <div>
                  <span className="text-[#6D4C41] block text-[10px] uppercase font-bold">Método</span>
                  <strong className="text-[#37474F]">{confirmedBooking.paymentMethod}</strong>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2D9CC] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#6D4C41] uppercase font-bold block">Total Pagado</span>
                  <span className="font-subtitle text-xl font-black text-emerald-600">
                    Bs. {confirmedBooking.totalBob} <small className="text-xs text-gray-500">(${confirmedBooking.totalUsd} USD)</small>
                  </span>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-white border border-[#E2D9CC] p-1 shadow-xs">
                  <Icon name="qr" size={32} className="text-[#37474F]" />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => window.print()}
                className="rounded-full bg-[#1E293B] hover:bg-[#334155] text-white px-6 py-2.5 font-subtitle text-xs font-bold transition flex items-center gap-2 shadow-md"
              >
                <Icon name="download" size={16} /> Imprimir / Guardar Comprobante
              </button>
              <button
                onClick={onClose}
                className="rounded-full bg-[#D81B60] hover:bg-[#b0144c] text-white px-8 py-2.5 font-subtitle text-xs font-bold transition shadow-lg shadow-[#D81B60]/30"
              >
                Continuar Navegando →
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
            {/* LEFT COLUMN: Payment Methods & Details */}
            <div className="space-y-5">
              {/* Tabs Selector */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-[#6D4C41] mb-2">
                  1. Selecciona Método de Pago
                </label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-[#FAF7F2] rounded-2xl border border-[#E2D9CC]">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("qr")}
                    className={`py-2 px-3 rounded-xl font-subtitle text-xs font-extrabold transition flex items-center justify-center gap-2 ${
                      paymentMethod === "qr"
                        ? "bg-[#D81B60] text-white shadow-md shadow-[#D81B60]/30"
                        : "text-[#37474F] hover:bg-white/70"
                    }`}
                  >
                    <Icon name="qr" size={16} /> QR Simple
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`py-2 px-3 rounded-xl font-subtitle text-xs font-extrabold transition flex items-center justify-center gap-2 ${
                      paymentMethod === "card"
                        ? "bg-[#D81B60] text-white shadow-md shadow-[#D81B60]/30"
                        : "text-[#37474F] hover:bg-white/70"
                    }`}
                  >
                    <Icon name="credit-card" size={16} /> Tarjeta
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash")}
                    className={`py-2 px-3 rounded-xl font-subtitle text-xs font-extrabold transition flex items-center justify-center gap-2 ${
                      paymentMethod === "cash"
                        ? "bg-[#D81B60] text-white shadow-md shadow-[#D81B60]/30"
                        : "text-[#37474F] hover:bg-white/70"
                    }`}
                  >
                    <Icon name="pin" size={16} /> Punto Físico
                  </button>
                </div>
              </div>

              {/* TAB 1: QR SIMPLE BOLIVIA */}
              {paymentMethod === "qr" && (
                <div className="rounded-2xl border border-[#E2D9CC] bg-[#FAF7F2] p-4 text-center animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E2D9CC] text-xs">
                    <span className="font-subtitle font-bold text-[#37474F] flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      QR Simple Interbancario Bolivia
                    </span>
                    <span className="font-mono font-bold text-[#D81B60] bg-white px-2 py-0.5 rounded-md border border-[#E2D9CC]">
                      ⏱️ {formatTimer(qrSecondsLeft)}
                    </span>
                  </div>

                  {/* QR Canvas / Simulated SVG Box */}
                  <div className="my-4 flex flex-col items-center">
                    <div className="relative p-3 bg-white rounded-2xl shadow-md border border-[#E2D9CC] group">
                      <svg
                        className="w-44 h-44 sm:w-48 sm:h-48"
                        viewBox="0 0 200 200"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {/* Background */}
                        <rect width="200" height="200" fill="white" rx="12" />
                        {/* Corner Targets */}
                        <rect x="20" y="20" width="45" height="45" rx="8" fill="#1E293B" />
                        <rect x="28" y="28" width="29" height="29" rx="4" fill="white" />
                        <rect x="34" y="34" width="17" height="17" rx="3" fill="#D81B60" />

                        <rect x="135" y="20" width="45" height="45" rx="8" fill="#1E293B" />
                        <rect x="143" y="28" width="29" height="29" rx="4" fill="white" />
                        <rect x="149" y="34" width="17" height="17" rx="3" fill="#D81B60" />

                        <rect x="20" y="135" width="45" height="45" rx="8" fill="#1E293B" />
                        <rect x="28" y="143" width="29" height="29" rx="4" fill="white" />
                        <rect x="34" y="149" width="17" height="17" rx="3" fill="#D81B60" />

                        {/* Data dots matrix */}
                        <g fill="#1E293B">
                          <rect x="75" y="25" width="10" height="10" rx="2" />
                          <rect x="95" y="25" width="10" height="10" rx="2" />
                          <rect x="115" y="25" width="10" height="10" rx="2" />
                          <rect x="75" y="45" width="20" height="10" rx="2" />
                          <rect x="105" y="45" width="10" height="10" rx="2" />
                          <rect x="25" y="75" width="10" height="20" rx="2" />
                          <rect x="45" y="85" width="10" height="10" rx="2" />
                          <rect x="75" y="75" width="15" height="15" rx="2" fill="#D81B60" />
                          <rect x="100" y="75" width="25" height="10" rx="2" />
                          <rect x="135" y="75" width="10" height="10" rx="2" />
                          <rect x="155" y="75" width="20" height="10" rx="2" />
                          <rect x="75" y="100" width="10" height="25" rx="2" />
                          <rect x="95" y="100" width="15" height="15" rx="2" fill="#F7931E" />
                          <rect x="120" y="100" width="20" height="10" rx="2" />
                          <rect x="150" y="95" width="25" height="10" rx="2" />
                          <rect x="75" y="135" width="15" height="10" rx="2" />
                          <rect x="100" y="135" width="10" height="25" rx="2" />
                          <rect x="120" y="135" width="20" height="10" rx="2" />
                          <rect x="150" y="135" width="25" height="25" rx="4" fill="#D81B60" />
                          <rect x="75" y="165" width="25" height="10" rx="2" />
                          <rect x="110" y="165" width="15" height="10" rx="2" />
                        </g>

                        {/* Center Badge */}
                        <circle cx="100" cy="100" r="16" fill="white" stroke="#D81B60" strokeWidth="2" />
                        <text x="100" y="104" textAnchor="middle" fontSize="10" fontWeight="900" fill="#D81B60">RQ</text>
                      </svg>

                      <div className="mt-2 text-[11px] font-subtitle font-bold text-[#37474F]">
                        Monto exacto: <span className="text-[#D81B60] font-black">Bs. {finalTotalBob}</span>
                      </div>
                    </div>

                    {/* Bank Badges */}
                    <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-[10px] text-gray-500">
                      <span className="bg-white px-2 py-0.5 rounded-md border border-[#E2D9CC] font-bold text-blue-900">Banco Unión</span>
                      <span className="bg-white px-2 py-0.5 rounded-md border border-[#E2D9CC] font-bold text-emerald-800">BNB</span>
                      <span className="bg-white px-2 py-0.5 rounded-md border border-[#E2D9CC] font-bold text-blue-700">BCP</span>
                      <span className="bg-white px-2 py-0.5 rounded-md border border-[#E2D9CC] font-bold text-amber-700">Banco Bisa</span>
                      <span className="bg-white px-2 py-0.5 rounded-md border border-[#E2D9CC] font-bold text-indigo-700">Tigo Money</span>
                    </div>

                    {/* QR Simulator Action */}
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleProcessPayment}
                      className="mt-4 w-full sm:w-auto rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-subtitle text-xs font-black px-6 py-2.5 shadow-md shadow-emerald-600/30 transition flex items-center justify-center gap-2 active:scale-95"
                    >
                      {isProcessing ? (
                        <>
                          <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Verificando pago en Banco Central...</span>
                        </>
                      ) : (
                        <>
                          <span>⚡ Simular Escaneo y Pago Exitoso</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: TARJETA DE CRÉDITO 3D INTERACTIVA */}
              {paymentMethod === "card" && (
                <div className="space-y-4 animate-in fade-in">
                  {/* 3D Realistic Credit Card */}
                  <div className="perspective-1000 mx-auto max-w-sm">
                    <div
                      className={`relative h-48 w-full rounded-2xl p-5 text-white shadow-2xl transition-transform duration-700 transform-style-3d ${
                        isCardFlipped ? "rotate-y-180" : ""
                      }`}
                      style={{
                        background: "linear-gradient(135deg, #1E293B 0%, #0F172A 50%, #D81B60 100%)",
                      }}
                    >
                      {/* Front of Card */}
                      {!isCardFlipped ? (
                        <div className="flex h-full flex-col justify-between">
                          <div className="flex items-center justify-between">
                            <span className="font-subtitle text-xs font-black tracking-widest text-[#F4C430]">
                              RIQSI CARD
                            </span>
                            <span className="text-xl font-black italic tracking-wider">VISA</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Chip */}
                            <div className="h-7 w-9 rounded-md bg-gradient-to-br from-amber-300 to-amber-500 shadow-inner flex items-center justify-center">
                              <span className="h-4 w-6 border border-amber-800/40 rounded-xs" />
                            </div>
                            <span className="text-[10px] text-white/60">Contacless 📶</span>
                          </div>

                          <div className="font-mono text-base sm:text-lg tracking-[.2em] font-bold text-white drop-shadow">
                            {cardNumber || "•••• •••• •••• ••••"}
                          </div>

                          <div className="flex items-end justify-between text-xs">
                            <div>
                              <span className="text-[8px] uppercase tracking-wider text-white/60 block">Titular</span>
                              <strong className="font-subtitle font-bold text-white truncate max-w-[170px] block">
                                {cardHolder || "NOMBRE DEL TITULAR"}
                              </strong>
                            </div>
                            <div>
                              <span className="text-[8px] uppercase tracking-wider text-white/60 block">Vence</span>
                              <strong className="font-mono font-bold text-white">{cardExpiry || "MM/AA"}</strong>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Back of Card */
                        <div className="flex h-full flex-col justify-between py-2">
                          <div className="h-9 w-full bg-black -mx-5 px-5" />
                          <div>
                            <span className="text-[8px] text-white/60 block text-right">CVV / CVC</span>
                            <div className="h-8 w-full bg-white text-[#1E293B] font-mono font-black text-right pr-3 flex items-center justify-end rounded text-sm">
                              {cardCvv || "•••"}
                            </div>
                          </div>
                          <span className="text-[9px] text-white/60 text-center block">
                            Firma autorizada · 256-Bit SSL Secured
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Form Inputs */}
                  <div className="grid gap-3 sm:grid-cols-2 text-xs">
                    <div className="sm:col-span-2">
                      <label className="font-bold text-[#37474F] block mb-1">Número de Tarjeta</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        onFocus={() => setIsCardFlipped(false)}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] p-2.5 font-mono font-bold text-[#37474F] focus:outline-hidden focus:border-[#D81B60]"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-[#37474F] block mb-1">Nombre en la Tarjeta</label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        onFocus={() => setIsCardFlipped(false)}
                        placeholder="FREDDY TEJERINA"
                        className="w-full rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] p-2.5 font-subtitle font-bold text-[#37474F] focus:outline-hidden focus:border-[#D81B60]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold text-[#37474F] block mb-1">Vence</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          onFocus={() => setIsCardFlipped(false)}
                          placeholder="MM/AA"
                          maxLength={5}
                          className="w-full rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] p-2.5 font-mono font-bold text-[#37474F] focus:outline-hidden focus:border-[#D81B60]"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-[#37474F] block mb-1">CVV</label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          onFocus={() => setIsCardFlipped(true)}
                          onBlur={() => setIsCardFlipped(false)}
                          placeholder="•••"
                          maxLength={4}
                          className="w-full rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] p-2.5 font-mono font-bold text-[#37474F] focus:outline-hidden focus:border-[#D81B60]"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleProcessPayment}
                    className="w-full rounded-full bg-[#D81B60] hover:bg-[#b0144c] text-white font-subtitle text-xs font-black py-3 shadow-lg shadow-[#D81B60]/30 transition flex items-center justify-center gap-2 active:scale-98"
                  >
                    {isProcessing ? (
                      <>
                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Validando transacción con pasarela...</span>
                      </>
                    ) : (
                      <>
                        <Icon name="lock" size={15} />
                        <span>Pagar Bs. {finalTotalBob} (${finalTotalUsd} USD)</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* TAB 3: PUNTO FÍSICO */}
              {paymentMethod === "cash" && (
                <div className="rounded-2xl border border-[#E2D9CC] bg-[#FAF7F2] p-4 text-xs space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2 font-subtitle font-bold text-[#37474F]">
                    <Icon name="pin" size={18} className="text-[#D81B60]" />
                    <span>Oficinas Centrales de Turismo Cochabamba</span>
                  </div>
                  <p className="text-[#6D4C41] leading-relaxed">
                    Puedes realizar tu pago en efectivo en nuestra ventanilla de atención ubicada en la <strong>Plaza 14 de Septiembre, Acera Este #245</strong>, o mediante transferencia bancaria:
                  </p>
                  <div className="rounded-xl bg-white p-3 border border-[#E2D9CC] space-y-1 font-mono text-[11px]">
                    <div><strong>Banco:</strong> Banco Unión S.A.</div>
                    <div><strong>Cta. Cte. Fiscal:</strong> 100000-48291029</div>
                    <div><strong>A nombre de:</strong> Riqsi Rutas S.R.L.</div>
                    <div><strong>NIT:</strong> 3409182012</div>
                  </div>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleProcessPayment}
                    className="w-full rounded-full bg-[#1E293B] hover:bg-[#334155] text-white font-subtitle text-xs font-black py-2.5 transition"
                  >
                    Generar Orden de Reserva Pendiente de Pago
                  </button>
                </div>
              )}

              {/* Billing Info Form */}
              <div className="pt-2 border-t border-[#E2D9CC]">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-[#6D4C41] mb-2">
                  2. Datos del Viajero / Facturación
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-[#6D4C41]">Nombre Completo</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] p-2 font-subtitle font-bold text-[#37474F] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#6D4C41]">CI / Pasaporte / NIT</label>
                    <input
                      type="text"
                      value={clientCI}
                      onChange={(e) => setClientCI(e.target.value)}
                      className="w-full rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] p-2 font-subtitle font-bold text-[#37474F] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#6D4C41]">Correo Electrónico</label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] p-2 font-subtitle font-bold text-[#37474F] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#6D4C41]">Teléfono / WhatsApp</label>
                    <input
                      type="text"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] p-2 font-subtitle font-bold text-[#37474F] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Order Summary & Add-ons */}
            <div className="rounded-2xl border border-[#E2D9CC] bg-[#FAF7F2] p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <h3 className="font-subtitle text-sm font-black uppercase tracking-wider text-[#37474F] pb-3 border-b border-[#E2D9CC] flex items-center justify-between">
                  <span>Resumen de Reserva</span>
                  <span className="text-xs text-[#D81B60]">Riqsi Checkout</span>
                </h3>

                {/* Selected Place Preview */}
                <div className="flex gap-3 items-center py-3 border-b border-[#E2D9CC]">
                  <img
                    src={place.image}
                    alt={place.title}
                    className="h-14 w-14 rounded-xl object-cover shadow-sm ring-1 ring-[#E2D9CC]"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-[#D81B60]">{place.category}</span>
                    <h4 className="font-subtitle text-sm font-extrabold text-[#37474F] truncate">{place.title}</h4>
                    <span className="text-[11px] text-[#6D4C41] flex items-center gap-1">
                      <Icon name="pin" size={11} /> {place.area}
                    </span>
                  </div>
                </div>

                {/* Travelers Counter */}
                <div className="py-3 border-b border-[#E2D9CC] flex items-center justify-between">
                  <div>
                    <strong className="text-xs text-[#37474F] block">Cantidad de Viajeros</strong>
                    <span className="text-[11px] text-[#6D4C41]">Bs. {basePricePerPerson} por persona</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white rounded-xl border border-[#E2D9CC] p-1 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setTravelersCount((prev) => Math.max(prev - 1, 1))}
                      className="h-7 w-7 rounded-lg bg-[#FAF7F2] hover:bg-gray-200 text-xs font-black grid place-items-center"
                    >
                      -
                    </button>
                    <span className="font-subtitle text-xs font-bold px-2">{travelersCount}</span>
                    <button
                      type="button"
                      onClick={() => setTravelersCount((prev) => Math.min(prev + 1, 15))}
                      className="h-7 w-7 rounded-lg bg-[#FAF7F2] hover:bg-gray-200 text-xs font-black grid place-items-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Add-ons Checkboxes */}
                <div className="py-3 border-b border-[#E2D9CC] space-y-2">
                  <span className="text-[11px] font-bold text-[#6D4C41] uppercase block">
                    Servicios Opcionales
                  </span>

                  <label className="flex items-center justify-between text-xs cursor-pointer group">
                    <span className="flex items-center gap-2 text-[#37474F]">
                      <input
                        type="checkbox"
                        checked={addGuide}
                        onChange={(e) => setAddGuide(e.target.checked)}
                        className="rounded accent-[#D81B60]"
                      />
                      <span>Guía Bilingüe Especializado</span>
                    </span>
                    <strong className="text-[#6D4C41]">+Bs. 50</strong>
                  </label>

                  <label className="flex items-center justify-between text-xs cursor-pointer group">
                    <span className="flex items-center gap-2 text-[#37474F]">
                      <input
                        type="checkbox"
                        checked={addTransport}
                        onChange={(e) => setAddTransport(e.target.checked)}
                        className="rounded accent-[#D81B60]"
                      />
                      <span>Transporte Privado ida/vuelta</span>
                    </span>
                    <strong className="text-[#6D4C41]">+Bs. {40 * travelersCount}</strong>
                  </label>

                  <label className="flex items-center justify-between text-xs cursor-pointer group">
                    <span className="flex items-center gap-2 text-[#37474F]">
                      <input
                        type="checkbox"
                        checked={addLunch}
                        onChange={(e) => setAddLunch(e.target.checked)}
                        className="rounded accent-[#D81B60]"
                      />
                      <span>Almuerzo Típico de la Llajta</span>
                    </span>
                    <strong className="text-[#6D4C41]">+Bs. {35 * travelersCount}</strong>
                  </label>
                </div>

                {/* Promo Code Box */}
                <div className="py-3 border-b border-[#E2D9CC]">
                  <span className="text-[11px] font-bold text-[#6D4C41] uppercase block mb-1">
                    Cupón de Descuento
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Ej: COCHABAMBA2026"
                      className="flex-1 rounded-xl border border-[#E2D9CC] bg-white px-2.5 py-1.5 text-xs font-mono font-bold text-[#37474F] focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      className="rounded-xl bg-[#1E293B] hover:bg-[#334155] text-white px-3 py-1.5 font-subtitle text-xs font-bold transition"
                    >
                      Aplicar
                    </button>
                  </div>
                  {appliedDiscount && (
                    <div className="mt-1.5 text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <span>✓ Cupón {appliedDiscount.code} aplicado (-{appliedDiscount.percent}%)</span>
                    </div>
                  )}
                  {couponError && (
                    <div className="mt-1.5 text-[11px] font-bold text-rose-600">
                      {couponError}
                    </div>
                  )}
                </div>
              </div>

              {/* Total Calculation */}
              <div className="pt-4 space-y-1.5 text-xs">
                <div className="flex justify-between text-[#6D4C41]">
                  <span>Subtotal ({travelersCount} personas)</span>
                  <span>Bs. {subtotalExperiences}</span>
                </div>
                {(guideFee > 0 || transportFee > 0 || lunchFee > 0) && (
                  <div className="flex justify-between text-[#6D4C41]">
                    <span>Servicios adicionales</span>
                    <span>Bs. {guideFee + transportFee + lunchFee}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between font-bold text-emerald-600">
                    <span>Descuento aplicado</span>
                    <span>-Bs. {discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-2 border-t border-[#E2D9CC]">
                  <div>
                    <span className="font-subtitle text-sm font-extrabold text-[#37474F] block">Total a Pagar</span>
                    <span className="text-[10px] text-gray-500">Impuestos y tasas incluidos</span>
                  </div>
                  <div className="text-right">
                    <span className="font-subtitle text-2xl font-black text-[#D81B60] block">
                      Bs. {finalTotalBob}
                    </span>
                    <span className="text-[11px] text-gray-500 font-bold">
                      ${finalTotalUsd} USD
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
