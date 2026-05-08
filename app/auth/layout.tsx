export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Atmospheric background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(168,255,62,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(168,255,62,1) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
        <div
          className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse, rgba(168,255,62,0.04) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse, rgba(240,192,64,0.04) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-lime rounded-xl mb-4">
            <span className="font-title font-bold text-void text-lg leading-none">
              P
            </span>
          </div>
          <h1 className="font-title font-bold text-4xl text-text uppercase">
            Panini <span className="text-lime">WC26</span>
          </h1>
          <p className="text-[9px] font-title font-semibold uppercase text-text/25 mt-1.5">
            FIFA World Cup 2026
          </p>
        </div>
        {children}
      </div>
    </main>
  );
}
