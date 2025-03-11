// function updateClock() {
//   let now = new Date();
//   let hours = now.getHours();
//   let minutes = now.getMinutes();

//   // Format: 09:05 instead of 9:5
//   hours = hours < 10 ? "0" + hours : hours;
//   minutes = minutes < 10 ? "0" + minutes : minutes;

//   document.getElementById("clock").innerText = `${hours}:${minutes}`;
// }

// // Update clock every second
// setInterval(updateClock, 1000);

// // Call function initially to set time immediately
// updateClock();

// let batteryLevel = 50; // Start from 50%
// let charging = false;

// // Function to update battery UI
// function updateBatteryUI() {
//   document.getElementById("battery-level").style.width = batteryLevel + "%";
//   document.getElementById("charging-icon").style.display = charging
//     ? "block"
//     : "none";
// }

// // Listen for messages from Lua
// window.addEventListener("message", function (event) {
//   if (event.data.action === "updateBattery") {
//     batteryLevel = event.data.level;
//     charging = event.data.charging;
//     updateBatteryUI();
//   }
// });

// // Initialize UI
// updateBatteryUI();

// document.addEventListener("DOMContentLoaded", function () {
//   document.getElementById("swipe-upm").addEventListener("click", function () {
//     // Lock screen ko smoothly hide karo
//     const lockScreen = document.querySelector(".iphone-lock-screen");
//     lockScreen.style.transition = "transform 0.5s ease-in-out";
//     lockScreen.style.transform = "translateY(-100%)";

//     // Bottom nav ko show karo
//     const bottomNav = document.getElementById("b-nav");
//     bottomNav.style.display = "flex"; // block ki jagah flex use karo
//     const subDiv = document.getElementById("subDiv");
//     subDiv.classList.add("active")
//     // Lock screen ko completely hide karne ke liye delay ke sath display none karna
//     setTimeout(() => {
//       lockScreen.style.display = "none";
//       fetch(`https://${GetParentResourceName()}/closeUI`, { method: "POST" });
//     }, 500);
//   });
// });
const translations = {
  en: {
    heading: "Hello, Welcome!",
  },
  fr: {
    heading: "Bonjour, Bienvenue!",
  },
  de: {
    heading: "Hallo, Willkommen!",
  },
  es: {
    heading: "¡Hola, Bienvenido!",
  },
  zh: {
    heading: "你好，欢迎！",
  },
};

