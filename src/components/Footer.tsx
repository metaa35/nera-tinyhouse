import Image from "next/image";

export default function Footer() {
  return (
    <footer style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 80, borderTop: "1px solid #eee" }}>
      <Image src="/logo.svg" alt="Nera Yapı" width={120} height={60} priority />
    </footer>
  );
} 