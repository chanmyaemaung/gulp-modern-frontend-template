// Declare constants with destructuring assignment
const [progress, prev, next] = [
  document.getElementById("progress"),
  document.getElementById("prev"),
  document.getElementById("next"),
];

// Use querySelectorAll to select all elements with class "progress__step"
const steps = document.querySelectorAll(".progress__step");

let currentActive = 1;

// Use arrow functions for event listeners
next.addEventListener("click", () => {
  currentActive = Math.min(currentActive + 1, steps.length);
  update();
});

prev.addEventListener("click", () => {
  currentActive = Math.max(currentActive - 1, 1);
  update();
});

function update() {
  // Use forEach to loop through steps array
  steps.forEach((step, index) => {
    step.classList.toggle("progress__step--active", index < currentActive);
  });

  const actives = document.querySelectorAll(".progress__step--active");

  progress.style.width =
    ((actives.length - 1) / (steps.length - 1)) * 100 + "%";

  prev.disabled = currentActive === 1;
  next.disabled = currentActive === steps.length;
  next.style.cursor = next.disabled ? "not-allowed" : "pointer";

  // Use CSS to style cursor
  prev.style.cursor = prev.disabled ? "not-allowed" : "pointer";
}