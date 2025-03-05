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



// Timer Variables

let remainingTime = 60; // Default countdown (in seconds)

let isRunning = false;

let startTime = null;

let timerInterval = null;



// Function to update the display

function updateTimerDisplay() {

  const minutes = Math.floor(Math.abs(remainingTime) / 60);

  const seconds = Math.abs(remainingTime) % 60;

  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  document.getElementById("timer").textContent = formattedTime;

  document.getElementById("timer").classList.toggle("overtime", remainingTime < 0);

}



// Sync Timer with Firebase

function syncTimer(time, running, startTimestamp) {

  set(timerRef, { remainingTime: time, isRunning: running, startTime: startTimestamp });

}



// Start/Pause Timer

function startPauseTimer() {

  if (isRunning) {

    isRunning = false;

    clearInterval(timerInterval);

    syncTimer(remainingTime, false, null);

  } else {

    isRunning = true;

    startTime = Date.now();

    syncTimer(remainingTime, true, startTime);

    runTimer();

  }

}



// Function to keep timer running

function runTimer() {

  clearInterval(timerInterval);

  timerInterval = setInterval(() => {

    const elapsed = Math.floor((Date.now() - startTime) / 1000);

    remainingTime -= elapsed;

    startTime = Date.now(); // Reset start time to prevent drift

    updateTimerDisplay();

    syncTimer(remainingTime, isRunning, startTime);

  }, 1000);

}



// Reset Timer

function resetTimer() {

  isRunning = false;

  remainingTime = 60;

  clearInterval(timerInterval);

  syncTimer(remainingTime, false, null);

  updateTimerDisplay();

}



// Adjust Timer

function adjustTime(amount) {

  remainingTime += amount;

  updateTimerDisplay();

  syncTimer(remainingTime, isRunning, startTime);

}



// Listen for Firebase Updates

onValue(timerRef, (snapshot) => {

  const data = snapshot.val();

  if (data) {

    const now = Date.now();

    if (data.isRunning) {

      const elapsed = Math.floor((now - data.startTime) / 1000);

      remainingTime = data.remainingTime - elapsed;

      isRunning = true;

      updateTimerDisplay();

      runTimer(); // Restart timer loop

    } else {

      remainingTime = data.remainingTime;

      isRunning = false;

      clearInterval(timerInterval);

      updateTimerDisplay();

    }

  }

});



// Event Listeners for Buttons

document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("addMin").addEventListener("click", () => adjustTime(60));

  document.getElementById("subMin").addEventListener("click", () => adjustTime(-60));

  document.getElementById("addSec").addEventListener("click", () => adjustTime(10));

  document.getElementById("subSec").addEventListener("click", () => adjustTime(-10));

  document.getElementById("startPause").addEventListener("click", startPauseTimer);

  document.getElementById("reset").addEventListener("click", resetTimer);

});



// Keep Timer Running Even When Leaving the Page

updateTimerDisplay();
