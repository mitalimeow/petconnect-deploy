import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FadeInSection = ({ children, delay = 0 }) => {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.unobserve(entry.target);
        }
      });
    });
    observer.observe(domRef.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
    >
      {children}
    </div>
  );
};

const Applications = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-[#fdfbf7] min-h-[calc(100vh-80px)] pb-20 overflow-x-hidden font-body text-[#3A3A3A]">
      
      {/* 1. Top Banner */}
      <section className="relative w-full min-h-[600px] md:min-h-[70vh] flex items-center justify-center py-20 overflow-hidden shadow-sm">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/applications/wallpaper.jpg')",
            backgroundRepeat: "repeat",
            backgroundSize: "450px",
            filter: "brightness(0.95)"
          }}
        ></div>
        <div className="absolute inset-0 z-0 bg-white/40 mix-blend-overlay"></div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <FadeInSection>
            <div className="bg-[#D6C5BC] px-8 md:px-16 py-10 md:py-14 rounded-[40px] max-w-[850px] w-[90vw] mx-auto shadow-xl">
              <h1 
                className="text-4xl md:text-[64px] font-bold mb-6 tracking-wide text-[#3A3A3A] uppercase leading-[1.1]"
                style={{ fontFamily: "'Chelsea Market', cursive" }}
              >
                Professional Verification
              </h1>
              <p 
                className="text-xl md:text-[30px] text-[#5A4036] mb-10"
                style={{ fontFamily: "'Schoolbell', cursive" }}
              >
                Verify yourself for a professional tag!
              </p>
              <button 
                onClick={() => navigate('/applications/form')}
                className="bg-[#FFB7B2] hover:bg-[#ff9f99] text-[#3A3A3A] font-handwritten text-3xl px-14 py-3 rounded-full shadow-[5px_5px_0px_#3A3A3A] border-2 border-[#3A3A3A] transition-transform active:scale-95 hover:-translate-y-1"
              >
                Apply Now
              </button>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* 2. Why need a professional tag? */}
      <section className="bg-[#FAF6F3] w-full py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <FadeInSection>
            <div className="flex flex-col md:flex-row items-center justify-start gap-10 md:gap-16">
              <div className="w-full md:w-[35%] max-w-[380px] overflow-hidden rounded-[24px] shadow-md shrink-0">
                <img src="/applications/1.jpg" alt="Why need a professional tag" className="w-full h-auto object-cover" />
              </div>
              <div className="w-full md:w-[65%]">
                <h2 className="text-4xl md:text-[55px] font-bold mb-6 text-[#3A3A3A] tracking-tight leading-none" style={{ fontFamily: "'Zain', sans-serif" }}>Why need a professional tag?</h2>
                <p className="text-xl md:text-[22px] leading-[1.8] text-gray-700" style={{ fontFamily: "'Schoolbell', cursive" }}>
                  Having a professional tag on PetConnect establishes you as a verified and credible member of the community. In a space where trust is essential, especially for pet-related services. Being verified reassures users that your identity or skills have been reviewed. This makes people more likely to engage with your profile and rely on your expertise, giving you a stronger and more trustworthy presence.
                </p>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* 3. What are the benefits? */}
      <section className="bg-white py-16 md:py-24 w-full">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-start gap-10 md:gap-16">
            <div className="w-full lg:w-[55%] flex flex-col gap-12">
              <FadeInSection>
                <h2 className="text-4xl md:text-[55px] font-bold text-left mb-4 text-[#3A3A3A] whitespace-nowrap" style={{ fontFamily: "'Zain', sans-serif" }}>What are the benefits?</h2>
              </FadeInSection>

              <FadeInSection delay={100}>
                <div className="relative">
                  <div className="absolute -left-10 top-1 w-8 h-8 rounded-full flex items-center justify-center text-[#3A3A3A] font-black text-lg bg-[#FFB7B2] shadow-sm">1</div>
                  <h3 className="text-3xl md:text-[40px] font-bold mb-3 text-[#5A4036]" style={{ fontFamily: "'Zain', sans-serif" }}>Advertisement Perks</h3>
                  <p className="text-lg md:text-[20px] leading-[1.8] text-gray-700" style={{ fontFamily: "'Schoolbell', cursive" }}>
                    As a verified professional, you can post events directly on the dashboard, allowing you to advertise workshops, adoption drives, training sessions, or any pet-related activities. This means your events reach a highly relevant audience already interested in pets, without needing to depend on external marketing. It helps you connect with the right people efficiently and grow your reach within the PetConnect ecosystem.
                  </p>
                </div>
              </FadeInSection>

              <FadeInSection delay={300}>
                <div className="relative">
                   <div className="absolute -left-10 top-1 w-8 h-8 rounded-full flex items-center justify-center text-[#3A3A3A] font-black text-lg bg-[#B5EAD7] shadow-sm">2</div>
                  <h3 className="text-3xl md:text-[40px] font-bold mb-3 text-[#487a64]" style={{ fontFamily: "'Zain', sans-serif" }}>Publish Articles</h3>
                  <p className="text-lg md:text-[20px] leading-[1.8] text-gray-700" style={{ fontFamily: "'Schoolbell', cursive" }}>
                    Contribute to the Education section by publishing articles. This allows you to share your knowledge, experiences, and insights with the community, helping others learn while also positioning yourself as an expert in your field. Over time, consistently sharing valuable content builds your authority and reputation, attracting more users to your profile and strengthening your professional identity.
                  </p>
                </div>
              </FadeInSection>
            </div>

            <div className="w-full lg:w-[45%] flex items-start justify-center lg:justify-end mt-4 lg:mt-0">
              <FadeInSection delay={400}>
                <div className="w-full max-w-[500px] overflow-hidden rounded-[30px] shadow-md">
                  <img src="/applications/image11.png" alt="Benefits of professional tag" className="w-full h-[400px] lg:h-[600px] object-cover" />
                </div>
              </FadeInSection>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Requirements */}
      <section className="bg-[#FAF6F3] w-full py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <FadeInSection>
            <div className="flex flex-col-reverse md:flex-row items-center gap-10 md:gap-16">
              <div className="w-full md:w-[60%]">
                <h2 className="text-4xl md:text-[55px] font-bold mb-8 text-[#3A3A3A]" style={{ fontFamily: "'Zain', sans-serif" }}>Requirements?</h2>
                
                <div className="space-y-6">
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-[#E2F0CB] flex items-center justify-center shrink-0 mt-1 shadow-sm">
                      <span className="font-black text-lg text-[#3A3A3A]">✓</span>
                    </div>
                    <p className="text-lg md:text-[22px] leading-[1.8] text-gray-700" style={{ fontFamily: "'Schoolbell', cursive" }}>
                      To apply for a professional tag, you are required to submit at least two and up to three valid documents such as an Aadhaar card, PAN card, professional license, or relevant certification to verify your identity and qualifications.
                    </p>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-[#E2F0CB] flex items-center justify-center shrink-0 mt-1 shadow-sm">
                      <span className="font-black text-lg text-[#3A3A3A]">✓</span>
                    </div>
                    <p className="text-lg md:text-[22px] leading-[1.8] text-gray-700" style={{ fontFamily: "'Schoolbell', cursive" }}>
                      Additionally, you must provide a valid URL, such as your work website, portfolio, LinkedIn profile, or Google Drive link, to support your application and establish credibility.
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-[40%] max-w-[420px]">
                 <div className="w-full overflow-hidden rounded-[24px] shadow-md">
                  <img src="/applications/3.jpg" alt="Documentation requirements" className="w-full h-auto object-cover" />
                </div>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Bottom Apply Section */}
      <section className="py-24 text-center mt-8">
        <FadeInSection>
          <div className="flex flex-col items-center justify-center relative">
            <div className="text-[#3A3A3A] animate-bounce mb-8 opacity-60">
              {/* Simple arrow down representation */}
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M19 12l-7 7-7-7"/>
              </svg>
            </div>
            
            <button 
                onClick={() => navigate('/applications/form')}
                className="bg-[#9DE5A7] hover:bg-[#8ade98] text-[#3A3A3A] font-handwritten text-[40px] px-16 py-4 rounded-full shadow-[6px_6px_0px_#3A3A3A] border-[3px] border-[#3A3A3A] transition-transform active:scale-95 hover:-translate-y-2 uppercase tracking-wide"
              >
                Apply Now
            </button>
            <p className="font-body font-bold text-gray-400 mt-6 tracking-widest uppercase text-sm">Join the Elite PetConnect Force</p>
          </div>
        </FadeInSection>
      </section>

    </div>
  );
};

export default Applications;
