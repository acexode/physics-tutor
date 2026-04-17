import type { SyllabusTopic } from "./types";

/** JAMB UTME Physics detailed syllabus (topics 1–39). Objectives condensed from official syllabus text. */
export const SYLLABUS_TOPICS: SyllabusTopic[] = [
  {
    id: "measurements-and-units",
    jambNumber: 1,
    title: "Measurements and Units",
    contentNotes:
      "Length, area, volume; mass and balances; time; fundamental and derived quantities; dimensions; experimental limitations; distance, displacement, position.",
    objectives: [
      "Identify units of length, area, and volume; use measuring instruments; find lengths, areas, and volumes of regular and irregular bodies.",
      "Identify the unit of mass; use simple beam balances (e.g. Burchart’s, chemical balance).",
      "Identify the unit of time; use different time-measuring devices; relate fundamental quantities to their units.",
      "Deduce units of derived quantities; find dimensions; use dimensions to find units; test homogeneity of equations.",
      "Assess accuracy of instruments; estimate simple errors; express measurements in standard form.",
      "Use strings, ruler, calipers, micrometer; note degree of accuracy; identify distance in a specified direction; use compass/protractor and Cartesian coordinates; plot graphs and draw inferences.",
    ],
  },
  {
    id: "scalars-and-vectors",
    jambNumber: 2,
    title: "Scalars and Vectors",
    contentNotes:
      "Definitions and examples; relative velocity; resolution of vectors; graphical methods.",
    objectives: [
      "Distinguish scalar and vector quantities; give examples.",
      "Find resultant of two or more vectors; determine relative velocity.",
      "Resolve vectors into two perpendicular components; use graphical methods for vector problems.",
    ],
  },
  {
    id: "motion",
    jambNumber: 3,
    title: "Motion",
    contentNotes:
      "Types of motion; forces; linear motion; projectiles; Newton’s laws; circular motion; SHM; forced vibration and resonance.",
    objectives: [
      "Identify types of motion; solve numerical problems on collinear motion; identify force as cause of motion; recognise contact and field forces.",
      "Differentiate speed, velocity, acceleration; deduce equations of uniformly accelerated motion; solve motion under gravity; interpret distance–time and velocity–time graphs; compute instantaneous velocity and acceleration.",
      "Derive range, maximum height, and time of flight for projectiles; solve projectile problems; solve problems on impulse, momentum, and conservation of linear momentum; interpret force–time graphs.",
      "Find angular velocity and acceleration, centripetal/centrifugal forces; solve circular motion problems.",
      "Relate period and frequency; analyse energy changes in SHM; identify forced vibration and applications of resonance.",
    ],
  },
  {
    id: "gravitational-field",
    jambNumber: 4,
    title: "Gravitational Field",
    contentNotes:
      "Newton’s law of gravitation; gravitational potential; conservative fields; g and its variation; mass vs weight; escape velocity; orbits and weightlessness.",
    objectives: [
      "Identify and apply Newton’s law of universal gravitation; give examples of conservative and non-conservative fields.",
      "Deduce gravitational field potential; explain variation of g on Earth’s surface; differentiate mass and weight; determine escape velocity.",
    ],
  },
  {
    id: "equilibrium-of-forces",
    jambNumber: 5,
    title: "Equilibrium of Forces",
    contentNotes:
      "Coplanar forces; triangles and polygons; Lami’s theorem; moments; equilibrium of rigid bodies; centre of gravity and stability.",
    objectives: [
      "Apply conditions for equilibrium of coplanar forces; use triangle/polygon laws and Lami’s theorem.",
      "Analyse principle of moments; find moment of a force and couple; apply equilibrium of rigid bodies; resolve forces; find resultant and equilibrant.",
      "Differentiate stable, unstable, and neutral equilibrium.",
    ],
  },
  {
    id: "work-energy-power",
    jambNumber: 6,
    title: "Work, Energy and Power",
    contentNotes:
      "Work, energy, power; forms of energy; conservation; force–distance graphs; energy and society; dams; nuclear and solar energy.",
    objectives: [
      "Differentiate work, energy, and power; compare forms of energy; apply conservation of energy; interpret area under force–distance curve; solve numerical problems.",
      "List energy sources; distinguish renewable and non-renewable; discuss diversification, environment, crises, conversion, and devices; describe dams and energy production.",
    ],
  },
  {
    id: "friction",
    jambNumber: 7,
    title: "Friction",
    contentNotes:
      "Static and kinetic friction; coefficient; advantages/disadvantages; reduction; viscosity and terminal velocity; Stokes’ law.",
    objectives: [
      "Differentiate static and dynamic friction; determine coefficient of limiting friction; compare advantages/disadvantages; suggest reduction methods.",
      "Analyse factors affecting viscosity and terminal velocity; apply Stokes’ law.",
    ],
  },
  {
    id: "simple-machines",
    jambNumber: 8,
    title: "Simple Machines",
    contentNotes:
      "Definitions; types; mechanical advantage, velocity ratio, efficiency.",
    objectives: [
      "Identify types of simple machines; solve problems involving MA, VR, and efficiency.",
    ],
  },
  {
    id: "elasticity",
    jambNumber: 9,
    title: "Elasticity",
    contentNotes:
      "Elastic limit, yield, breaking point; Hooke’s law; Young’s modulus; spring balance; work in springs.",
    objectives: [
      "Interpret force–extension curves; apply Hooke’s law and Young’s modulus; use spring balance; determine work done in springs and elastic strings.",
    ],
  },
  {
    id: "pressure",
    jambNumber: 10,
    title: "Pressure",
    contentNotes:
      "Atmospheric pressure; units (Pa); barometers; variation with height; liquids; Pascal’s principle.",
    objectives: [
      "Recognise SI unit of pressure; identify pressure instruments; relate pressure to height; use barometer as altimeter.",
      "Relate pressure, depth, and density; apply Pascal’s principle; solve liquid pressure problems.",
    ],
  },
  {
    id: "liquids-at-rest",
    jambNumber: 11,
    title: "Liquids at Rest",
    contentNotes:
      "Density; relative density; upthrust; Archimedes’ principle; law of floatation; applications.",
    objectives: [
      "Distinguish density and relative density; find upthrust; apply Archimedes’ principle and law of floatation to solve problems.",
    ],
  },
  {
    id: "temperature-and-measurement",
    jambNumber: 12,
    title: "Temperature and Its Measurement",
    contentNotes:
      "Temperature concept; thermometric properties; calibration; Celsius and Kelvin; types of thermometers.",
    objectives: [
      "Identify thermometric properties; calibrate thermometers; compare Celsius and Kelvin; compare thermometer types; convert between scales.",
    ],
  },
  {
    id: "thermal-expansion",
    jambNumber: 13,
    title: "Thermal Expansion",
    contentNotes:
      "Linear, area, volume expansivities in solids; liquids; anomalous expansion of water.",
    objectives: [
      "Determine linear and volume expansivities; assess effects and applications; relate different expansivities.",
      "Determine real and apparent expansivities of liquids; analyse anomalous expansion of water.",
    ],
  },
  {
    id: "gas-laws",
    jambNumber: 14,
    title: "Gas Laws",
    contentNotes:
      "Boyle’s, Charles’, pressure laws; absolute zero; general and ideal gas equations; Van der Waals gas.",
    objectives: [
      "Interpret gas laws; use expressions to solve numerical problems; interpret Van der Waals equation for one mole.",
    ],
  },
  {
    id: "quantity-of-heat",
    jambNumber: 15,
    title: "Quantity of Heat",
    contentNotes:
      "Heat as energy; heat capacity and specific heat capacity; methods of determination.",
    objectives: [
      "Differentiate heat capacity and specific heat capacity; determine them by simple methods; solve numerical problems.",
    ],
  },
  {
    id: "change-of-state",
    jambNumber: 16,
    title: "Change of State",
    contentNotes:
      "Latent heat; fusion and vaporization; melting, evaporation, boiling; effects of pressure and solutes; applications.",
    objectives: [
      "Differentiate latent heat and specific latent heats; differentiate melting, evaporation, and boiling; examine effects of pressure and dissolved substances; solve numerical problems.",
    ],
  },
  {
    id: "vapours",
    jambNumber: 17,
    title: "Vapours",
    contentNotes:
      "Saturated and unsaturated vapours; SVP and boiling; dew point; humidity; hygrometry.",
    objectives: [
      "Distinguish saturated and unsaturated vapours; relate SVP to boiling; determine SVP by barometer tube method.",
      "Differentiate dew point, humidity, and relative humidity; estimate humidity with wet and dry bulb hygrometers; solve numerical problems.",
    ],
  },
  {
    id: "structure-of-matter-kinetic-theory",
    jambNumber: 18,
    title: "Structure of Matter and Kinetic Theory",
    contentNotes:
      "Atoms and molecules; Brownian motion, diffusion, surface tension, capillarity; kinetic theory assumptions; pressure, gas laws, phase changes.",
    objectives: [
      "Differentiate atoms and molecules; use molecular theory to explain Brownian motion, diffusion, surface tension, capillarity, adhesion, cohesion, contact angle.",
      "Examine kinetic theory assumptions; interpret kinetic theory for pressure, Boyle’s and Charles’ laws, melting, boiling, vaporization, temperature, evaporation.",
    ],
  },
  {
    id: "heat-transfer",
    jambNumber: 19,
    title: "Heat Transfer",
    contentNotes:
      "Conduction, convection, radiation; thermal conductivity; surfaces; thermos flask; land/sea breeze; engines.",
    objectives: [
      "Differentiate modes of heat transfer; solve problems on temperature gradient, conductivity, and heat flux.",
      "Assess effect of surface on radiation; compare conductivities of materials; relate parts of a thermos flask; differentiate land and sea breeze; outline principles of jet engines and rockets.",
    ],
  },
  {
    id: "waves",
    jambNumber: 20,
    title: "Waves",
    contentNotes:
      "Production and propagation; classification; reflection, refraction, diffraction, polarization; superposition, interference, beats; Doppler effect.",
    objectives: [
      "Interpret wave motion; identify sources of waves; use waves as energy transfer; distinguish particle and wave motion; relate $V=f\\lambda$; phase difference, wave number, wave vector; progressive wave equation.",
      "Classify mechanical/electromagnetic, longitudinal/transverse, stationary/progressive waves; give examples from springs, strings, ripple tank.",
      "Differentiate reflection, refraction, diffraction, plane polarization; analyse superposition; solve wave numericals; explain beats and Doppler effect for sound.",
    ],
  },
  {
    id: "propagation-of-sound",
    jambNumber: 21,
    title: "Propagation of Sound Waves",
    contentNotes:
      "Material medium; speed in solids, liquids, gases; echoes; reverberation.",
    objectives: [
      "Explain need for a medium; compare speed of sound in solids, liquids, and air; relate temperature and pressure to speed in air.",
      "Solve problems on echoes, reverberation, and speed; compare advantages and disadvantages of echoes.",
    ],
  },
  {
    id: "characteristics-of-sound",
    jambNumber: 22,
    title: "Characteristics of Sound Waves",
    contentNotes:
      "Noise vs musical notes; quality, pitch, intensity, loudness; overtones; resonance; air columns in pipes.",
    objectives: [
      "Differentiate noise and musical notes; analyse quality, pitch, intensity, loudness and applications to instruments.",
      "Identify overtones in strings and air columns; give acoustical examples of resonance; find frequencies of notes from open/closed pipes and lengths.",
    ],
  },
  {
    id: "light-energy",
    jambNumber: 23,
    title: "Light Energy",
    contentNotes:
      "Sources; luminous vs non-luminous; speed, frequency, wavelength; shadows, eclipses; pin-hole camera.",
    objectives: [
      "Compare natural and artificial sources; differentiate luminous and non-luminous objects; relate speed, frequency, and wavelength.",
      "Interpret shadows and eclipses; solve pin-hole camera problems.",
    ],
  },
  {
    id: "reflection-of-light",
    jambNumber: 24,
    title: "Reflection of Light at Plane and Curved Surfaces",
    contentNotes:
      "Laws of reflection; plane, concave, convex mirrors; mirror formula; linear magnification; applications.",
    objectives: [
      "Interpret laws of reflection; illustrate images by plane, concave, and convex mirrors; apply mirror formula; find linear magnification.",
      "Apply reflection to periscope, kaleidoscope, sextant.",
    ],
  },
  {
    id: "refraction-of-light",
    jambNumber: 25,
    title: "Refraction of Light Through Plane and Curved Surfaces",
    contentNotes:
      "Refraction and speed in media; Snell’s law; refractive index; real/apparent depth; critical angle and TIR; prisms; lenses.",
    objectives: [
      "Interpret laws of refraction; find refractive index using Snell’s law and real/apparent depth; determine conditions for total internal reflection.",
      "Examine uses of periscope, prism, binoculars, optical fibre; apply TIR to mirage; use lens formula and ray diagrams; find magnification and refractive index using minimum deviation.",
    ],
  },
  {
    id: "optical-instruments",
    jambNumber: 26,
    title: "Optical Instruments",
    contentNotes:
      "Microscope, telescope, projector, camera, human eye; power of lens; angular magnification; near/far points; defects of vision.",
    objectives: [
      "Apply principles of optical instruments to solve problems; distinguish eye and camera; calculate power of a lens and angular magnification.",
      "Determine near and far points; identify sight defects and corrections.",
    ],
  },
  {
    id: "dispersion-and-electromagnetic-spectrum",
    jambNumber: 27,
    title: "Dispersion of Light and Colours / Electromagnetic Spectrum",
    contentNotes:
      "Dispersion by prism; pure spectrum; colour mixing; colour of objects and filters; rainbow; EM spectrum.",
    objectives: [
      "Identify primary colours and obtain secondary colours by mixing; understand rainbow formation; explain colours of objects; use colour filters.",
      "Analyse electromagnetic spectrum: wavelengths, sources, detection, and uses.",
    ],
  },
  {
    id: "electrostatics",
    jambNumber: 28,
    title: "Electrostatics",
    contentNotes:
      "Charges; charging by friction, contact, induction; electroscope; Coulomb’s law; field and potential; lightning.",
    objectives: [
      "Identify charges; use electroscope; apply Coulomb’s law; deduce field intensity and potential difference; interpret flux patterns; analyse charge on conductors and lightning conductors.",
    ],
  },
  {
    id: "capacitors",
    jambNumber: 29,
    title: "Capacitors",
    contentNotes:
      "Types; parallel plate; capacitance; series and parallel; energy stored.",
    objectives: [
      "Determine uses of capacitors; analyse parallel plate capacitors; find capacitance and factors affecting it; solve series/parallel arrangements; find energy stored.",
    ],
  },
  {
    id: "electric-cells",
    jambNumber: 30,
    title: "Electric Cells",
    contentNotes:
      "Voltaic cell and defects; Daniel, Leclanche; lead-acid, NiFe, Li, HgCd; maintenance; arrangement; efficiency.",
    objectives: [
      "Identify voltaic cell defects and corrections; compare cell types including solar; compare lead-acid and NiFe advantages.",
      "Solve problems on series and parallel combinations of cells.",
    ],
  },
  {
    id: "current-electricity",
    jambNumber: 31,
    title: "Current Electricity",
    contentNotes:
      "Emf, p.d., current, internal resistance, lost volt; Ohm’s law; resistance measurement; metre bridge; series/parallel; potentiometer; networks.",
    objectives: [
      "Differentiate emf, p.d., current, internal resistance; apply Ohm’s law; use metre bridge; compute effective resistance; find resistivity and conductivity.",
      "Use potentiometer for emf, current, internal resistance; identify potentiometer advantages; apply Kirchhoff’s laws.",
    ],
  },
  {
    id: "electrical-energy-and-power",
    jambNumber: 32,
    title: "Electrical Energy and Power",
    contentNotes:
      "Energy and power expressions; commercial units; transmission; heating effects; house wiring; fuses.",
    objectives: [
      "Apply energy and power expressions; analyse power transmission from station to consumer; identify heating effects and uses.",
      "Identify advantages of parallel over series wiring; determine fuse rating.",
    ],
  },
  {
    id: "magnets-and-magnetic-fields",
    jambNumber: 33,
    title: "Magnets and Magnetic Fields",
    contentNotes:
      "Natural and artificial magnets; soft iron vs steel; making and demagnetizing; field concepts; fields due to currents; Earth’s field; applications.",
    objectives: [
      "Give examples of natural and artificial magnets; differentiate magnetic properties of soft iron and steel; describe making and demagnetizing and preserving magnets.",
      "Determine flux patterns for currents in wires, coils, solenoids; identify Earth’s magnetic elements; describe variation of field on Earth’s surface; outline applications in navigation and exploration.",
    ],
  },
  {
    id: "force-on-conductor-in-field",
    jambNumber: 34,
    title: "Force on a Current-Carrying Conductor in a Magnetic Field",
    contentNotes:
      "Force between parallel conductors; force on moving charge; DC motor; electromagnets; microphones; meters; galvanometer conversion; sensitivity.",
    objectives: [
      "Use Fleming’s left-hand rule; interpret forces between parallel conductors; relate force, B, v, and angle for moving charge; interpret DC motor and electromagnets.",
      "Compare moving iron and moving coil instruments; convert galvanometer to ammeter/voltmeter; identify factors affecting galvanometer sensitivity.",
    ],
  },
  {
    id: "electromagnetic-induction",
    jambNumber: 35,
    title: "Electromagnetic Induction",
    contentNotes:
      "Faraday’s laws; factors affecting induced emf; Lenz’s law; AC/DC generators; transformers; induction coil; inductance; eddy currents.",
    objectives: [
      "Interpret laws of electromagnetic induction; identify factors affecting induced emf; relate Lenz’s law to conservation of energy.",
      "Interpret AC/DC generator setups; identify transformer types and principles; assess induction coil; analyse inductance, units, series/parallel inductors, energy in inductor, eddy current reduction and uses.",
    ],
  },
  {
    id: "simple-ac-circuits",
    jambNumber: 36,
    title: "Simple A. C. Circuits",
    contentNotes:
      "AC current and voltage; peak and r.m.s.; R, C, L circuits; reactance; series RLC; phasors; impedance; resonance.",
    objectives: [
      "Differentiate AC and DC quantities; find peak and r.m.s. values; determine phase relationships.",
      "Interpret series RLC; analyse phasor diagrams; calculate effective voltage, reactance, impedance; recognise resonance and resonant frequency; find power factor and average power.",
    ],
  },
  {
    id: "conduction-through-liquids-and-gases",
    jambNumber: 37,
    title: "Conduction of Electricity Through Liquids and Gases",
    contentNotes:
      "Electrolytes; electrolysis; Faraday’s laws; applications; discharge through gases (qualitative).",
    objectives: [
      "Distinguish electrolytes and non-electrolytes; analyse electrolysis; apply Faraday’s laws; analyse discharge through gases and applications.",
    ],
  },
  {
    id: "elementary-modern-physics",
    jambNumber: 38,
    title: "Elementary Modern Physics",
    contentNotes:
      "Atomic models; structure; energy levels and spectra; thermionic and photoelectric effects; X-rays; radioactivity; half-life; fusion/fission; binding energy; duality; uncertainty.",
    objectives: [
      "Identify atomic models and limitations; describe atomic structure; differentiate energy levels and spectra.",
      "Compare thermionic and photoelectric emission; apply Einstein’s photoelectric equation; calculate stopping potential; describe X-ray production and properties.",
      "Analyse radioactivity; distinguish stable/unstable nuclei; identify isotopes; compare α, β, γ; relate half-life and decay constant; find binding energy and mass defect; analyse wave–particle duality.",
    ],
  },
  {
    id: "introductory-electronics",
    jambNumber: 39,
    title: "Introductory Electronics",
    contentNotes:
      "Metals, semiconductors, insulators (band gap); intrinsic/extrinsic; n-type and p-type; diodes and transistors; rectification and amplification.",
    objectives: [
      "Differentiate conductors, semiconductors, and insulators; distinguish intrinsic and extrinsic semiconductors; distinguish electron and hole carriers.",
      "Distinguish n-type and p-type; analyse diodes and transistors; relate diodes to rectification and transistors to amplification.",
    ],
  },
];

export function getTopicById(id: string): SyllabusTopic | undefined {
  return SYLLABUS_TOPICS.find((t) => t.id === id);
}

export function getTopicByJambNumber(n: number): SyllabusTopic | undefined {
  return SYLLABUS_TOPICS.find((t) => t.jambNumber === n);
}
