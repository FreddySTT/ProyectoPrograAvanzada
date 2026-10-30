import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "55vh",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <span style={{ fontSize: "4.5rem", marginBottom: "1rem" }}>🛸</span>
      <h2
        style={{
          fontSize: "2rem",
          fontWeight: 900,
          color: "#ffffff",
          marginBottom: "0.5rem",
        }}
      >
        Pokémon No Encontrado
      </h2>
      <p
        style={{
          color: "#94a3b8",
          maxWidth: "480px",
          marginBottom: "2rem",
          lineHeight: 1.6,
        }}
      >
        El espécimen solicitado no existe en los registros de la Pokédex nacional (rango #0001 - #1025).
      </p>
      <Link
        href="/"
        style={{
          background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
          color: "#ffffff",
          padding: "0.75rem 1.75rem",
          borderRadius: "9999px",
          textDecoration: "none",
          fontWeight: 700,
          boxShadow: "0 4px 16px rgba(239, 68, 68, 0.4)",
        }}
      >
        ← Volver a la Pokédex
      </Link>
    </div>
  );
}
