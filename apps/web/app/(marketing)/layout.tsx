import { Header } from "../../components/layouts/Header";
import { Footer } from "../../components/layouts/Footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1 min-h-screen pt-20">
        {children}
      </main>
      <Footer />
    </>
  );
}

