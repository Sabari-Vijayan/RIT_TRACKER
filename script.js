// Initialize the viewer with the first scene
var viewer = pannellum.viewer("panorama", {
  default: {
    firstScene: "scene1",
    sceneFadeDuration: 1000,
  },
  scenes: {
    scene1: {
      title: "First Scene",
      panorama: "images\\1.jpg", // Replace with the path to your first image
      hotSpots: [
        {
          pitch: 0, // Vertical angle
          yaw: 30, // Horizontal angle
          type: "scene",
          text: "Go to Second Scene",
          sceneId: "scene2",
        },
      ],
    },
    scene2: {
      title: "Second Scene",
      panorama: "images\\2.jpg", // Replace with the path to your second image
      hotSpots: [
        {
          pitch: 0,
          yaw: -30,
          type: "scene",
          text: "Back to First Scene",
          sceneId: "scene1",
        },
      ],
    },
  },
});
