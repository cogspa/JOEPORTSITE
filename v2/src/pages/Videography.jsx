import React from "react";

const GALLERY_IMAGES = [
  "gallery/IMG_2642.jpeg",
  "gallery/IMG_2643.jpeg",
  "gallery/IMG_2654.jpeg",
  "gallery/IMG_2667.jpeg",
  "gallery/IMG_2671.jpeg",
  "gallery/IMG_2676.jpeg",
  "gallery/IMG_4530.jpeg",
  "gallery/P1000235.JPG",
  "gallery/P1000327.JPG",
  "gallery/P1000332.JPG"
];

const LONG_VIDEOS_1 = [
  "https://www.youtube.com/embed/AnpMTMZHGPI?si=coY2OTc2KxwkqdEa",
  "https://www.youtube.com/embed/DNcDtIQAC9s?si=Qg7q7bb01lEtjRJ7",
  "https://www.youtube.com/embed/It9nqbZ4Qrs?si=tWCcCvKmp2Uh7rGG",
  "https://www.youtube.com/embed/EgmsQQPsMxk?si=NXz_3XQ1_IkuCMK7",
  "https://www.youtube.com/embed/Rg7yHmkbHCM?si=c7dT8olkZkRTQLR5",
  "https://www.youtube.com/embed/eDlYq4rhRhg?si=Lm92J2FMweh2Sl6L"
];

const SHORT_VIDEOS = [
  "https://www.youtube.com/embed/LpcH8zijp1g",
  "https://www.youtube.com/embed/6x_P9wiZ2oM",
  "https://www.youtube.com/embed/SX_7UhHW5Pk",
  "https://www.youtube.com/embed/zV0-jc5E4GQ",
  "https://www.youtube.com/embed/PQ9fqFBDSH8",
  "https://www.youtube.com/embed/1l-GTjjkeaM"
];

const LONG_VIDEOS_2 = [
  "https://www.youtube.com/embed/wADzCPBoN1U?si=-OAp9eD4aWU0C6C9",
  "https://www.youtube.com/embed/-meizFt8h_w?si=aZniQrOPclW3bouw"
];

