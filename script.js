// Import Firebase SDK (ES Module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAxOg24lKbHYLfNKF1-99Lv6xsjYaVjiV8",
  authDomain: "countdowntimer-74ae7.firebaseapp.com",
  databaseURL: "https://countdowntimer-74ae7-default-rtdb.firebaseio.com",
  projectId: "countdowntimer-74ae7",
  storageBucket: "countdowntimer-74ae7.firebasestorage.app",
  messagingSenderId: "252439672400",
  appId: "1:252439672400:web:e633026072ee108965c355",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const timerRef = ref(database, "timer");

let remainingTime = 60;
let isPaused = true;
let timerInterval;

function updateTimerDisplay() {
  const minutes = Math.floor(Math.abs(remainingTime) / 60);
  const seconds = Math.abs(remainingTime) % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
  document.getElementById("timer").textContent = formattedTime;
  document
    .getElementById("timer")
    .classList.toggle("overtime", remainingTime < 0);
}

function syncTimer(time, paused) {
  set(timerRef, { remainingTime: time, isPaused: paused });
}

function startPauseTimer() {
  if (isPaused) {
    timerInterval = setInterval(() => {
      remainingTime--;
      updateTimerDisplay();
      syncTimer(remainingTime, false); // Sync as running
    }, 1000);
  } else {
    clearInterval(timerInterval);
    syncTimer(remainingTime, true); // Sync as paused
  }
  isPaused = !isPaused;
}

function resetTimer() {
  clearInterval(timerInterval);
  isPaused = true;
  remainingTime = 60;
  updateTimerDisplay();
  syncTimer(remainingTime, true);
}

function adjustTime(amount) {
  remainingTime += amount;
  updateTimerDisplay();
  syncTimer(remainingTime, isPaused);
}

// ✅ Toggle Full-Screen Mode
function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

// Wait until the DOM is fully loaded before adding event listeners
document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("addMin")
    .addEventListener("click", () => adjustTime(60));
  document
    .getElementById("subMin")
    .addEventListener("click", () => adjustTime(-60));
  document
    .getElementById("addSec")
    .addEventListener("click", () => adjustTime(10));
  document
    .getElementById("subSec")
    .addEventListener("click", () => adjustTime(-10));
  document
    .getElementById("startPause")
    .addEventListener("click", startPauseTimer);
  document.getElementById("reset").addEventListener("click", resetTimer);
  document
    .getElementById("fullscreen")
    .addEventListener("click", toggleFullScreen); // Full Screen Button

  // ✅ Keyboard Shortcuts
  document.addEventListener("keydown", (event) => {
    switch (event.key) {
      case " ":
        startPauseTimer();
        break; // Space = Start/Pause
      case "ArrowUp":
        adjustTime(60);
        break; // Up = +1 min
      case "ArrowDown":
        adjustTime(-60);
        break; // Down = -1 min
      case "ArrowRight":
        adjustTime(10);
        break; // Right = +10 sec
      case "ArrowLeft":
        adjustTime(-10);
        break; // Left = -10 sec
      case "r":
        resetTimer();
        break; // R = Reset
      case "f":
        toggleFullScreen();
        break; // F = Full Screen
    }
  });
});

// Sync changes from Firebase (Real-time update)
onValue(timerRef, (snapshot) => {
  const data = snapshot.val();
  if (data) {
    remainingTime = data.remainingTime;
    updateTimerDisplay();

    // Only update pause state if different
    if (data.isPaused !== isPaused) {
      isPaused = data.isPaused;
      if (!isPaused) startPauseTimer();
    }
  }
});

updateTimerDisplay();
