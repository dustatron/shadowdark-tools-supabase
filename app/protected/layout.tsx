export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 w-full flex flex-col items-center">
        <div className="flex-1 flex flex-col gap-20 max-w-5xl w-full p-5">
          {children}
        </div>
      </div>
    </main>
  );
}