export default function Videography() {
  return (
    <div className="min-h-screen bg-ink text-cream pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 w-full">
        {/* Header */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-12 text-primary">
          VIDEOGRAPHY
        </h1>

        {/* Sub Links */}
        <div className="flex flex-wrap gap-6 mb-16 text-lg">
          <a href="#mpa" className="underline hover:text-primary transition-colors">Motorcar Parts of America</a>
          <a href="#ace" className="underline hover:text-primary transition-colors">ACE Clearwater Enterprises</a>
        </div>

        <h2 className="text-3xl md:text-4xl font-light mb-16">Videos for Manufacturing</h2>

        <div id="mpa" className="pt-4 mb-24">
          <h3 className="text-2xl md:text-3xl font-medium mb-12">Motorcar Parts of America</h3>

          <h4 className="text-xl md:text-2xl font-medium mb-6">MPA innovation Studio Broadcast Garage</h4>
          <p className="text-lg md:text-xl font-light text-cream/80 max-w-4xl mb-12 leading-relaxed">
            At Motorcar Parts of America, I managed an eight-person creative team of motion graphics artists,
            editors, designers, and animators within a hybrid production environment that combined a two-lift
            automotive garage with a state-of-the-art broadcast studio. The facility was outfitted with a full
            Blackmagic production workflow, including four HyperDecks, an HDMI switcher, Blackmagic 4K cameras, a
            Yamaha sound board, DMX lighting, ARRI SkyPanel LED fixtures, and Crestron-controlled lighting systems.
            I was responsible for both team leadership and oversight of the studio's production equipment, technical
            infrastructure, control decks, and servers.
          </p>

          {/* Scrolling Gallery */}
          <div className="w-full overflow-hidden gallery-track-container pause-on-hover mb-24 -mx-6 px-6 relative">
            <div className="flex w-max animate-scroll-left gap-6">
              {[...GALLERY_IMAGES, ...GALLERY_IMAGES].map((src, i) => (
                <div key={i} className="w-[300px] md:w-[400px] aspect-[4/3] flex-shrink-0 overflow-hidden bg-ink-2 rounded-lg">
                  <img src={`/${src}`} alt="Broadcast Garage" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            {/* Fade overlays for smooth scrolling effect edges */}
            <div className="absolute inset-y-0 left-0 w-12 md:w-32 bg-gradient-to-r from-ink to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-12 md:w-32 bg-gradient-to-l from-ink to-transparent pointer-events-none" />
          </div>

          <h4 className="text-xl md:text-2xl font-medium mb-6">Long-Format Technical Video Series</h4>
          <p className="text-lg md:text-xl font-light text-cream/80 max-w-4xl mb-6 leading-relaxed">
            As Director of the Innovation Studio at MPA, I led the development, scripting, editing, direction, motion
            graphics (using After Effects), and animation strategy (using Blender and Maya) for this video series.
            Animation was used to make complex automotive concepts easier to understand by revealing internal
            mechanics, visualizing failure points, and adding clarity where live-action footage alone was not enough.
          </p>
          <ul className="list-disc pl-6 text-lg md:text-xl font-light text-cream/80 max-w-4xl mb-12 space-y-2">
            <li>Clarifies hidden mechanical processes</li>
            <li>Helps explain part failure and installation issues</li>
            <li>Supports educational content for technicians and DIY installers</li>
          </ul>

          <div className="w-full overflow-hidden gallery-track-container pause-on-hover mb-24 -mx-6 px-6 relative">
            <div className="flex w-max animate-scroll-left gap-6">
              {[...LONG_VIDEOS_1, ...LONG_VIDEOS_1].map((src, i) => (
                <div key={i} className="w-[350px] md:w-[500px] aspect-video flex-shrink-0 bg-ink-2 rounded-lg overflow-hidden">
                  <iframe src={src} className="w-full h-full border-none pointer-events-auto" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                </div>
              ))}
            </div>
            {/* Fade overlays */}
            <div className="absolute inset-y-0 left-0 w-12 md:w-32 bg-gradient-to-r from-ink to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-12 md:w-32 bg-gradient-to-l from-ink to-transparent pointer-events-none" />
          </div>

          <h4 className="text-xl md:text-2xl font-medium mb-6">Short-Format Story Videos</h4>
          <p className="text-lg md:text-xl font-light text-cream/80 max-w-4xl mb-12 leading-relaxed">
            In addition to long-form installation and educational content, I developed a short-form video strategy that reused footage from
            our larger library, allowing the team to create more content quickly and publish several times a week.
            This helped grow our YouTube channel, supported warranty reduction through better installer education,
            and created a well-structured media library with potential future value for AI training and smarter
            content workflows.
          </p>

          <div className="w-full overflow-hidden gallery-track-container pause-on-hover mb-24 -mx-6 px-6 relative">
            <div className="flex w-max animate-scroll-left gap-6" style={{ animationDuration: '60s' }}>
              {[...SHORT_VIDEOS, ...SHORT_VIDEOS].map((src, i) => (
                <div key={i} className="w-[200px] md:w-[280px] aspect-[9/16] flex-shrink-0 bg-ink-2 rounded-lg overflow-hidden">
                  <iframe src={src} className="w-full h-full border-none pointer-events-auto" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                </div>
              ))}
            </div>
            {/* Fade overlays */}
            <div className="absolute inset-y-0 left-0 w-12 md:w-32 bg-gradient-to-r from-ink to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-12 md:w-32 bg-gradient-to-l from-ink to-transparent pointer-events-none" />
          </div>
        </div>

        <div id="ace" className="pt-4">
          <h4 className="text-xl md:text-2xl font-medium mb-6">ACE Clearwater / DASH9 Productions</h4>
          <p className="text-lg md:text-xl font-light text-cream/80 max-w-4xl mb-12 leading-relaxed">
            At ACE Clearwater, an aerospace manufacturer in Torrance California, I helped establish a small studio
            called DASH9 Productions. In overseeing this effort, the goal was to produce video training content to
            help train the next generation of drop hammer and manufacturing tool operators. Zbrush was used to speed up the
            modeling process with rendering and animation done in Blender.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {LONG_VIDEOS_2.map((src, i) => (
              <div key={i} className="w-full aspect-video bg-ink-2 rounded-lg overflow-hidden">
                <iframe src={src} className="w-full h-full border-none" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
