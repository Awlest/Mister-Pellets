import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NavbarSticky } from "@/components/layout/NavbarSticky";

export default function FrontendLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      <main className="flex-1 pb-24 lg:pb-0">{children}</main>
      <Footer />
      <NavbarSticky />
    </>
  );
}
