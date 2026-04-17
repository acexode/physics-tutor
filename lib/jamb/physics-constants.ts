import type { PhysicsConstant } from "./types";

export const PHYSICS_CONSTANTS: PhysicsConstant[] = [
  {
    id: "g",
    label: "Acceleration due to gravity (JAMB default)",
    latex: "g = 10\\ \\mathrm{m\\,s^{-2}}",
    notes: "Use in problems unless another value is stated.",
  },
  {
    id: "c",
    label: "Speed of light in vacuum",
    latex: "c \\approx 3.0\\times 10^8\\ \\mathrm{m\\,s^{-1}}",
  },
  {
    id: "sound-air",
    label: "Speed of sound in air (order of magnitude)",
    latex: "v \\approx 330\\ \\mathrm{m\\,s^{-1}}",
    notes: "Problems often use 340 or 250 as stated.",
  },
  {
    id: "rho-water",
    label: "Density of water",
    latex: "\\rho_{\\text{water}} \\approx 1000\\ \\mathrm{kg\\,m^{-3}}",
  },
  {
    id: "e",
    label: "Elementary charge",
    latex: "e \\approx 1.6\\times 10^{-19}\\ \\mathrm{C}",
  },
];
