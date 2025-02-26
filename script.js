// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAxOg24lKbHYLfNKF1-99Lv6xsjYaVjiV8",
  authDomain: "countdowntimer-74ae7.firebaseapp.com",
  databaseURL: "https://countdowntimer-74ae7-default-rtdb.firebaseio.com",
  projectId: "countdowntimer-74ae7",
  storageBucket: "countdowntimer-74ae7.firebasestorage.app",
  messagingSenderId: "252439672400",
  appId: "1:252439672400:web:e633026072ee108965c355"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const timerRef = ref(database, "timer");

// Variables
let remainingTime = 60; // Default timer in seconds
let isRunning = false;
let startTime = null; // Time when the countdown starts

// Update UI Timer
function updateTimerDisplay() {
  const minutes = Math.floor(Math.abs(remainingTime) / 60);
  const seconds = Math.abs(remainingTime) % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  document.getElementById("timer").textContent = formattedTime;
  document.getElementById("timer").classList.toggle("overtime", remainingTime < 0);
}

// Sync to Firebase
function syncTimer(time, running, startTimestamp) {
  set(timerRef, { remainingTime: time, isRunning: running, startTime: startTimestamp });
}

// Start/Pause Timer
function startPauseTimer() {
  if (isRunning) {
    syncTimer(remainingTime, false, null); // Stop the timer
  } else {
    const now = Date.now();
    syncTimer(remainingTime, true, now); // Start the timer
  }
}

// Reset Timer
function resetTimer() {
  remainingTime = 60;
  isRunning = false;
  syncTimer(remainingTime, false, null);
}

// Adjust Time
function adjustTime(amount) {
  remainingTime += amount;
  updateTimerDisplay();
  syncTimer(remainingTime, isRunning, startTime);
}

// Listen for Firebase Changes
onValue(timerRef, (snapshot) => {
  const data = snapshot.val();
  if (data) {
    const now = Date.now();
    
    if (data.isRunning) {
      // Calculate the new remaining time based on the stored start time
      const elapsed = Math.floor((now - data.startTime) / 1000);
      remainingTime = data.remainingTime - elapsed;
      isRunning = true;

      // Update UI
      updateTimerDisplay();
    } else {
      remainingTime = data.remainingTime;
      isRunning = false;
      updateTimerDisplay();
    }
  }
});

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("addMin").addEventListener("click", () => adjustTime(60));
  document.getElementById("subMin").addEventListener("click", () => adjustTime(-60));
  document.getElementById("addSec").addEventListener("click", () => adjustTime(10));
  document.getElementById("subSec").addEventListener("click", () => adjustTime(-10));
  document.getElementById("startPause").addEventListener("click", startPauseTimer);
  document.getElementById("reset").addEventListener("click", resetTimer);
});

// Keep timer running even when device sleeps
updateTimerDisplay();
