export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
        </div>
      </div>

      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">EFK87 Platform</h1>
        <p className="text-xl mb-8">Multi-club platform foundation is active.</p>
        <p className="text-sm text-slate-500">First tenant route: <code className="bg-slate-100 p-1 rounded">/efk87</code></p>
      </div>
    </main>
  );
}