document.addEventListener("DOMContentLoaded", function () {
  // Initial setup - show startup screen
  const startupScreen = document.getElementById("startup-screen");
  const languageSelection = document.getElementById("language-selection");
  const lockScreen = document.querySelector(".iphone-lock-screen");
  const greeting = document.getElementById("greeting");
  const greetingText = document.getElementById("greetText");
  const apps = document.querySelector(".apps");
  const bottomNav = document.getElementById("b-nav");
  const subDiv = document.getElementById("subDiv");
  const clock = document.getElementById("clock");

  // Hide all screens except startup initially
  languageSelection.style.display = "none";
  lockScreen.style.display = "none";
  greeting.style.display = "none";
  apps.style.display = "none";
  bottomNav.style.display = "none";

  // Simulate iPhone startup sequence
  clock.style.color = "white";
  setTimeout(() => {
    startupScreen.style.opacity = "0";
    setTimeout(() => {
      startupScreen.style.display = "none";
      languageSelection.style.display = "flex";
      clock.style.color = "black";
    }, 1000);
  }, 2000); // Startup screen duration
  // Language selection functionality
  const languageButtons = document.querySelectorAll(".language-btn");
  let selectedLanguage = null;

  languageButtons.forEach((button) => {
    button.addEventListener("click", function () {
      languageButtons.forEach((btn) => btn.classList.remove("selected"));
      this.classList.add("selected");
      selectedLanguage = this.getAttribute("data-lang");
    });
  });

 
  // Continue button functionality
  document
    .querySelector(".continue-btn")
    .addEventListener("click", function () {
      if (selectedLanguage) {
        languageSelection.style.display = "none";
        greeting.style.display = "flex";
        // Initial state for animation
        greetingText.style.opacity = "0";
        greetingText.style.transform = "translateY(20px)";
        greetingText.style.transition = "opacity 1s ease, transform 1s ease";
        greetingText.innerText = translations[selectedLanguage].heading;
        // Start animation after a short delay
        setTimeout(() => {
          greetingText.style.opacity = "1";
          greetingText.style.transform = "translateY(0)";
        }, 100);
        // Hide greeting after 3 seconds & show lock screen
        setTimeout(() => {
          greeting.style.display = "none";
          lockScreen.style.display = "flex";
          greetingText.style.opacity = "1";
          greetingText.style.bottom = "0";
        }, 3000);
        if(apps.style.display == "flex"){
          clock.style.color = "white";
        }
        if (window.getComputedStyle(apps).display === "flex") {
          clock.style.color = "white";
        }
        
        console.log("Selected language:", selectedLanguage);
      } else {
        alert("Please select a language to continue");
      }
    });

  // Unlock screen functionality
  document.getElementById("swipe-upm").addEventListener("click", function () {
    lockScreen.style.transition = "transform 0.5s ease-in-out";
    lockScreen.style.transform = "translateY(-100%)";

    // Show apps
    setTimeout(() => {
      lockScreen.style.display = "none";
      apps.style.display = "flex";
      bottomNav.style.display = "flex";
      subDiv.classList.add("active");
    }, 500);
  });

  // Original clock and battery functions
  function updateClock() {
    let now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();

    // Format: 09:05 instead of 9:5
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;

    document.getElementById("clock").innerText = `${hours}:${minutes}`;

    // Also update the time on the lock screen
    document.querySelector(".time").innerText = `${hours}:${minutes}`;

    // Update date on lock screen
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const dateString = `${days[now.getDay()]}, ${
      months[now.getMonth()]
    } ${now.getDate()}`;
    document.querySelector(".date").innerText = dateString;
  }

  // Update clock every second
  setInterval(updateClock, 1000);

  // Call function initially to set time immediately
  updateClock();

  let batteryLevel = 50; // Start from 50%
  let charging = false;

  // Function to update battery UI
  function updateBatteryUI() {
    document.getElementById("battery-level").style.width = batteryLevel + "%";
    document.getElementById("charging-icon").style.display = charging
      ? "block"
      : "none";
  }

  // Listen for messages from Lua (if using FiveM)
  window.addEventListener("message", function (event) {
    if (event.data.action === "updateBattery") {
      batteryLevel = event.data.level;
      charging = event.data.charging;
      updateBatteryUI();
    }
  });

  // Initialize UI
  updateBatteryUI();
});

// App Management Variables
let timer;
let isEditMode = false;
let draggedItem = null;
let currentScreen = 0;
let isDragging = false;
let startX = 0;
let currentX = 0;

document.addEventListener("DOMContentLoaded", function () {
  // ... existing code ...

  // Initialize app management
  initializeAppManagement();
});

function initializeAppManagement() {
  const appsWrapper = document.querySelector(".apps-wrapper");
  const appScreens = document.querySelectorAll(".app-screen");
  const screenIndicators = document.querySelectorAll(".screen-indicator");

  // Mark first screen as active
  appScreens[0].classList.add("active");

  // Enable Hold-to-Edit Mode
  document.querySelectorAll(".app-ic").forEach((app) => {
    app.addEventListener("mousedown", handleAppHold);
    app.addEventListener("touchstart", handleAppHold, { passive: false });

    // Make app draggable
    app.addEventListener("mousedown", handleDragStart);
    app.addEventListener("touchstart", handleDragStart, { passive: false });
  });

  // Add global mouse/touch move and end listeners
  document.addEventListener("mousemove", handleDragMove);
  document.addEventListener("touchmove", handleDragMove, { passive: false });
  document.addEventListener("mouseup", handleDragEnd);
  document.addEventListener("touchend", handleDragEnd);

  // Screen navigation
  appsWrapper.addEventListener("touchstart", handleScreenTouchStart);
  appsWrapper.addEventListener("touchmove", handleScreenTouchMove);
  appsWrapper.addEventListener("touchend", handleScreenTouchEnd);

  // Mouse events for desktop screen sliding
  appsWrapper.addEventListener("mousedown", (e) => {
    if (!isEditMode && e.target.closest(".apps-wrapper")) {
      handleScreenMouseDown(e);
    }
  });

  document.addEventListener("mousemove", handleScreenMouseMove);
  document.addEventListener("mouseup", handleScreenMouseUp);

  // Click indicators to switch screens
  screenIndicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => {
      if (!isEditMode) {
        currentScreen = index;
        updateScreenPosition(true);
      }
    });
  });

  // Delete functionality
  document.querySelectorAll(".delete-icon").forEach((icon) => {
    icon.addEventListener("click", handleAppDelete);
  });

  // Exit edit mode when clicking outside
  document.addEventListener("click", handleClickOutside);

  // Update screen indicators
  updateScreenIndicators();
}

