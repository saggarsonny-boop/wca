/**
 * FREE CHAPTER LIBRARY
 *
 * To add a chapter:
 *   1. Add an object to the CHAPTERS array below.
 *   2. Save the file. Done.
 *
 * Fields:
 *   title       — Displayed as the chapter heading (required)
 *   description — One or two sentences shown below the title (required)
 *   audioUrl    — URL to the audio file, e.g. "/assets/audio/chapter-01.mp3"
 *                 Leave null to show "Audio coming soon" instead of a player.
 *   textUrl     — URL to a PDF or page with the written chapter, e.g. "/assets/pdf/chapter-01.pdf"
 *                 Leave null to hide the read link.
 *   number      — Optional display number, e.g. "01". If omitted, order in array is used.
 */

const CHAPTERS = [
  // Add chapters here when ready. Example:
  // {
  //   title: "The Map Nobody Hands You",
  //   description: "One or two plain sentences about what this chapter covers.",
  //   audioUrl: "/assets/audio/chapter-01.mp3",
  //   textUrl: null,
  //   number: "01"
  // },
];

// Export for use by chapters.js loader
if (typeof module !== "undefined") module.exports = CHAPTERS;
