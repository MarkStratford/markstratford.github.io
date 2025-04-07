// src/pages/Projects.jsx
import React from "react";

const Projects = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Things I've Played With</h2>
      <ul className="list-disc list-inside">
        <li>3D Printing: Designing toddler-proof gadgets</li>
        <li>Home Automation: Making lights turn on *just because*</li>
        <li>Portfolio Site: You’re looking at it!</li>
        <li>Rocket League Grind: Champ dreams alive</li>
      </ul>
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">30-Day Challenges & F1 Fun</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg hover:shadow-lg">
            <h4 className="text-lg font-bold text-white">30-Day Fasting Challenge</h4>
            <p className="text-gray-300">
              I fasted for 30 days to learn discipline and better health.
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg hover:shadow-lg">
            <h4 className="text-lg font-bold text-white">Learn to Skateboard</h4>
            <p className="text-gray-300">
              Skateboarding for 30 days was a blast — fell a lot, but conquered
              it.
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg hover:shadow-lg">
            <h4 className="text-lg font-bold text-white">Formula 1 Fanatic</h4>
            <p className="text-gray-300">
              Living for race days, studying track strategies, and rooting for
              the best drivers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;