let draggingApp = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

function handleAppHold(e) {
  if (e.type === "touchstart") {
    e.preventDefault();
  }

  timer = setTimeout(() => {
    if (!isEditMode) {
      document.querySelector(".apps-wrapper").classList.add("edit-mode");
      isEditMode = true;
    }
  }, 1000);

  const cleanup = () => {
    clearTimeout(timer);
    this.removeEventListener("mouseup", cleanup);
    this.removeEventListener("mouseleave", cleanup);
    this.removeEventListener("touchend", cleanup);
  };

  this.addEventListener("mouseup", cleanup);
  this.addEventListener("mouseleave", cleanup);
  this.addEventListener("touchend", cleanup);
}

function handleDragStart(e) {
  if (!isEditMode) return;

  e.preventDefault();
  const touch = e.type === "touchstart" ? e.touches[0] : e;
  draggingApp = this;

  // Calculate offset from app's top-left corner
  const rect = draggingApp.getBoundingClientRect();
  dragOffsetX = touch.clientX - rect.left;
  dragOffsetY = touch.clientY - rect.top;

  // Set initial position
  draggingApp.style.position = "absolute";
  draggingApp.style.zIndex = "1000";
  draggingApp.classList.add("dragging");

  // Move to current position
  updateDragPosition(touch.clientX, touch.clientY);
}

function handleDragMove(e) {
  if (!draggingApp) return;

  e.preventDefault();
  const touch = e.type === "touchmove" ? e.touches[0] : e;
  updateDragPosition(touch.clientX, touch.clientY);

  // Check if we should switch screens
  const appScreens = document.querySelectorAll(".app-screen");
  const appsWrapper = document.querySelector(".apps-wrapper");
  const wrapperRect = appsWrapper.getBoundingClientRect();

  if (touch.clientX < wrapperRect.left + 50 && currentScreen > 0) {
    // Switch to previous screen
    currentScreen--;
    updateScreenPosition(true);
  } else if (
    touch.clientX > wrapperRect.right - 50 &&
    currentScreen < appScreens.length - 1
  ) {
    // Switch to next screen
    currentScreen++;
    updateScreenPosition(true);
  }
}

function updateDragPosition(x, y) {
  const apps = document.querySelector(".apps");
  const rect = apps.getBoundingClientRect();

  // Calculate position within apps container
  let left = x - rect.left - dragOffsetX;
  let top = y - rect.top - dragOffsetY;

  // Constrain to apps container
  left = Math.max(0, Math.min(left, rect.width - draggingApp.offsetWidth));
  top = Math.max(0, Math.min(top, rect.height - draggingApp.offsetHeight));

  draggingApp.style.left = left + "px";
  draggingApp.style.top = top + "px";
}

function handleDragEnd(e) {
  if (!draggingApp) return;

  draggingApp.classList.remove("dragging");
  draggingApp = null;

  // Optional: Snap to grid or nearest position
  // You can add snapping logic here if desired
}

function handleScreenTouchStart(e) {
  if (isEditMode) return;
  startX = e.touches[0].clientX;
  currentX = -currentScreen * document.querySelector(".app-screen").offsetWidth;
}

