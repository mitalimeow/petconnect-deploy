import React from 'react';
import googleCatImg from '../assets/google-cat.png';
import PixelBlast from '../components/backgrounds/PixelBlast';

const About = () => {
  return (
    <div className="relative w-full min-h-[calc(100vh-80px)] overflow-hidden">
      {/* Background layer */}
      <div className="fixed inset-0 z-0 opacity-80">
        <PixelBlast
          variant="square"
          pixelSize={4}
          color="#ffb7b2"
          patternScale={2}
          patternDensity={1}
          pixelSizeJitter={0}
          enableRipples
          rippleSpeed={0.4}
          rippleThickness={0.12}
          rippleIntensityScale={1.5}
          liquid={false}
          liquidStrength={0.12}
          liquidRadius={1.2}
          liquidWobbleSpeed={5}
          speed={0.5}
          edgeFade={0.25}
          transparent
        />
      </div>

      <div className="container mx-auto px-6 py-12 lg:px-24 relative z-10 pointer-events-none">
        <div className="mb-16 text-center flex justify-center pointer-events-auto">
          <h1 className="text-5xl md:text-6xl font-handwritten font-bold text-[#e7a8a3] uppercase tracking-wider my-0">
            ABOUT US
          </h1>
        </div>

        <div className="space-y-16">
          {/* Our Mission */}
          <section className="bg-white/90 backdrop-blur-sm p-8 rounded-[2rem] shadow-soft border border-border pointer-events-auto hover:shadow-lg transition-shadow">
            <h2 className="text-4xl font-handwritten font-bold text-foreground mb-6 my-0">
              Our Mission
            </h2>
            <p className="text-lg leading-relaxed font-medium text-gray-700" style={{ fontFamily: '"Comic Sans MS", "Comic Sans", cursive' }}>
              PetConnect was founded on a singular, driving principle: that every animal deserves a home and every pet owner deserves a community. We aim to create a sustainable, controlled, and safe ecosystem where aspiring adopters, shelter owners, and volunteers can collaborate seamlessly. By integrating social networking with real-time utility, we bridge the gap between the people who care for animals and the resources they need to thrive.
            </p>
          </section>

          {/* Our Story */}
          <section className="bg-pastel-bg/90 backdrop-blur-sm border border-border/60 p-8 rounded-[2rem] relative overflow-hidden pointer-events-auto hover:shadow-lg transition-shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-handwritten font-bold text-foreground mb-6 my-0">
                  Our Story
                </h2>
                <p className="text-lg leading-relaxed font-medium text-gray-700 mb-6" style={{ fontFamily: '"Comic Sans MS", "Comic Sans", cursive' }}>
                  The inspiration behind PetConnect is deeply personal. Our journey began after the tragic loss of a beloved companion, a cat named Google. Google suffered an accident resulting in severe injuries and broken bones. In the frantic moments following the incident, the lack of centralized information regarding nearby emergency vets and 24-hour clinics proved fatal. By the time help was located, it was too late.
                </p>
                <p className="text-lg leading-relaxed font-medium text-gray-700" style={{ fontFamily: '"Comic Sans MS", "Comic Sans", cursive' }}>
                  PetConnect was born from that grief, transformed into a mission to ensure no other pet owner feels that same helplessness. We built the "Helpline" and "Lost & Found" features specifically to provide the immediate, localized data that could have saved Google’s life.
                </p>
              </div>
              <div className="flex justify-center">
                <div className="relative group">
                  <div className="absolute inset-0 bg-pastel-pink/20 rounded-[2rem] transform rotate-6 transition-transform group-hover:rotate-12 duration-300"></div>
                  <img 
                    src={googleCatImg} 
                    alt="Google the Cat" 
                    className="relative rounded-[2rem] object-cover w-full max-w-sm shadow-xl"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Our Vision */}
          <section className="bg-white/90 backdrop-blur-sm p-8 rounded-[2rem] shadow-soft border border-border pointer-events-auto hover:shadow-lg transition-shadow">
            <h2 className="text-4xl font-handwritten font-bold text-foreground mb-6 my-0">
              Our Vision
            </h2>
            <p className="text-lg leading-relaxed font-medium text-gray-700" style={{ fontFamily: '"Comic Sans MS", "Comic Sans", cursive' }}>
              We envision a world where animal welfare is community-driven. Through our verified user tags and secure communication protocols, we provide a professional environment for breeders and shelters, while maintaining a friendly space for volunteers and families. Whether it is through educating new owners or alerting a neighborhood to a lost pet, PetConnect is here to ensure that help is always just a click away.
            </p>
          </section>

          {/* Contact Section */}
          <section className="bg-pastel-blue/10 backdrop-blur-sm p-8 rounded-[2rem] text-center pointer-events-auto hover:shadow-lg transition-shadow">
            <div className="flex justify-center">
              <h2 className="text-4xl font-handwritten font-bold text-foreground mb-6 my-0">
                Contact
              </h2>
            </div>
            <div className="flex justify-center mt-8 font-medium">
              <a href="https://mail.google.com/mail/?view=cm&fs=1&to=mitalipaullol268@gmail.com" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-white text-pastel-pink rounded-2xl shadow-soft hover:scale-105 transition-transform" style={{ fontFamily: '"Comic Sans MS", "Comic Sans", cursive' }}>mitalipaullol268@gmail.com</a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
