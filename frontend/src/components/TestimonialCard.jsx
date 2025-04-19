export function TestimonialCard({ author, text, className = "" }) {
    return (
      <div
        className={`flex flex-col rounded-lg border border-white/10 bg-white/5 
          backdrop-blur-sm p-4 text-start sm:p-6 max-w-[320px] sm:max-w-[320px] 
          hover:bg-white/10 transition-colors duration-300 ${className}`}
      >
        <div className="flex flex-col items-start">
          <h3 className="text-md font-semibold leading-none text-white">
            {author.name}
          </h3>
          <p className="text-sm text-gray-400">{author.role}</p>
        </div>
        <p className="mt-4 text-sm sm:text-md text-gray-400">{text}</p>
      </div>
    );
  }
  