function handleScreenTouchMove(e) {
  if (isEditMode) return;
  e.preventDefault();

  const touch = e.touches[0];
  const diff = touch.clientX - startX;
  const newPosition = currentX + diff;
  const maxScreen = document.querySelectorAll(".app-screen").length - 1;
  const appsWrapper = document.querySelector(".apps-wrapper");

  // Add sliding class to disable transitions during drag
  appsWrapper.classList.add("sliding");

  // Calculate resistance at edges
  let finalPosition;
  if (currentScreen === 0 && diff > 0) {
    finalPosition = diff * 0.3;
  } else if (currentScreen === maxScreen && diff < 0) {
    finalPosition = -maxScreen * 100 + diff * 0.3;
  } else {
    finalPosition = newPosition;
  }

  appsWrapper.style.transform = `translateX(${finalPosition}px)`;
}

function handleScreenTouchEnd(e) {
  if (isEditMode) return;

  const appsWrapper = document.querySelector(".apps-wrapper");
  appsWrapper.classList.remove("sliding");

  const diff = e.changedTouches[0].clientX - startX;
  const threshold = window.innerWidth * 0.2;

  if (Math.abs(diff) > threshold) {
    currentScreen =
      diff > 0
        ? Math.max(0, currentScreen - 1)
        : Math.min(
            document.querySelectorAll(".app-screen").length - 1,
            currentScreen + 1
          );
  }

  updateScreenPosition(true);
}

function updateScreenIndicators() {
  const indicators = document.querySelectorAll(".screen-indicator");
  indicators.forEach((indicator, index) => {
    indicator.classList.toggle("active", index === currentScreen);
  });
}

function updateScreenPosition(animate = false) {
  const appsWrapper = document.querySelector(".apps-wrapper");
  const appScreens = document.querySelectorAll(".app-screen");

  if (animate) {
    appsWrapper.style.transition =
      "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
    setTimeout(() => (appsWrapper.style.transition = ""), 300);
  }

  // Update transform
  appsWrapper.style.transform = `translateX(-${currentScreen * 100}%)`;

  // Update active screen
  appScreens.forEach((screen, index) => {
    screen.classList.toggle("active", index === currentScreen);
  });

  // Update indicators
  updateScreenIndicators();
}

function handleAppDelete(e) {
  e.stopPropagation();
  const app = this.closest(".app-ic");
  app.classList.add("delete-animation");
  setTimeout(() => app.remove(), 300);
}

function handleClickOutside(e) {
  const appsWrapper = document.querySelector(".apps-wrapper");
  if (isEditMode && !appsWrapper.contains(e.target)) {
    appsWrapper.classList.remove("edit-mode");
    isEditMode = false;
  }
}

// Mouse event handlers for desktop support
function handleScreenMouseDown(e) {
  if (isEditMode) return;
  isDragging = true;
  startX = e.clientX;
  currentX = -currentScreen * document.querySelector(".app-screen").offsetWidth;
}

function handleScreenMouseMove(e) {
  if (!isDragging || isEditMode) return;

  const diff = e.clientX - startX;
  const newPosition = currentX + diff;
  const appsWrapper = document.querySelector(".apps-wrapper");
  const maxScreen = document.querySelectorAll(".app-screen").length - 1;

  // Add resistance at edges
  if (currentScreen === 0 && diff > 0) {
    appsWrapper.style.transform = `translateX(${newPosition * 0.3}px)`;
  } else if (currentScreen === maxScreen && diff < 0) {
    appsWrapper.style.transform = `translateX(${currentX + diff * 0.3}px)`;
  } else {
    appsWrapper.style.transform = `translateX(${newPosition}px)`;
  }
}

function handleScreenMouseUp(e) {
  if (!isDragging || isEditMode) return;

  isDragging = false;
  const diff = e.clientX - startX;
  const threshold = window.innerWidth * 0.2; // Reduced threshold for easier sliding

  if (Math.abs(diff) > threshold) {
    currentScreen =
      diff > 0
        ? Math.max(0, currentScreen - 1)
        : Math.min(
            document.querySelectorAll(".app-screen").length - 1,
            currentScreen + 1
          );
  }

  updateScreenPosition(true);
  updateScreenIndicators();
}

