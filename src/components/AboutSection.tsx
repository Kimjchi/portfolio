export default function AboutSection() {
  return (
    <section className="min-h-screen bg-[#121212] flex flex-col md:flex-row items-center gap-12 md:gap-24 px-8 md:px-20 py-20">
      {/* Profile image */}
      <div className="shrink-0 w-56 h-56 md:w-96 md:h-96 overflow-hidden border border-white/10">
        <img
          src="https://picsum.photos/seed/portrait/600/600"
          alt="Jeremy Kim"
          className="w-full h-full object-cover grayscale"
        />
      </div>

      {/* Text */}
      <div className="flex flex-col gap-8 max-w-xl">
        <div>
          <p className="text-white/40 text-sm md:text-base font-[vcr-jp] mb-2 tracking-widest uppercase">
            About
          </p>
          <h2 className="text-4xl md:text-7xl font-bold text-white font-[vcr-jp] leading-tight">
            Jeremy Kim
          </h2>
        </div>

        <p className="text-gray-400 text-base md:text-xl leading-relaxed font-[vcr-jp]">
          Fullstack developer based in Paris, France. I build web applications
          with a focus on clean code and thoughtful user experiences. Outside of
          work I shoot film photography and sketch — two things that keep my eye
          sharp.
        </p>

        <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-8">
          {[
            { label: 'Stack', value: 'React · Node · TypeScript' },
            { label: 'Based in', value: 'Paris, France' },
            { label: 'Available', value: 'Freelance' },
            { label: 'Languages', value: 'French · English' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-white/40 text-xs tracking-widest uppercase mb-1 font-[vcr-jp]">
                {label}
              </p>
              <p className="text-white text-sm md:text-base font-[vcr-jp]">{value}</p>
            </div>
          ))}
        </div>

        <a
          href="mailto:jeremy@example.com"
          className="w-fit border border-white text-white font-[vcr-jp] text-sm md:text-base px-6 py-3 hover:bg-white hover:text-black transition-colors duration-300"
        >
          Get in touch →
        </a>
      </div>
    </section>
  )
}
