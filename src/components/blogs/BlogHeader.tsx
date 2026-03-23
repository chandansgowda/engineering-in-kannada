

export function BlogHeader() {
  return (
    <div className="relative pt-4 md:pt-6 pb-2 md:pb-3 overflow-hidden">
      {/* Background depth layers */}
      <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[60px] md:blur-[100px] opacity-30 animate-pulse"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">

          <h1 className="text-3xl md:text-5xl lg:text-5xl font-bold text-white mb-1.5 md:mb-2 tracking-tight leading-[1.1] md:leading-[1.1] font-display">
            Engineering Concepts,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-yellow-400 to-yellow-600">Simplified in Kannada.</span>
          </h1>
          <p className="text-base md:text-lg text-gray-300 mb-0 max-w-2xl mx-auto leading-relaxed px-4 md:px-0 opacity-90 font-sans">
            Bridging the gap between complex concepts and local context. Premium resources for the next generation of engineers.
          </p>
        </div>
      </div>
    </div>
  );
}