// App Opening/Closing functionality
function initializeAppOpening() {
  const appContainer = document.querySelector(".app-container");
  const appContent = appContainer.querySelector(".app-content");
  const appTitle = appContainer.querySelector(".app-title");
  const backButton = appContainer.querySelector(".app-back-button");

  // Handle app clicks
  document.querySelectorAll(".app-ic").forEach((app) => {
    app.addEventListener("click", function (e) {
      if (isEditMode || e.target.closest(".delete-icon")) return;

      const appName = this.getAttribute("data-app");
      const appTitle = this.querySelector("p").textContent;
      openApp(appName, appTitle);
    });
  });

  // Handle back button
  backButton.addEventListener("click", closeApp);

  function openApp(appName, title) {
    // Update app title
    appTitle.textContent = title;

    // Load app content based on app name
    appContent.innerHTML = getAppContent(appName);

    // Show app container with animation
    appContainer.classList.remove("closing");
    appContainer.style.display = "flex";
    setTimeout(() => appContainer.classList.add("opening"), 10);
  }

  function closeApp() {
    appContainer.classList.remove("opening");
    appContainer.classList.add("closing");

    setTimeout(() => {
      appContainer.style.display = "none";
      appContainer.classList.remove("closing");
      appContent.innerHTML = "";
    }, 300);
  }

  function getAppContent(appName) {
    // Return different content based on app
    switch (appName) {
      case "phone":
        return `
          <div style="padding: 20px;">
            <h2>Recent Calls</h2>
            <div style="margin-top: 20px;">
              <div style="padding: 10px; border-bottom: 1px solid #ddd;">
                <div style="font-weight: bold;">John Doe</div>
                <div style="color: #666; font-size: 14px;">Mobile • 5 mins ago</div>
              </div>
              <div style="padding: 10px; border-bottom: 1px solid #ddd;">
                <div style="font-weight: bold;">Jane Smith</div>
                <div style="color: #666; font-size: 14px;">Mobile • Yesterday</div>
              </div>
            </div>
          </div>
        `;

      case "safari":
        return `
          <div style="height: 100%; display: flex; flex-direction: column;">
            <div style="padding: 10px; background: #f8f8f8; border-bottom: 1px solid #ddd;">
              <input type="text" placeholder="Search or enter website" 
                style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ddd;">
            </div>
            <div style="flex: 1; display: flex; justify-content: center; align-items: center; color: #666;">
              Enter a URL to start browsing
            </div>
          </div>
        `;

      case "messages":
        return `
          <div style="padding: 20px;">
            <h2>Messages</h2>
            <div style="margin-top: 20px;">
              <div style="padding: 10px; border-bottom: 1px solid #ddd;">
                <div style="font-weight: bold;">Family Group</div>
                <div style="color: #666; font-size: 14px;">You: See you tonight! • 2h ago</div>
              </div>
              <div style="padding: 10px; border-bottom: 1px solid #ddd;">
                <div style="font-weight: bold;">Alice</div>
                <div style="color: #666; font-size: 14px;">Great! Thanks • Yesterday</div>
              </div>
            </div>
          </div>
        `;

      case "music":
        return `
          <div style="height: 100%; display: flex; flex-direction: column;">
            <div style="flex: 1; display: flex; justify-content: center; align-items: center; flex-direction: column;">
              <div style="font-size: 20px; font-weight: bold; margin-bottom: 10px;">No Music Playing</div>
              <div style="color: #666;">Select a song to start listening</div>
            </div>
          </div>
        `;

      case "maps":
        return `
          <div style="height: 100%; display: flex; flex-direction: column;">
            <div style="padding: 10px; background: #f8f8f8;">
              <input type="text" placeholder="Search for a place or address" 
                style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ddd;">
            </div>
            <div style="flex: 1; display: flex; justify-content: center; align-items: center; color: #666;">
              Map view will appear here
            </div>
          </div>
        `;

      default:
        return '<div style="padding: 20px;">App content not available</div>';
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // ... existing code ...

  // Initialize app opening functionality
  initializeAppOpening();
});
