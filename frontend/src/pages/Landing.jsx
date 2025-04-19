import React from "react";
import { SplashCursor } from "../components/AnimatedBackground";
import AnimatedTextCycle from "../components/AnimatedTextCycle";
import { ContainerScroll } from "../components/ScrollContainer";
import { TestimonialCard } from "../components/TestimonialCard";

const Landing = () => {
  const words = ["Career", "Intern", "Network"];

  const testimonials = [
    {
      author: {
        name: "Alex Chen",
        role: "Software Engineering Intern, Google",
      },
      text: "InternGuide helped me prepare and land my dream internship. The resources and community support were invaluable.",
    },
    {
      author: {
        name: "Sarah Johnson",
        role: "Data Science Intern, Microsoft",
      },
      text: "The interview prep resources were exactly what I needed. Went from rejection to multiple offers in just 2 months!",
    },
    {
      author: {
        name: "James Wilson",
        role: "Product Management Intern, Amazon",
      },
      text: "The networking strategies I learned here opened doors I didn't even know existed. Truly game-changing platform.",
    },
    {
      author: {
        name: "Maya Patel",
        role: "UX Design Intern, Apple",
      },
      text: "From resume building to interview prep, InternGuide provided everything I needed to succeed in my internship journey.",
    },
  ];

  return (
    <main className="relative z-0 min-h-screen bg-[#080808]">
      <SplashCursor
        SIM_RESOLUTION={64}
        DYE_RESOLUTION={512}
        CAPTURE_RESOLUTION={256}
        DENSITY_DISSIPATION={2.5}
        VELOCITY_DISSIPATION={1.5}
        PRESSURE_ITERATIONS={10}
        CURL={2}
        SPLAT_RADIUS={0.15}
        SPLAT_FORCE={4000}
        COLOR_UPDATE_SPEED={2}
        BACK_COLOR={{ r: 0.05, g: 0.05, b: 0.05 }}
      />

      <nav className="fixed top-3 left-0 right-0 z-50 bg-[#080808]/80 backdrop-blur-sm max-w-4xl mx-auto px-2 py-1 rounded-full border border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/" className="text-white font-bold text-xl">
            InternGuide
          </a>
          <div className="flex items-center gap-8">
            <a
              href="/"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Home
            </a>
            <a
              href="#features"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#about"
              className="text-gray-400 hover:text-white transition-colors"
            >
              About
            </a>
            <a
              href="#contact"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </nav>

      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Your Ultimate{" "}
            <AnimatedTextCycle words={words} className="text-gray-300" /> Guide
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Expert guidance, curated resources, and a supportive community to
            help you ace your internship journey.
          </p>

          {/* Hero Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <button className="px-8 py-4 bg-white text-black hover:bg-gray-100 rounded-full font-semibold transition-all w-full sm:w-auto">
              Get Started
            </button>
            <button className="px-8 py-4 bg-transparent text-white border border-white/20 hover:bg-white/5 rounded-full font-semibold transition-all w-full sm:w-auto">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Update Card Section */}
      <ContainerScroll
        titleComponent={
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">
            Everything You Need to Succeed
          </h2>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 md:p-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
            >
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </ContainerScroll>

      <section className="relative z-10 py-20 px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              What Our Users Say
            </h2>
            <p className="text-gray-400 text-lg">
              Join thousands of successful interns who transformed their careers
            </p>
          </div>

          <div className="relative">
            <div className="flex gap-6 overflow-x-hidden py-4">
              {/* First animation */}
              <div className="animate-marquee flex gap-6 shrink-0">
                {testimonials.map((testimonial, idx) => (
                  <TestimonialCard
                    key={`first-${idx}`}
                    author={testimonial.author}
                    text={testimonial.text}
                  />
                ))}
              </div>
              {/* Second animation (clone) */}
              <div className="animate-marquee flex gap-6 shrink-0">
                {testimonials.map((testimonial, idx) => (
                  <TestimonialCard
                    key={`second-${idx}`}
                    author={testimonial.author}
                    text={testimonial.text}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Update CTA Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Join thousands of students who have transformed their internship
            experience with our platform.
          </p>
          <button className="px-8 py-4 bg-white text-black hover:bg-gray-100 rounded-full font-semibold transition-all">
            Get Started Now
          </button>
        </div>
      </section>

      {/* Update Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2025 InternGuide. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              About
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Contact
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
};

// Features data
const features = [
  {
    title: "Resume Building",
    description:
      "Learn how to craft a compelling resume that stands out to employers and highlights your unique skills.",
  },
  {
    title: "Interview Prep",
    description:
      "Access mock interviews, common questions, and expert tips to ace your internship interviews.",
  },
  {
    title: "Industry Insights",
    description:
      "Get valuable insights from industry professionals and learn about different career paths.",
  },
  {
    title: "Networking Guide",
    description:
      "Learn effective networking strategies and build meaningful professional relationships.",
  },
];

export default Landing;
