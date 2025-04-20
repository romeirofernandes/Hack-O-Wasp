import React from "react";
import { SplashCursor } from "../components/AnimatedBackground";
import AnimatedTextCycle from "../components/AnimatedTextCycle";
import { ContainerScroll } from "../components/ScrollContainer";
import { TestimonialCard } from "../components/TestimonialCard";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();
  const words = ["Notes", "Study"];

  const testimonials = [
    {
      author: {
        name: "Alex Chen",
        role: "Computer Science Student",
      },
      text: "ClarityTrace helped me understand complex programming concepts that I struggled with for months. It's like having a personal tutor available 24/7.",
    },
    {
      author: {
        name: "Sarah Johnson",
        role: "High School Teacher",
      },
      text: "As an educator, ClarityTrace has transformed how I prepare my lessons. My students are more engaged and their test scores have improved significantly.",
    },
    {
      author: {
        name: "James Wilson",
        role: "Lifelong Learner",
      },
      text: "I've tried many learning platforms, but ClarityTrace's personalized approach helped me retain information much longer. The difference is remarkable.",
    },
    {
      author: {
        name: "Maya Patel",
        role: "Medical Student",
      },
      text: "Studying for medical exams was overwhelming until I found ClarityTrace. It helped me organize complex information and improved my recall abilities.",
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



      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Your AI-Powered{" "}
            <AnimatedTextCycle words={words} className="text-gray-300" /> Guide
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-8">
          ClarityAI isn't just an app. 
          It's an AI-powered personal tutor that helps you learn smarter, retain longer, and teach like a pro.
          </p>

          {/* Hero Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <button className="px-8 py-4 bg-white text-black hover:bg-gray-100 rounded-full font-semibold transition-all w-full sm:w-auto" onClick={
              () =>{
                navigate("/upload");
              }
            }>
              Start Learning
            </button>
            <button className="px-8 py-4 bg-transparent text-white border border-white/20 hover:bg-white/5 rounded-full font-semibold transition-all w-full sm:w-auto">
              See How It Works
            </button>
          </div>
        </div>
      </section>

      {/* Update Card Section */}
      <ContainerScroll
        titleComponent={
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">
            Transform Your Learning Experience
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
            Join thousands of learners who have transformed their educational journey
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
            Ready to Transform How You Learn?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
          Join thousands of students, teachers, and lifelong learners
          who have revolutionized their educational experience with ClarityAI.
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
            © 2025 ClarityAI. All rights reserved.
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
    title: "Learn Smarter",
    description:
      "Our AI adapts to your learning style, identifying knowledge gaps and providing personalized content that helps you understand complex concepts faster.",
  },
  {
    title: "Retain Longer",
    description:
      "ClarityTrace uses proven spaced repetition techniques and cognitive science to ensure what you learn stays with you for the long term.",
  },
  {
    title: "Teach Like a Pro",
    description:
      "For educators, our platform offers lesson planning tools, engagement metrics, and AI-generated materials that transform your teaching approach.",
  },
  {
    title: "Personalized Feedback",
    description:
      "Receive immediate, constructive feedback on assignments, practice exercises, and projects to accelerate your growth.",
  },
];

export default Landing;
