function Checkout() {
  return (
        <div className="min-h-screen bg-cinema-bg text-cinema-text font-sans pb-12">
      
      <Home/>

      {/* Navigation Bar Placeholder */}
      <header className="bg-cinema-card shadow-md py-4 px-8 flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-cinema-primary cursor-pointer hover:text-red-500 transition-colors">
          Cinema E-Booking
        </h1>
        <div className="text-cinema-muted text-sm">
          [ Search Bar Placeholder ]
        </div>
      </header>

      {/* Main Content Area */}
      <main className="px-8">
        <BackendStatus />
        <BookingPrototype />
      </main>

    </div>
  )
}

export default Checkout