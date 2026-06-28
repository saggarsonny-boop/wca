/**
 * FREE VIDEO LIBRARY
 *
 * To add a video:
 *   1. Add an object to the array below.
 *   2. Save the file. Done.
 *
 * Fields:
 *   id          — YouTube video ID (the part after ?v= in the URL)
 *                 e.g. for https://www.youtube.com/watch?v=dQw4w9WgXcQ  →  "dQw4w9WgXcQ"
 *                 Use an unlisted video ID so it is only accessible via this embed.
 *   title       — Displayed above the video
 *   description — One or two sentences shown below the title
 *
 * Set id to null to show a placeholder instead of an embed (useful while
 * you are still setting up a video).
 */

const VIDEOS = [
  // Add videos here when ready. Example:
  // {
  //   id: "dQw4w9WgXcQ",           // YouTube video ID
  //   title: "The Map Nobody Hands You",
  //   description: "One or two plain sentences about what this video covers."
  // },
];

// Export for use by videos.js loader
if (typeof module !== "undefined") module.exports = VIDEOS;
