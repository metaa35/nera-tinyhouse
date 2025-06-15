import Image from "next/image";

export default function Navbar() {
  return (
    <nav style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 80 }}>
      <Image src="/logo.svg" alt="Nera Yapı" width={120} height={60} priority />
    </nav>
  );
} 