$(document).ready(function () {
  $(".owl-carousel").owlCarousel({
    items: 1, // Show only one item at a time
    loop: false,
    margin: 10,
    startPosition: 0, // Start with second div (index starts at 0)
  });
});

function showGlobalAlert(message) {
  const alertContent = document.querySelector(".globalAlert");
  alertContent.innerText = message;
  alertContent.style.right = "0px";
  setTimeout(() => {
    alertContent.style.right = "-300px";
  }, 3000);
}

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

// JavaScript functionality
let currentPassword = "";
const PASSWORD_LENGTH = localStorage.getItem("savedpassword").length; // Standard iPhone password length

function addToPassword(digit) {
  if (currentPassword.length < PASSWORD_LENGTH) {
    currentPassword += digit;
    updatePasswordDots();

    // Auto-validate when password reaches full length
    if (currentPassword.length === PASSWORD_LENGTH) {
      setTimeout(() => validatePassword(), 200); // Short delay for better UX
    }
  }
}

function updatePasswordDots() {
  const dotsContainer = document.getElementById("password-dots");
  dotsContainer.innerHTML = "";

  // Create filled and empty dots
  for (let i = 0; i < PASSWORD_LENGTH; i++) {
    const dot = document.createElement("div");
    dot.className = i < currentPassword.length ? "dot filled" : "dot";
    dotsContainer.appendChild(dot);
  }
}

function deleteLastChar() {
  if (currentPassword.length > 0) {
    currentPassword = currentPassword.slice(0, -1);
    updatePasswordDots();

    // Remove error state if present
    document.getElementById("password-dots").classList.remove("password-error");
  }
}

function validatePassword() {
  // Get saved password (for demo, hardcode a test password)
  const savedPassword = localStorage.getItem("savedpassword") || "123456";

  // Check if password matches
  if (savedPassword === currentPassword) {
    // Password matches, transition screens with translateX
    const lockScreenPass = document.querySelector(".iphone-lock-pass-screen");
    lockScreenPass.style.transition = "transform 0.5s ease-in-out";
    lockScreenPass.style.transform = "translateX(-100%)"; // Slide out to the left

    setTimeout(() => {
      lockScreenPass.style.display = "none";
      // Show home screen or apps
      const apps = document.querySelector(".apps");
      if (apps) {
        apps.style.display = "flex";
        const bottomNav = document.getElementById("b-nav");
        if (bottomNav) bottomNav.style.display = "flex";
        const subDiv = document.getElementById("subDiv");
        if (subDiv) subDiv.classList.add("active");
      }
    }, 500);
  } else {
    // Password incorrect, show error animation
    showPasswordError();
  }
}

function showPasswordError() {
  const passwordDots = document.getElementById("password-dots");

  // Add error class for visual feedback
  passwordDots.classList.add("password-error");

  // Shake animation
  passwordDots.style.animation = "shake 0.5s";

  // Clear password after a short delay
  setTimeout(() => {
    currentPassword = "";
    updatePasswordDots();
    passwordDots.classList.remove("password-error");
    passwordDots.style.animation = "";
  }, 800);
}

// Initialize password dots when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  updatePasswordDots();
});

// Add this to your CSS
function addPasswordErrorStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .password-error {
      color: #ff3b30 !important;
      background-color: rgba(255, 59, 48, 0.1);
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
  `;
  document.head.appendChild(style);
}

document.addEventListener("DOMContentLoaded", function () {
  // Add password error styles
  addPasswordErrorStyles();

  // Get all UI elements
  const startupScreen = document.getElementById("startup-screen");
  const languageSelection = document.getElementById("language-selection");
  const lockScreen = document.querySelector(".iphone-lock-screen");
  const lockScreenPass = document.querySelector(".iphone-lock-pass-screen");
  const greeting = document.getElementById("greeting");
  const greetingText = document.getElementById("greetText");
  const apps = document.querySelector(".apps");
  const bottomNav = document.getElementById("b-nav");
  const subDiv = document.getElementById("subDiv");
  const clock = document.getElementById("clock");

  // Hide all screens except startup initially
  languageSelection.style.display = "none";
  lockScreen.style.display = "none";
  lockScreenPass.style.display = "none";
  greeting.style.display = "none";
  apps.style.display = "none";
  bottomNav.style.display = "none";

  // Set initial clock color
  clock.style.color = "white";

  // Check if token exists
  var token = localStorage.getItem("key");

  if (!token) {
    // NO TOKEN: Show 3-screen onboarding flow

    // 1. STARTUP SCREEN
    // Show for 2 seconds, then fade out
    setTimeout(() => {
      startupScreen.style.opacity = "0";
      setTimeout(() => {
        startupScreen.style.display = "none";
        // Transition to language selection
        languageSelection.style.display = "flex";
        clock.style.color = "black";
      }, 1000);
    }, 2000);

    // 2. LANGUAGE SELECTION
    // Setup language selection functionality
    const languageButtons = document.querySelectorAll(".language-btn");
    let selectedLanguage = null;

    // Handle language button clicks
    languageButtons.forEach((button) => {
      button.addEventListener("click", function () {
        languageButtons.forEach((btn) => btn.classList.remove("selected"));
        this.classList.add("selected");
        selectedLanguage = this.getAttribute("data-lang");
      });
    });

    // Handle continue button click
    document
      .querySelector(".continue-btn")
      .addEventListener("click", function () {
        if (selectedLanguage) {
          // Hide language selection with translateX
          languageSelection.style.transition = "transform 0.5s ease-in-out";
          languageSelection.style.transform = "translateX(-100%)";

          setTimeout(() => {
            languageSelection.style.display = "none";

            // 3. GREETING SCREEN
            greeting.style.display = "flex";
            greeting.style.transform = "translateX(0)"; // Reset transform

            // Set token in localStorage
            localStorage.setItem("key", "stored");

            // Setup greeting animation
            greetingText.style.opacity = "0";
            greetingText.style.transform = "translateY(20px)";
            greetingText.style.transition =
              "opacity 1s ease, transform 1s ease";
            greetingText.innerText = translations[selectedLanguage].heading;

            // Animate greeting
            setTimeout(() => {
              greetingText.style.opacity = "1";
              greetingText.style.transform = "translateY(0)";
            }, 100);

            // Hide greeting after 3 seconds & show lock screen with translateX
            setTimeout(() => {
              greeting.style.transition = "transform 0.5s ease-in-out";
              greeting.style.transform = "translateX(-100%)";

              setTimeout(() => {
                greeting.style.display = "none";
                lockScreen.style.display = "flex";
                lockScreen.style.transform = "translateX(0)"; // Reset transform
              }, 500);
            }, 3000);
          }, 500);
        } else {
          console.log("Please select a language to continue");
        }
      });
  } else {
    // TOKEN EXISTS: Skip to lock screen directly
    startupScreen.style.display = "none";
    lockScreen.style.display = "flex";
    lockScreen.style.transform = "translateX(0)"; // Ensure it's positioned correctly

    // Set appropriate styles for lock screen
    if (apps.style.display == "flex") {
      clock.style.color = "white";
    }
  }

  // Common functionality regardless of token status

  // Lock screen unlock functionality
  document.getElementById("swipe-upm").addEventListener("click", function () {
    // Start the transition using translateX
    lockScreen.style.transition = "transform 0.5s ease-in-out";
    lockScreen.style.transform = "translateX(-100%)"; // Slide out to the left

    setTimeout(() => {
      lockScreen.style.display = "none";

      // Check if there's a saved password
      const savedPassword = localStorage.getItem("savedpassword");

      if (savedPassword) {
        // Show password screen if password is set
        lockScreenPass.style.display = "flex";
        lockScreenPass.style.transform = "translateX(0)"; // Initial position (visible)
        currentPassword = ""; // Reset current password when showing lock screen
        document.getElementById("password-input").value = "";
      } else {
        // No password set, go directly to apps with translateX
        apps.style.display = "flex";
        apps.style.transform = "translateX(0)"; // Ensure it's positioned correctly
        bottomNav.style.display = "flex";
        subDiv.classList.add("active");
      }
    }, 500); // Wait for 500ms (to match the duration of the transition)
  });

  // Clock functionality
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

  // Battery functionality
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

  // Add event listener for the clear button
  const clearButton = document.getElementById("clearNumberBtn");
  if (clearButton) {
    clearButton.addEventListener("click", clearNumber);
  }

  // Add event listener for the save number button
  const saveNumberButton = document.getElementById("saveNumberBtn");
  if (saveNumberButton) {
    saveNumberButton.addEventListener("click", saveNumber);
  }
});

// App Management Variables
let timer;
let isEditMode = false;
let draggingApp = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let originalPosition = null;
let currentDropTarget = null;

document.addEventListener("DOMContentLoaded", function () {
  // Initialize app management
  initializeAppManagement();
});

function initializeAppManagement() {
  const appScreens = document.querySelectorAll(".app-screen");
  const screenIndicators = document.querySelectorAll(".screen-indicator");

  // Mark first screen as active
  appScreens[0].classList.add("active");

  // Enable Hold-to-Edit Mode and drag functionality
  document.querySelectorAll(".app-ic").forEach((app) => {
    app.addEventListener("mousedown", handleAppHold);
    app.addEventListener("touchstart", handleAppHold, { passive: false });
    app.addEventListener("mousedown", handleDragStart);
    app.addEventListener("touchstart", handleDragStart, { passive: false });
  });

  // Add global mouse/touch move and end listeners
  document.addEventListener("mousemove", handleDragMove);
  document.addEventListener("touchmove", handleDragMove, { passive: false });
  document.addEventListener("mouseup", handleDragEnd);
  document.addEventListener("touchend", handleDragEnd);

  // Click indicators to switch screens

  // Delete functionality
  document.querySelectorAll(".delete-icon").forEach((icon) => {
    icon.addEventListener("click", handleAppDelete);
  });

  // Exit edit mode when clicking outside
  document.addEventListener("click", handleClickOutside);

  // Update screen indicators
}

function handleAppHold(e) {
  if (e.type === "touchstart") {
    e.preventDefault();
  }

  // Clear any existing timer
  clearTimeout(timer);

  // Set a new timer for 2 seconds
  timer = setTimeout(() => {
    if (!isEditMode) {
      // Add edit mode class to apps wrapper
      const appsWrapper = document.querySelector(".apps-wrapper");
      appsWrapper.classList.add("edit-mode");
      isEditMode = true;

      // Show delete icons
      document.querySelectorAll(".delete-icon").forEach((icon) => {
        icon.style.display = "flex";
      });

      // Add wiggle animation to all apps
      document.querySelectorAll(".app-ic").forEach((app) => {
        app.style.animation = "wiggle 0.5s infinite alternate ease-in-out";
      });
    }
  }, 2000); // 2 seconds hold time

  // Cleanup function to clear timer if hold is released early
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

  // Store original position
  originalPosition = {
    parent: draggingApp.parentNode,
    nextSibling: draggingApp.nextSibling,
  };

  // Calculate offset from app's top-left corner
  const rect = draggingApp.getBoundingClientRect();
  dragOffsetX = touch.clientX - rect.left;
  dragOffsetY = touch.clientY - rect.top;

  // Set initial position
  draggingApp.style.position = "fixed";
  draggingApp.style.zIndex = "1000";
  draggingApp.classList.add("dragging");

  // Create placeholder
  const placeholder = document.createElement("div");
  placeholder.classList.add("app-placeholder");
  draggingApp.parentNode.insertBefore(placeholder, draggingApp);

  // Move to current position
  updateDragPosition(touch.clientX, touch.clientY);
}

function handleDragMove(e) {
  if (!draggingApp) return;
  e.preventDefault();

  const touch = e.type === "touchmove" ? e.touches[0] : e;
  updateDragPosition(touch.clientX, touch.clientY);

  // Find the closest drop target
  const dropTarget = findDropTarget(touch.clientX, touch.clientY);

  if (dropTarget !== currentDropTarget) {
    if (currentDropTarget) {
      currentDropTarget.classList.remove("drop-target");
    }
    if (dropTarget) {
      dropTarget.classList.add("drop-target");
    }
    currentDropTarget = dropTarget;
  }
}

function findDropTarget(x, y) {
  const apps = document.querySelectorAll(".app-screen .app-ic:not(.dragging)");
  return Array.from(apps).find((app) => {
    const rect = app.getBoundingClientRect();
    return (
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    );
  });
}

function updateDragPosition(x, y) {
  if (!draggingApp) return;

  const frame = document.querySelector(".frame");
  const frameRect = frame.getBoundingClientRect();

  // Calculate position within frame boundaries
  let left = Math.max(
    frameRect.left,
    Math.min(x - dragOffsetX, frameRect.right - draggingApp.offsetWidth)
  );
  let top = Math.max(
    frameRect.top,
    Math.min(y - dragOffsetY, frameRect.bottom - draggingApp.offsetHeight)
  );

  draggingApp.style.left = left + "px";
  draggingApp.style.top = top + "px";
}

function handleDragEnd(e) {
  if (!draggingApp) return;

  // Remove placeholder and drop target highlighting
  const placeholder = document.querySelector(".app-placeholder");
  if (placeholder) {
    placeholder.remove();
  }

  if (currentDropTarget) {
    currentDropTarget.classList.remove("drop-target");
    currentDropTarget.parentNode.insertBefore(draggingApp, currentDropTarget);
  } else {
    // Return to original position if no valid drop target
    originalPosition.parent.insertBefore(
      draggingApp,
      originalPosition.nextSibling
    );
  }

  // Reset dragging app styles
  draggingApp.style.position = "";
  draggingApp.style.left = "";
  draggingApp.style.top = "";
  draggingApp.style.zIndex = "";
  draggingApp.classList.remove("dragging");

  // Reset variables
  draggingApp = null;
  currentDropTarget = null;
  originalPosition = null;
}

function handleAppDelete(e) {
  e.stopPropagation();
  const app = this.closest(".app-ic");
  app.classList.add("delete-animation");
  setTimeout(() => app.remove(), 300);
}

function handleClickOutside(e) {
  if (
    isEditMode &&
    !e.target.closest(".app-ic") &&
    !e.target.closest(".delete-icon")
  ) {
    // Exit edit mode
    const appsWrapper = document.querySelector(".apps-wrapper");
    appsWrapper.classList.remove("edit-mode");
    isEditMode = false;

    // Hide delete icons
    document.querySelectorAll(".delete-icon").forEach((icon) => {
      icon.style.display = "none";
    });

    // Remove wiggle animation
    document.querySelectorAll(".app-ic").forEach((app) => {
      app.style.animation = "none";
    });
  }
}
// App Opening/Closing functionality
function initializeAppOpening() {
  const appContainer = document.querySelector(".app-container");
  const appContent = appContainer.querySelector(".app-content");
  const appTitle = appContainer.querySelector(".app-title");
  const backButton = appContainer.querySelector(".app-back-button");
  const instabackButton = appContainer.querySelector(".insta-back-button");
  const header = document.getElementById("hder");
  const headerCon = document.getElementById("hder-contain");
  // Get all app content divs
  const phoneApp = document.querySelector(".phones");
  const safariApp = document.querySelector(".safari");
  const messagesApp = document.querySelector(".messages");
  const musicApp = document.querySelector(".musics");
  const mapsApp = document.querySelector(".maps");
  const instagramApp = document.querySelector(".instagram");
  const whatsApp = document.querySelector(".whatsapp");
  const snapchatApp = document.querySelector(".snapchat");
  const settings = document.querySelector(".settings");
  const youtube = document.querySelector(".youtube");
  const appStore = document.querySelector(".app-store");
  const tiktok = document.querySelector(".tiktok");
  const facebook = document.querySelector(".facebook");
  const spotify = document.querySelector(".spotify");
  const twitter = document.querySelector(".twitter");

  // Array of all app content divs
  const allAppDivs = [
    phoneApp,
    safariApp,
    messagesApp,
    musicApp,
    mapsApp,
    instagramApp,
    whatsApp,
    snapchatApp,
    settings,
    youtube,
    appStore,
    tiktok,
  ];

  document.querySelectorAll(".app-ic").forEach((app) => {
    app.addEventListener("click", function (e) {
      if (isEditMode || e.target.closest(".delete-icon")) return;

      const clickedAppName = this.getAttribute("data-app");
      const clickedAppTitleText =
        this.querySelector("p")?.textContent || "Unknown App";
      openApp(clickedAppName, clickedAppTitleText);
    });
  });

  // Handle back button
  backButton?.addEventListener("click", closeApp);

  instabackButton?.addEventListener("click", closeApp);

  window.openApp = function (appName, title) {
    // Update app title
    appTitle.textContent = title;

    // First, hide all app content divs
    allAppDivs.forEach((div) => {
      if (div) div.style.display = "none";
    });

    // Then show only the selected app content
    switch (appName) {
      case "phone":
        if (phoneApp) phoneApp.style.display = "block";
        break;
      case "safari":
        if (safariApp) safariApp.style.display = "block";
        break;
      case "messages":
        if (messagesApp) messagesApp.style.display = "block";
        break;
      case "music":
        if (musicApp) musicApp.style.display = "block";
        break;
      case "maps":
        if (mapsApp) mapsApp.style.display = "block";
        break;
      case "instagram":
        if (instagramApp) instagramApp.style.display = "block";
        break;
      case "snapchat":
        if (snapchatApp) snapchatApp.style.display = "block";
        break;
      case "settings":
        if (settings) settings.style.display = "block";
        break;
      case "youtube":
        if (youtube) youtube.style.display = "block";
        break;
      case "app-store":
        if (appStore) appStore.style.display = "block";
        break;
      case "tiktok":
        if (tiktok) tiktok.style.display = "block";
        break;
      case "facebook":
        if (facebook) facebook.style.display = "block";
        break;
      case "spotify":
        if (spotify) spotify.style.display = "block";
        break;
      case "twitter":
        if (twitter) twitter.style.display = "block";
        break;
      default:
        // If no matching app, show default content
        appContent.innerHTML =
          '<div style="padding: 20px;">App content not available</div>';
        break;
    }
    if (appName === "maps") {
      fetch(`https://${GetParentResourceName()}/maps`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify("maps"),
      });
    }
    if (appName === "music") {
      fetch(`https://${GetParentResourceName()}/music`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify("music"),
      });
    }
    if (appName != "facebook"){
      facebook.style.display = "none"
    }

    if (appName === "facebook") {
      if (headerCon) {
        headerCon.style.display = "none";
      }
      let userId = localStorage.getItem("facebookUserId");
      fetch(`https://${GetParentResourceName()}/facebookGetUserDetails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userId }),
      });
      fetch(`https://${GetParentResourceName()}/fetchingFbPosts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({ userId }),
      });
    } else if (appName === "settings") {
      fetch(`https://${GetParentResourceName()}/Client:MyDetails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(),
      });
      if (headerCon) {
        headerCon.style.display = "none";
      }
    } else if (appName === "tiktok") {
      let tiktokuserToken = localStorage.getItem("tiktokId")
      fetch(`https://${GetParentResourceName()}/GetTiktokUserDetails`,{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({tiktokuserToken}),
      })
      if (headerCon) {
        headerCon.style.display = "none";
      }
    } else {
      // For all other apps except Facebook and settings
      if (headerCon) {
        headerCon.style.display = "flex";
      }
    }

    if (appName === "safari") {
      fetch(`https://${GetParentResourceName()}/safari`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify("safari"),
      });
    }
    if (appName === "settings") {
      fetch(`https://${GetParentResourceName()}/Client:MyDetails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(),
      });
      header.style.display = "none";
    } else {
      header.style.display = "flex";
    }
    // Show app container with animation
    appContainer.classList.remove("closing");
    appContainer.style.display = "flex";
    setTimeout(() => appContainer.classList.add("opening"), 10);
  };

  function closeApp() {
    appContainer.classList.remove("opening");
    appContainer.classList.add("closing");

    setTimeout(() => {
      appContainer.style.display = "none";
      appContainer.classList.remove("closing");

      // Hide all app content divs when closing
      allAppDivs.forEach((div) => {
        if (div) div.style.display = "none";
      });
    }, 300);
  }

  document.getElementById("bottomSlide").addEventListener("click", function () {
    closeApp();
  });
}

// Initialize when the document is ready
document.addEventListener("DOMContentLoaded", function () {
  initializeAppOpening();
});

document.addEventListener("DOMContentLoaded", function () {
  // ... existing code ...

  // Initialize app opening functionality
  initializeAppOpening();
});
document.addEventListener("DOMContentLoaded", function () {
  const menu = document.getElementById("menuSection");
  const right = document.getElementById("mobile-signal");
  const bottomSlide = document.getElementById("bottomSlide"); // Fixed typo

  right?.addEventListener("click", function () {
    menu.style.top = "0";
  });

  bottomSlide?.addEventListener("click", function () {
    // Fixed ID
    menu.style.top = "-610px";
  });
});

function toggleActive(element) {
  element.classList.toggle("active");
}

function setupSlider(sliderId, fillId, cssProperty, minValue, maxValue) {
  const slider = document.getElementById(sliderId);
  const fill = document.getElementById(fillId);
  const container = document.getElementById("subDiv");

  // Load saved value from localStorage
  const savedPercent = localStorage.getItem(`${cssProperty}Percent`);
  if (savedPercent !== null) {
    const percent = parseFloat(savedPercent);
    const value = minValue + percent * (maxValue - minValue);
    fill.style.height = `${percent * 100}%`;

    if (cssProperty === "brightness") {
      container.style.filter = `brightness(${value}%)`;
    } else if (cssProperty === "volume") {
    }
  }

  slider.addEventListener("click", function (e) {
    let rect = slider.getBoundingClientRect();
    let percent = 1 - (e.clientY - rect.top) / rect.height;
    percent = Math.max(0, Math.min(1, percent)); // Clamp between 0 and 1
    let value = minValue + percent * (maxValue - minValue);
    fill.style.height = `${percent * 100}%`;

    if (cssProperty === "brightness") {
      container.style.filter = `brightness(${value}%)`;
    } else if (cssProperty === "volume") {
    }

    // Save to localStorage
    localStorage.setItem(`${cssProperty}Percent`, percent.toString());
  });
}

// Usage
setupSlider("brightnessSlider", "brightnessFill", "brightness", 30, 100);
setupSlider("volumeSlider", "volumeFill", "volume", 0, 100);

function switchTab(tabId, element) {
  // Remove active section from all phone sections
  document.querySelectorAll(".phone-section").forEach((tab) => {
    tab.classList.remove("active-section");
  });

  // Add active section to the selected tab
  document.getElementById(tabId).classList.add("active-section");

  // Remove active menu from all menu items
  document.querySelectorAll(".menu-item").forEach((nav) => {
    nav.classList.remove("active-menu");
  });

  // Add active menu to the clicked element
  element.classList.add("active-menu");
}
let contactsList = []; // Store contacts globally

window.addEventListener("message", function (event) {
  const data = event.data;

  switch (data.action) {
    case "showContact":
      contactsList = data.user_data || []; // Store contacts
      updateFavoritesList(contactsList); // Update favorites list
      break;

    case "phoneNumberResult":
      // Handle phone number check results
      const exists = data.exists;
      const contactData = data.contactData;
      const contactDropdown = document.getElementById("contactDropdown");
      const saveNumberBtn = document.getElementById("saveNumberBtn");

      if (exists && contactData) {
        // Show contact info in dropdown
        contactDropdown.innerHTML = contactData
          .map(
            (contact) =>
              `<div class="contact-item" style="color:#000" data-phone="${contact.phone}">${contact.username} - ${contact.phone}</div>`
          )
          .join("");
        contactDropdown.classList.remove("hidden");
        saveNumberBtn.classList.add("hidden");

        // Add click event listeners to contact items
        const contactItems = contactDropdown.querySelectorAll(".contact-item");
        contactItems.forEach((item) => {
          item.addEventListener("click", function () {
            const phoneNumber = this.getAttribute("data-phone");
            dialDisplay.innerText = phoneNumber;
            contactDropdown.classList.add("hidden");
          });
        });
      } else {
        // Show save button
        contactDropdown.classList.add("hidden");
        saveNumberBtn.classList.remove("hidden");
      }
      break;

    case "phoneNotification":
      // Display notification
      showNotification(data.message);
      break;
  }
});
function closeUploadSection() {
  const uploadSection = document.getElementById("upload-post-section");
  uploadSection.style.display = "none";
}
function updateFavoritesList(contacts) {
  const favSection = document.querySelector("#favSection .phone-tab ul");
  if (favSection && contacts.length > 0) {
    favSection.innerHTML = contacts
      .map(
        (contact) =>
          `<li class="contact-item" onclick=dialNumber(${contact.phone})>⭐ ${contact.username} - ${contact.phone}</li>`
      )
      .join("");
  } else if (favSection) {
    favSection.innerHTML = '<li class="contact-item">No contacts found</li>';
  }
}

function press(digit) {
  // Get references to the elements we need
  const dialDisplay = document.getElementById("dialDisplay");
  const contactDropdown = document.getElementById("contactDropdown");
  const saveNumberBtn = document.getElementById("saveNumberBtn");

  // Update display with the digit
  if (dialDisplay.innerText === "Enter Number") {
    dialDisplay.innerText = digit;
  } else {
    dialDisplay.innerText += digit;
  }

  const enteredNumber = dialDisplay.innerText;

  // First check locally in cached contacts
  const matchedContacts = contactsList.filter((contact) =>
    contact.phone.includes(enteredNumber)
  );

  if (matchedContacts.length > 0) {
    // If found locally, display them
    contactDropdown.innerHTML = matchedContacts
      .map(
        (contact) =>
          `<div class="contact-item" style="color:#000" data-phone="${contact.phone}">${contact.username} - ${contact.phone}</div>`
      )
      .join("");
    contactDropdown.classList.remove("hidden");
    saveNumberBtn.classList.add("hidden");

    // Add click event listeners to contact items
    const contactItems = contactDropdown.querySelectorAll(".contact-item");
    contactItems.forEach((item) => {
      item.addEventListener("click", function () {
        const phoneNumber = this.getAttribute("data-phone");
        dialDisplay.innerText = phoneNumber;
        contactDropdown.classList.add("hidden");
      });
    });
  } else {
    // If not found locally, check on the server
    // But only do this if the number is at least 3 digits for performance
    if (enteredNumber.length >= 3) {
      fetch(`https://Mobile/checkPhoneNumber`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: enteredNumber,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.found) {
            // Show contact info in dropdown
            contactDropdown.innerHTML = data.contacts
              .map(
                (contact) =>
                  `<div class="contact-item" style="color:#000" data-phone="${contact.phone}">${contact.username} - ${contact.phone}</div>`
              )
              .join("");
            contactDropdown.classList.remove("hidden");
            saveNumberBtn.classList.add("hidden");

            // Add click event listeners to contact items
            const contactItems =
              contactDropdown.querySelectorAll(".contact-item");
            contactItems.forEach((item) => {
              item.addEventListener("click", function () {
                const phoneNumber = this.getAttribute("data-phone");
                dialDisplay.innerText = phoneNumber;
                contactDropdown.classList.add("hidden");
              });
            });
          } else {
            // Show save button
            contactDropdown.classList.add("hidden");
            saveNumberBtn.classList.remove("hidden");
          }
        })
        .catch((error) => {
          console.error("Error checking phone number:", error);
          // Still show save button in case of error
          contactDropdown.classList.add("hidden");
          saveNumberBtn.classList.remove("hidden");
        });
    } else {
      // Not enough digits, just show save button
      contactDropdown.classList.add("hidden");
      saveNumberBtn.classList.remove("hidden");
    }
  }
}
document
  .getElementById("callButton")
  .addEventListener("click", function (event) {
    const dialDisplay = document.getElementById("dialDisplay");
    const numberToCall = dialDisplay.innerText.trim();
    document.getElementById("callingScreen").style.display = "flex";
    document.getElementById("callerName").innerHTML = `+${numberToCall}`;
    if (!numberToCall || numberToCall === "Enter Number") {
      console.log("No number entered.");
      return;
    }

    fetch(`https://${GetParentResourceName()}/startCall`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber: numberToCall,
      }),
    });
  });

window.addEventListener("message", function (event) {
  if (event.data.action === "playerOffline") {
    document.getElementById("callingName").innerHTML = "Player Offline";
    setTimeout(() => {
      document.getElementById("callingScreen").style.display = "none";
    }, 2000);
  }
});

//incoming call
let callInterval;
let seconds = 0;

// Format seconds into MM:SS
function formatTime(seconds) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

function startCallTimer() {
  seconds = 0;
  document.getElementById("callTimer").innerText = formatTime(seconds);
  callInterval = setInterval(() => {
    seconds++;
    document.getElementById("callTimer").innerText = formatTime(seconds);
  }, 1000);
}

function stopCallTimer() {
  clearInterval(callInterval);
  seconds = 0;
  document.getElementById("callTimer").innerText = "00:00";
}
let CallerNum = null; // Global variable

window.addEventListener("message", function (event) {
  if (event.data.type === "incomingCall") {
    CallerNum = event.data.number; // 👈 Set the number here!

    document.getElementById("callUI").style.display = "block";
    document.getElementById("caller-number").innerText =
      "📞 Incoming call from: " + CallerNum;
  }

  if (event.data.type === "hideCallUI") {
    document.getElementById("callUI").style.display = "none";
  }
});

function acceptCall() {
  console.log("📞 Accepting call to:", CallerNum); // Debug log

  fetch(`https://${GetParentResourceName()}/acceptCall`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ number: CallerNum }), // 👈 Send the caller number
  });

  document.getElementById("callUI").style.display = "none";
  document.getElementById("callingScreen").style.display = "flex";
  startCallTimer();
}

function rejectCall() {
  fetch(`https://${GetParentResourceName()}/rejectCall`, { method: "POST" });

  document.getElementById("callUI").style.display = "none";
  document.getElementById("callingScreen").style.display = "none";
  stopCallTimer(); // 👈 stop timer
}

// Optional: End call button logic
document.getElementById("endCallButton").addEventListener("click", () => {
  const currentTime = new Date().toISOString();
  fetch(`https://${GetParentResourceName()}/endCall`, {
    method: "POST",
    body: JSON.stringify({ number: CallerNum, time: currentTime }),
  });
  document.getElementById("callingScreen").style.display = "none";
  stopCallTimer();
});

//incoming call

// We'll completely remove and reinstall all event listeners when the page loads
document.addEventListener("DOMContentLoaded", function () {
  // First, let's disconnect and reconnect all dial buttons to ensure no duplicate events
  const dialGrid = document.querySelector(".dial-grid");
  if (dialGrid) {
    // Create a new dial grid with the same content
    const newDialGrid = dialGrid.cloneNode(true);

    // Replace the old grid with the new one
    dialGrid.parentNode.replaceChild(newDialGrid, dialGrid);

    // Add new event listeners to each non-call button
    const dialButtons = newDialGrid.querySelectorAll(
      ".dial-btn:not(.call-button)"
    );
    dialButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const digit = this.innerText;
        press(digit);
      });
    });

    // Add event listener to call button separately
    const callButton = newDialGrid.querySelector(".call-button");
    if (callButton) {
      callButton.addEventListener("click", call);
    }
  }

  // Also ensure the onclick attributes are removed from the HTML
  document.querySelectorAll(".dial-btn").forEach((button) => {
    button.removeAttribute("onclick");
  });

  // Add event listener for the clear button
  const clearButton = document.getElementById("clearNumberBtn");
  if (clearButton) {
    clearButton.addEventListener("click", clearNumber);
  }
});

function saveNumber() {
  const number = document.getElementById("dialDisplay").innerText;

  // Create a modal for entering the contact name
  const modal = document.createElement("div");
  modal.className = "contact-modal";
  modal.innerHTML = `
    <div class="contact-modal-content">
      <h3>Save New Contact</h3>
      <input type="text" id="newContactName" placeholder="Enter name" />
      <div class="contact-modal-buttons">
        <button id="cancelSaveContact">Cancel</button>
        <button id="confirmSaveContact">Save</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Focus the input field
  document.getElementById("newContactName").focus();

  // Add event listeners
  document
    .getElementById("cancelSaveContact")
    .addEventListener("click", function () {
      document.body.removeChild(modal);
    });

  document
    .getElementById("confirmSaveContact")
    .addEventListener("click", function () {
      const contactName = document
        .getElementById("newContactName")
        .value.trim();

      if (contactName) {
        // Send to server to save using fetch instead of $.post
        fetch(`https://Mobile/saveContact`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phoneNumber: number,
            contactName: contactName,
          }),
        });

        // Clean up and show feedback
        document.body.removeChild(modal);
        showNotification("Saving contact...");

        // Reset dial display
        document.getElementById("dialDisplay").innerText = "Enter Number";
        document.getElementById("contactDropdown").classList.add("hidden");
        document.getElementById("saveNumberBtn").classList.add("hidden");
      } else {
        // Show error if no name entered
        showNotification("Please enter a name for the contact");
      }
    });
}

// Function to show a notification
function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "phone-notification";
  notification.textContent = message;

  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.add("fade-out");
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 500);
  }, 3000);
}

const searchInput = document.getElementById("searchInput");
const clearIcon = document.getElementById("clearIcon");
const suggestedSearches = document.getElementById("suggestedSearches");

searchInput.addEventListener("input", function () {
  clearIcon.style.display = this.value.length > 0 ? "block" : "none";
});

clearIcon.addEventListener("click", function () {
  searchInput.value = "";
  clearIcon.style.display = "none";
});

suggestedSearches.addEventListener("click", function (event) {
  if (event.target.classList.contains("suggested-search-item")) {
    searchInput.value = event.target.textContent;
    clearIcon.style.display = "block";
  }
});
// Function to open chat screen

function closeChat() {
  const messageList = document.getElementById("messageList");
  const chatScreen = document.getElementById("chatScreen");
  const header = document.getElementById("hder");
  header.style.display = "block";
  if (messageList) messageList.style.display = "block";
  if (chatScreen) chatScreen.style.display = "none";
}
const toggleThemeBtn = document.getElementById("modeToggle");

toggleThemeBtn.addEventListener("click", () => {
  if (document.documentElement.getAttribute("data-theme") === "dark") {
    document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("theme", "light");
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
  }
});

// Page load pe check karega
if (localStorage.getItem("theme") === "dark") {
  document.documentElement.setAttribute("data-theme", "dark");
}

// Open Chat User Function
function openChatUser(username) {
  const usersList = document.getElementById("users-list");
  const chatSection = document.getElementById("chat-section");
  const chatUserName = document.getElementById("chat-user-name");

  usersList.style.display = "none";
  chatSection.style.display = "block";
  chatUserName.textContent = username;
}

// Go Back Function
function goBack() {
  const usersList = document.getElementById("users-list");
  const chatSection = document.getElementById("chat-section");
  const storySection = document.getElementById("story-section");
  const feedSection = document.getElementById("feed-section");
  const instaNotch = document.querySelector(".insta-notch");

  usersList.style.display = "none";
  chatSection.style.display = "none";
  storySection.style.display = "block";
  feedSection.style.display = "block";
  instaNotch.style.display = "flex";
}

// Initialize the page
// document.addEventListener("DOMContentLoaded", function () {
//   renderStories();
//   renderFeed();
// });
function openChat(userName) {
  document.getElementById("users-list").style.display = "none";
  document.getElementById("chat-section").style.display = "block";
  document.getElementById("chat-user-name").innerText = userName;
}

function goBack() {
  document.getElementById("users-list").style.display = "block";
  document.getElementById("chat-section").style.display = "none";
}

// Function to take a screenshot
// Variable to track if render target is initialized

///////////////////////////////
let currentFilter = "normal";
let lastScreenshotData = null;

// DOM elements
const screenshotContainer = document.getElementById("screenshotContainer");
const previewContainer = document.getElementById("previewContainer");
const previewImage = document.getElementById("previewImage");
const captureFlash = document.getElementById("captureFlash");
const notification = document.getElementById("notification");

// Get all filter options
const filterOptions = document.querySelectorAll(".snapchat-filter-option");

// Add event listeners to filter options
filterOptions.forEach((option) => {
  option.addEventListener("click", () => {
    // Remove active class from all options
    filterOptions.forEach((opt) => opt.classList.remove("active"));

    // Add active class to selected option
    option.classList.add("active");

    // Set current filter
    currentFilter = option.dataset.filter;

    // Send filter to Lua
    sendFilterToLua(currentFilter);
  });
});

// Capture button
document.getElementById("captureButton").addEventListener("click", () => {
  // Hide UI before taking screenshot
  screenshotContainer.classList.add("hidden");

  // Small delay to ensure UI is hidden
  setTimeout(() => {
    // Trigger flash effect
    captureFlash.classList.add("flash-animation");

    // Play camera sound (will be handled by Lua)
    sendToLua("playCameraSound");

    // Request screenshot from Lua
    sendToLua("takeScreenshot", { filter: currentFilter });

    // Remove flash animation after it completes
    setTimeout(() => {
      captureFlash.classList.remove("flash-animation");
    }, 500);
  }, 100);
});

// Close and cancel buttons

// Preview UI buttons
document.getElementById("discardButton").addEventListener("click", () => {
  previewContainer.classList.add("hidden");
  screenshotContainer.classList.remove("hidden");
});

document.getElementById("saveButton").addEventListener("click", () => {
  if (lastScreenshotData) {
    sendToLua("saveScreenshot", {
      imageData: lastScreenshotData,
      filter: currentFilter,
    });

    // Show saved notification
    showNotification("Screenshot saved successfully!");

    // Hide preview
    previewContainer.classList.add("hidden");
  }
});

document.getElementById("shareButton").addEventListener("click", () => {
  if (lastScreenshotData) {
    sendToLua("shareScreenshot", {
      imageData: lastScreenshotData,
    });

    showNotification("Sharing screenshot...");
  }
});

// Function to send data to Lua
function sendToLua(action, data = {}) {
  fetch(`https://${GetParentResourceName()}/${action}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((resp) => resp.json())
    .then((resp) => {})
    .catch((error) => console.error("Error sending to Lua:", error));
}

// Function to send filter to Lua (for real-time preview)
function sendFilterToLua(filter) {
  sendToLua("previewFilter", { filter: filter });
}

// Function to show notification
function showNotification(message) {
  notification.textContent = message;
  notification.classList.add("show");

  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}

// Listen for messages from Lua
window.addEventListener("message", (event) => {
  const data = event.data;

  switch (data.action) {
    case "showUI":
      screenshotContainer.classList.remove("hidden");
      previewContainer.classList.add("hidden");
      break;

    case "hideUI":
      screenshotContainer.classList.add("hidden");
      previewContainer.classList.add("hidden");
      break;

    case "showPreview":
      // Store screenshot data
      lastScreenshotData = data.imageData;

      // Set preview image
      previewImage.src = data.imageData;

      // Show preview UI
      screenshotContainer.classList.add("hidden");
      previewContainer.classList.remove("hidden");
      break;

    case "showNotification":
      showNotification(data.message);
      break;
  }
});

// Initialize - inform Lua that the UI is ready
window.onload = function () {
  sendToLua("uiReady");
};
///////////////////////////////
const mapContainer = document.getElementById("mapContainer");
const currentLocationBtn = document.getElementById("currentLocationBtn");
const directionsBtn = document.getElementById("directionsBtn");

currentLocationBtn.addEventListener("click", function () {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        console.log(
          `Latitude: ${position.coords.latitude}\nLongitude: ${position.coords.longitude}`
        );
        // In a real app, you'd use these coordinates to center the map
      },
      function (error) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.log("User denied the request for Geolocation.");
            break;
          case error.POSITION_UNAVAILABLE:
            console.log("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            console.log("The request to get user location timed out.");
            break;
          default:
            console.log("An unknown error occurred.");
        }
      }
    );
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
});

directionsBtn.addEventListener("click", function () {
  console.log("Directions feature coming soon!");
});

const musicLibrary = [
  {
    title: "Bohemian Rhapsody",
    artist: "Queen",
    artwork: "/api/placeholder/300/300",
    duration: "5:55",
  },
  {
    title: "Imagine",
    artist: "John Lennon",
    artwork: "/api/placeholder/300/300",
    duration: "3:03",
  },
  {
    title: "Billie Jean",
    artist: "Michael Jackson",
    artwork: "/api/placeholder/300/300",
    duration: "4:54",
  },
  {
    title: "Like a Rolling Stone",
    artist: "Bob Dylan",
    artwork: "/api/placeholder/300/300",
    duration: "6:13",
  },
  {
    title: "Smells Like Teen Spirit",
    artist: "Nirvana",
    artwork: "/api/placeholder/300/300",
    duration: "5:01",
  },
];

// DOM Elements
const albumArtwork = document.getElementById("albumArtwork");
const trackTitle = document.getElementById("trackTitle");
const trackArtist = document.getElementById("trackArtist");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const playPauseBtn = document.getElementById("playPauseBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

// Music Player State
let currentTrackIndex = 0;
let isPlaying = false;

// Update Track Information
function updateTrackInfo(track) {
  trackTitle.textContent = track.title;
  trackArtist.textContent = track.artist;
  albumArtwork.src = track.artwork;
  totalTime.textContent = track.duration;
}

// Initialize first track
updateTrackInfo(musicLibrary[currentTrackIndex]);

// Play/Pause functionality
playPauseBtn.addEventListener("click", function () {
  isPlaying = !isPlaying;
  this.classList.toggle("is-playing", isPlaying);
  console.log(isPlaying ? "Playing" : "Paused");
});

// Next Track
nextBtn.addEventListener("click", function () {
  currentTrackIndex = (currentTrackIndex + 1) % musicLibrary.length;
  updateTrackInfo(musicLibrary[currentTrackIndex]);
  isPlaying = false;
  playPauseBtn.classList.remove("is-playing");
});

// Previous Track
prevBtn.addEventListener("click", function () {
  currentTrackIndex =
    (currentTrackIndex - 1 + musicLibrary.length) % musicLibrary.length;
  updateTrackInfo(musicLibrary[currentTrackIndex]);
  isPlaying = false;
  playPauseBtn.classList.remove("is-playing");
});

// JavaScript file: ui/script.js
document.addEventListener("DOMContentLoaded", function () {
  window.addEventListener("message", function (event) {
    const data = event.data;

    const cameraContainer = document.getElementById("cameraContainer");

    if (data.type === "showCamera") {
      if (data.show) {
        cameraContainer.style.display = "block";
        console.log("Camera UI SHOWN");
      } else {
        cameraContainer.style.display = "none";
        console.log("Camera UI HIDDEN");
      }
    }
  });
});

// Listen for incoming messages
window.addEventListener("message", function (event) {
  if (event.data.action === "showContact") {
    const contacts = event.data.user_data; // Assume the contacts are in event.data.contacts
    // Call the function to display the contacts
    showContactsUI(contacts);
  }
});

let allContacts = []; // To store the fetched contacts

// Show all the contacts in the message list
function showContactsUI(contacts) {
  allContacts = contacts; // Save contacts for the modal
  const messageList = document.getElementById("messageList");
  messageList.innerHTML = ""; // Clear previous list

  contacts.forEach((contact) => {
    const chatItem = document.createElement("div");
    chatItem.classList.add("chat-item");
    chatItem.setAttribute(
      "onclick",
      `openChatTextUser(${JSON.stringify(contact)})`
    );

    // Profile image
    const profileImg = document.createElement("img");
    profileImg.src = contact.avatar || "./images/default-profile.png"; // Use default if not available
    profileImg.classList.add("profile-image");
    profileImg.width = 40; // Profile image size
    profileImg.height = 40;
    profileImg.style.borderRadius = "50%"; // Make it circular

    // Chat name
    const chatName = document.createElement("div");
    chatName.classList.add("chat-name");
    chatName.innerText = contact.username;

    // Right arrow image
    const rightArrow = document.createElement("img");
    rightArrow.src = "./images/right.png";
    rightArrow.width = 15;

    // Create a container for name + right arrow (for better layout)
    const nameAndArrow = document.createElement("div");
    nameAndArrow.classList.add("name-arrow-container");
    nameAndArrow.appendChild(chatName);
    nameAndArrow.appendChild(rightArrow);

    // Now assemble everything
    chatItem.appendChild(profileImg);
    chatItem.appendChild(nameAndArrow);
    messageList.appendChild(chatItem);
  });
}

// Open the modal when user clicks the "+" button
function openGroupModal() {
  const modal = document.getElementById("groupModal");
  const userList = document.getElementById("groupUserList");
  userList.innerHTML = ""; // Clear previous checkboxes

  allContacts.forEach((contact, index) => {
    const userItem = document.createElement("div");
    userItem.classList.add("checkbox-labels");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = contact.username; // only username in value
    checkbox.id = `user_${index}`;
    checkbox.setAttribute("data-phone", contact.phone); // store phone in data attribute

    const label = document.createElement("label");
    label.setAttribute("for", `user_${index}`);
    label.innerText = `${contact.username} (${contact.phone})`;

    userItem.appendChild(checkbox);
    userItem.appendChild(label);
    userList.appendChild(userItem);
  });

  modal.style.display = "flex";
}

// Create the group and send the data to the server
function createGroup() {
  const groupName = document.getElementById("groupNameInput").value;
  const checkboxes = document.querySelectorAll(
    "#groupUserList input[type='checkbox']:checked"
  );

  const selectedUsers = Array.from(checkboxes).map((cb) => ({
    username: cb.value,
    phone: cb.getAttribute("data-phone"),
  }));

  if (groupName === "" || selectedUsers.length === 0) {
    return;
  }

  const groupData = {
    name: groupName,
    members: selectedUsers,
  };

  fetch(`https://${GetParentResourceName()}/group:display`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify(groupData),
  })
    .then((response) => response.json())
    .then((data) => {})
    .catch((error) => {
      console.error("Error:", error);
    });

  document.getElementById("groupModal").style.display = "none";
  document.getElementById("groupNameInput").value = "";

  console.log("Group creation triggered!");
}

// Add event listeners
document
  .getElementById("openGroupModalButton")
  .addEventListener("click", openGroupModal);
document
  .getElementById("createGroupButton")
  .addEventListener("click", createGroup);

// Send message to Lua
let selectedChatUser = null; // To store the selected user's username

// Show the chat screen and hide the user list
function openChatTextUser(data) {
  selectedChatUser = data.username;

  document.getElementById("chatScreen").style.display = "flex";
  document.getElementById("hder").style.display = "none";
  document.getElementById("messages-main").style.display = "none";

  document.getElementById("pfp-msg-img").src = data.avatar;
  document.getElementById("chatName").innerText = selectedChatUser;

  fetch(`https://${GetParentResourceName()}/getMessages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      receiver: selectedChatUser,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      // process messages
    })
    .catch((error) => {
      console.error("Error fetching messages:", error);
    });
}

// Send message to the selected user
function sendMessageToServer() {
  const messageInput = document.getElementById("messageInputPhone");
  const message = messageInput.value;

  if (!selectedChatUser || !message.trim()) {
    console.warn("Either no user selected or message is empty.");
    return;
  }

  // Clear input field
  messageInput.value = "";

  // Send to server
  fetch(`https://${GetParentResourceName()}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      receiver: selectedChatUser,
      message: message,
    }),
  }).catch((err) => {
    console.error("Error sending message:", err);
  });
}

let lastMessageId = 0; // Track last message shown

window.addEventListener("message", function (event) {
  const data = event.data;
  if (data.type === "receiveMessages") {
    localStorage.setItem("myUserName", data.name);

    const messages = data.messages;
    const messageList = document.getElementById("phoneMessageList");
    const currentPlayer = localStorage.getItem("myUserName");

    messages.forEach((msg) => {
      // Only append messages newer than lastMessageId
      if (msg.id > lastMessageId) {
        const msgItem = document.createElement("div");
        msgItem.classList.add("message-item");

        if (msg.sender === currentPlayer) {
          msgItem.classList.add("sent");
        } else {
          msgItem.classList.add("received");
        }

        msgItem.innerHTML = `${msg.message}`;
        messageList.appendChild(msgItem);

        lastMessageId = msg.id; // Update last seen ID
      }
    });

    // Scroll to bottom
    messageList.scrollTop = messageList.scrollHeight;
  }
});

// Close the chat screen (go back to contacts list or home screen)
function closeMesChat() {
  // Hide the chat screen and show the user list again
  document.getElementById("chatScreen").style.display = "none";
  document.getElementById("messages-main").style.display = "block";
  document.getElementById("hder").style.display = "flex";
}

function getRandomTime() {
  const times = ["5 mins ago", "Yesterday", "2 days ago", "3 hours ago"];
  return times[Math.floor(Math.random() * times.length)];
}

// Function to open chat when a contact is clicked

function clearNumber() {
  document.getElementById("dialDisplay").innerText = "Enter Number";
  document.getElementById("contactDropdown").classList.add("hidden");
  document.getElementById("saveNumberBtn").classList.add("hidden");
}

// Add recentCalls array to store recent calls
let recentCalls = [];

function call() {
  const dialDisplay = document.getElementById("dialDisplay");
  const number = dialDisplay.innerText;

  // Check if the number exists in contacts
  const matchedContact = contactsList.find(
    (contact) => contact.phone === number
  );

  // Add to recent calls
  const currentTime = new Date();
  const callEntry = {
    name: matchedContact ? matchedContact.username : number,
    phone: number,
    time: currentTime.toISOString(),
    timestamp: currentTime.getTime(),
  };

  recentCalls.unshift(callEntry); // Add to start of array
  if (recentCalls.length > 10) recentCalls.pop(); // Keep only last 10 calls

  updateRecentsList();

  if (matchedContact) {
    showNotification(`Calling ${matchedContact.username}...`);
  } else {
    showNotification(`Calling ${number}...`);
  }

  // Reset display after call
  setTimeout(() => {
    dialDisplay.innerText = "Enter Number";
  }, 1000);
}

function updateRecentsList(data) {
  const recentsSection = document.querySelector(
    "#recentsSection .phone-tab ul"
  );

  if (recentsSection && data?.length > 0) {
    recentsSection.innerHTML = data
      .slice() // make a copy to avoid mutating original
      .reverse() // reverse the order
      .map((call) => {
        const timeAgo = getTimeAgo(call.time);
        return `<li class="contact-item" onclick="dialNumber('${call.receiver}')">
                <div class="recent-call-info">
                  <span class="recent-call-icon">📞</span>
                  <div class="recent-call-details">
                    <div class="recent-call-name">
                      +${call.receiver}
                    </div>
                    <div class="recent-call-time">${timeAgo}</div>
                  </div>
                </div>
              </li>`;
      })
      .join("");
  } else if (recentsSection) {
    recentsSection.innerHTML = '<li class="contact-item">No recent calls</li>';
  }
}

function getRecentTabs() {
  fetch(`https://${GetParentResourceName()}/phone:getContacts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {});
}

window.addEventListener("message", function (event) {
  if (event.data.action === "showRecentContacts") {
    updateRecentsList(event.data.contacts);
  }
});
function dialNumber(number) {
  const dialDisplay = document.getElementById("dialDisplay");
  dialDisplay.innerText = number;
  switchTab("dialSection", document.querySelector(".menu-item:last-child"));
}

function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

// Group Modal Functionality
document.addEventListener("DOMContentLoaded", function () {
  const openGroupModalButton = document.getElementById("openGroupModalButton");
  const groupModal = document.getElementById("groupModal");
  const cancelGroupButton = document.getElementById("cancelGroupButton");
  const createGroupButton = document.getElementById("createGroupButton");
  const groupNameInput = document.getElementById("groupNameInput");

  // Open modal when plus button is clicked
  openGroupModalButton.addEventListener("click", function () {
    groupModal.style.display = "flex";
  });

  // Close modal when cancel button is clicked
  cancelGroupButton.addEventListener("click", function () {
    groupModal.style.display = "none";
    groupNameInput.value = ""; // Clear input
  });

  // Close modal when clicking outside the modal content
  groupModal.addEventListener("click", function (e) {
    if (e.target === groupModal) {
      groupModal.style.display = "none";
      groupNameInput.value = ""; // Clear input
    }
  });

  // Create group functionality
  createGroupButton.addEventListener("click", function () {
    const groupName = groupNameInput.value.trim();
    if (groupName) {
      // Here you can add your group creation logic
      groupModal.style.display = "none";
      groupNameInput.value = ""; // Clear input
    } else {
      console.log("Please enter a group name");
    }
  });
});
let currentGroupId = null;

window.addEventListener("message", function (event) {
  if (event.data.action === "displayGroups") {
    const groupContainer = document.getElementById("groupList");
    groupContainer.innerHTML = "";
    const imageContainer = document.createElement("img");
    imageContainer.src = "./images/right.png";
    imageContainer.width = 15;
    event.data.groups.forEach((group) => {
      const btn = document.createElement("button");
      btn.innerText = group.name;
      btn.onclick = () => {
        currentGroupId = group.id;
        document.getElementById("gc-name").innerText = group.name;
        // Request messages
        fetch(`https://${GetParentResourceName()}/getGroupMessages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ groupId: group.id }),
        });

        document.getElementById("groupChatScreen").style.display = "block";
        document.getElementById("openGroupModalButton").style.display = "none";
        document.getElementById("nav-sn2").style.display = "none";
      };
      btn.appendChild(imageContainer);
      groupContainer.appendChild(btn);
    });
  }

  if (event.data.action === "loadGroupMessages") {
    const msgContainer = document.querySelector(".group-chat-messages");
    msgContainer.innerHTML = "";
    event.data.messages.forEach((msg) => {
      const div = document.createElement("div");
      const time = new Date(msg.timestamp * 1000).toLocaleTimeString();
      div.innerHTML = `
      <div class="message-gc">
      <p>${msg.sender} :</p>
      <p>${msg.message} <span>${time}</span></p>
      </div>
       
      
      `;
      msgContainer.appendChild(div);
    });
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }
});

document
  .querySelector(".group-chat-input button")
  .addEventListener("click", () => {
    const input = document.querySelector(".group-chat-input input");
    const message = input.value.trim();
    if (!message || !currentGroupId) return;

    fetch(`https://${GetParentResourceName()}/sendGroupMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        groupId: currentGroupId,
        message: message,
      }),
    });

    input.value = "";
  });

// Back Button
document
  .querySelector(".group-chat-back")
  .addEventListener("click", function () {
    document.getElementById("groupChatScreen").style.display = "none";
    document.getElementById("openGroupModalButton").style.display = "block";
    document.getElementById("nav-sn2").style.display = "flex";
  });

window.addEventListener("message", function (event) {
  if (event.data.action === "displayMembers") {
    const chatBox = document.getElementById("chatMembers");
    chatBox.innerHTML = "";
    event.data.members.forEach((member) => {
      const div = document.createElement("div");
      div.innerText = `${member.username} (${member.phone})`;
      chatBox.appendChild(div);
    });
  }
});
document.getElementById("sendBtn").addEventListener("click", () => {
  const input = document.getElementById("messageInput");
  const message = input.value.trim();
  if (!message || !window.currentGroupId) return;

  fetch(`https://${GetParentResourceName()}/sendGroupMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      groupId: window.currentGroupId,
      sender: window.playerName || "Unknown", // make sure to set this somewhere
      message: message,
    }),
  });

  input.value = "";
});
function switchTabCht(tab) {
  const chatScreen = document.getElementById("messageList");
  const groupSection = document.getElementById("groupList").parentElement; // message-olma containing groupList + groupChatScreen

  const chatButton = document.querySelector(".chat-button");
  const groupButton = document.querySelector(".group-button");

  if (tab === "chat") {
    chatScreen.style.display = "block";
    groupSection.style.display = "none";
    chatButton.classList.add("active");
    groupButton.classList.remove("active");
  } else if (tab === "groups") {
    chatScreen.style.display = "none";
    groupSection.style.display = "block";
    chatButton.classList.remove("active");
    groupButton.classList.add("active");
    fetch(`https://${GetParentResourceName()}/groups:requestBserver`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
  }
}

///////////////////////////////////gc ka code

// ... existing code ...

// Add member modal functionality
let currentGroupMembers = [];

document.addEventListener("DOMContentLoaded", function () {
  // Add event listener for the add members button
  const addMembersBtn = document.querySelector(".add-members");
  if (addMembersBtn) {
    addMembersBtn.addEventListener("click", openAddMemberModal);
  }

  // Add event listener for the close button
  const closeModalBtn = document.getElementById("closeMemberModal");
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
      document.getElementById("addMemberModal").style.display = "none";
    });
  }

  // Add event listener for the confirm button
  const confirmBtn = document.getElementById("confirmAddMembersButton");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", handleAddMembers);
  }

  // Add event delegation for member removal
  document.addEventListener("click", function (e) {
    if (e.target && e.target.classList.contains("member-remove")) {
      const username = e.target.dataset.username;
      if (username) {
        removeMemberFromGroup(username);
      }
    }
  });
});

function showWarning(message) {
  const warningDiv = document.getElementById("memberWarning");
  if (warningDiv) {
    warningDiv.textContent = message;
    warningDiv.style.display = "block";
    setTimeout(() => {
      warningDiv.style.display = "none";
    }, 3000);
  }
}

function openAddMemberModal() {
  const modal = document.getElementById("addMemberModal");
  if (!modal) return;

  modal.style.display = "block";

  // Clear previous lists
  const existingList = document.getElementById("existingMembersList");
  const addList = document.getElementById("addMemberUserList");
  if (existingList) existingList.innerHTML = "";
  if (addList) addList.innerHTML = "";

  // Get current group members
  fetch(`https://${GetParentResourceName()}/getGroupMembers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ groupId: currentGroupId }),
  });
}

function updateMemberLists(members) {
  currentGroupMembers = members;
  const existingList = document.getElementById("existingMembersList");
  const addList = document.getElementById("addMemberUserList");

  if (!existingList || !addList) return;

  // Clear previous lists
  existingList.innerHTML = "";
  addList.innerHTML = "";

  // Show existing members
  members.forEach((member) => {
    const memberItem = document.createElement("div");
    memberItem.classList.add("member-item");
    memberItem.innerHTML = `
            <div class="member-info">
                <div class="member-name">${member.username}</div>
                <div class="member-phone">${member.phone}</div>
            </div>
            <button class="member-remove" data-username="${member.username}" type="button">×</button>
        `;
    existingList.appendChild(memberItem);
  });

  // Show available contacts for adding
  if (allContacts) {
    allContacts.forEach((contact) => {
      // Skip if already a member
      if (members.some((m) => m.username === contact.username)) return;

      const memberItem = document.createElement("div");
      memberItem.classList.add("member-item");
      memberItem.innerHTML = `
                <input type="checkbox" class="member-checkbox" data-username="${contact.username}" data-phone="${contact.phone}">
                <div class="member-info">
                    <div class="member-name">${contact.username}</div>
                    <div class="member-phone">${contact.phone}</div>
                </div>
            `;
      addList.appendChild(memberItem);
    });
  }
}

function handleAddMembers() {
  const selectedMembers = document.querySelectorAll(".member-checkbox:checked");
  if (selectedMembers.length === 0) {
    showWarning("Please select at least one member to add");
    return;
  }

  let addedCount = 0;
  selectedMembers.forEach((checkbox) => {
    const username = checkbox.dataset.username;

    // Check if member already exists
    if (currentGroupMembers.some((m) => m.username === username)) {
      showWarning(`${username} is already a member of this group`);
      return;
    }

    const memberData = {
      groupId: currentGroupId,
      member: {
        username: checkbox.dataset.username,
        phone: checkbox.dataset.phone,
      },
    };

    fetch(`https://${GetParentResourceName()}/groupAddMembers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(memberData),
    }).then(() => {
      addedCount++;
      if (addedCount === selectedMembers.length) {
        // Refresh member list only after all members are added
        refreshMemberList();
      }
    });
  });

  // Close modal
  document.getElementById("addMemberModal").style.display = "none";
}

function removeMemberFromGroup(username) {
  if (!username || !currentGroupId) {
    console.error("Missing username or group ID for member removal");
    showWarning("Cannot remove member: Missing information");
    return;
  }

  const data = {
    groupId: currentGroupId,
    username: username,
  };

  fetch(`https://${GetParentResourceName()}/group:removeMember`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((response) => {
      if (!response.success) {
        showWarning(response.message || "Failed to remove member");
      }
    })
    .catch((error) => {
      console.error("Error removing member:", error);
      showWarning("Failed to remove member. Please try again.");
    });
}

function refreshMemberList() {
  if (!currentGroupId) return;

  fetch(`https://${GetParentResourceName()}/getGroupMembers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ groupId: currentGroupId }),
  });
}

// Update the existing message event listener
window.addEventListener("message", function (event) {
  if (event.data.action === "displayMembers") {
    updateMemberLists(event.data.members);
  }
  // ... keep other existing message handlers ...
});

// Close modal when clicking outside
window.addEventListener("click", function (event) {
  const modal = document.getElementById("addMemberModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

// ... existing code ...

// Instagram Authentication
document.addEventListener("DOMContentLoaded", function () {
  // Get DOM elements
  const showSignupBtn = document.getElementById("show-signup");
  const showLoginBtn = document.getElementById("show-login");
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const loginBtn = document.getElementById("login-btn");
  const signupBtn = document.getElementById("signup-btn");
  const instagramAuth = document.getElementById("instagram-auth");
  const instagramMain = document.getElementById("instagram-main");

  // Show signup form
  showSignupBtn.addEventListener("click", function () {
    loginForm.style.display = "none";
    signupForm.style.display = "flex";
  });

  // Show login form
  showLoginBtn.addEventListener("click", function () {
    signupForm.style.display = "none";
    loginForm.style.display = "flex";
  });

  // Handle login
  loginBtn.addEventListener("click", function () {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    if (!username || !password) {
      showError("Please fill in all fields");
      return;
    }
    fetch(`https://${GetParentResourceName()}/loginUser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    // Here you would typically make an API call to verify credentials
    // For demo purposes, we'll use a simple check
  });

  // Handle signup
  signupBtn.addEventListener("click", function () {
    const username = document.getElementById("signup-username").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password");
    const confirmPassword = document.getElementById("signup-confirm-password");

    if (!username || !email || !password.value || !confirmPassword.value) {
      showError("Please fill in all fields");
      return;
    }

    if (password.value !== confirmPassword.value) {
      showError("Passwords do not match");
      return;
    }

    fetch(`https://${GetParentResourceName()}/registerUser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password: password.value,
        email,
      }),
    });
    signupForm.style.display = "none";
    loginForm.style.display = "flex";
    // Store user data (in a real app, this would be done on a server)
    // localStorage.setItem(username, password.value);
    // localStorage.setItem(username + '_email', email);

    // Log the user in
  });
  // Helper function to show error messages
  function showError(message) {
    // Remove any existing error message
    const existingError = document.querySelector(".auth-error");
    if (existingError) {
      existingError.remove();
    }

    // Create and show new error message
    const error = document.createElement("div");
    error.className = "auth-error";
    error.textContent = message;

    const activeForm =
      signupForm.style.display === "none" ? loginForm : signupForm;
    activeForm.insertBefore(error, activeForm.firstChild);

    // Remove error after 3 seconds
    setTimeout(() => error.remove(), 3000);
  }
  // Helper function for successful login
  window.addEventListener("message", function (event) {
    if (event.data.action === "showInstagram") {
      if (event.data.username) {
        localStorage.setItem("userDetails", event.data.username);
        localStorage.setItem("user_id", event.data.id);
        instagramAuth.style.display = "none";
        instagramMain.style.display = "block";
        renderFeed();
      }
    }
  });
  instagramAuth.style.display = "none";
  instagramMain.style.display = "block";
  var i = localStorage.getItem("userDetails");
  window.addEventListener("message", function (event) {
    if (event.data.type === "loadInstaAllUsers") {
      document.getElementById(
        "user-name-pfp"
      ).innerText = ` @${event?.data?.users[0]?.username}`;

      var pfp = document.getElementById("prf-pic");
      pfp.src = event?.data?.users[0]?.image;
    }
  });
  if (i) {
    instagramAuth.style.display = "none";
    instagramMain.style.display = "block";
    renderFeed();
  }

  window.addEventListener("message", function (event) {
    const data = event.data;

    if (data.type === "instagram:loginFailed") {
      showError(data.message); // Show the error message in UI
    }

    if (data.type === "instagram:loginSuccess") {
      loginSuccess(data.details); // Show main app
    }
  });
  function showError(message) {
    const errorBox = document.createElement("div");
    errorBox.className = "auth-error";
    errorBox.innerText = message;

    const form = document.querySelector("#login-form");
    form.prepend(errorBox);

    setTimeout(() => errorBox.remove(), 3000);
  }

  // Check if user is already logged in
});
function getAllInstagramUserDetails() {
  fetch(`https://${GetParentResourceName()}/getAllInstagramUserDetails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: localStorage.getItem("user_id"),
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      // Update your UI with the received data (posts)
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}
function getUserUploadPosts() {
  fetch(`https://${GetParentResourceName()}/getUserUploadPost`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: localStorage.getItem("userDetails"),
    }),
  })
    .then((response) => response.json())
    .then((data) => {})
    .catch((error) => {
      console.log("Error Fetching data", error);
    });
}
getAllInstagramUserDetails();
// ... existing code ...
window.addEventListener("message", function (event) {
  if (event.data.type === "ownPostFetched") {
    var postGrid = document.getElementById("postGrid");
    postGrid.innerHTML = "";
    var posts = event.data.ownPosts;

    if (posts.length > 0) {
      posts.forEach((post) => {
        var div = document.createElement("div");
        div.classList.add("post-card");

        // Create image element separately
        var img = document.createElement("img");
        img.src = post.image;
        img.classList.add("post-image");

        // Attach click listener and pass post object
        img.addEventListener("click", function () {
          openPost(post);
        });

        // Append image to div and div to grid
        div.appendChild(img);
        postGrid.appendChild(div);
      });
    } else {
      var div = document.createElement("div");
      div.classList.add("no-post-message");
      div.innerText = "No posts found.";
      postGrid.appendChild(div);
    }
  }
});

function openPost(data) {
  var profileView = document.getElementById("profileView");
  profileView.style.display = "block";
  profileView.innerHTML = `
 <div class="innerPreview">
 <button id="closePreviewBtn" class="close-btn">✖</button>
 <h3>@${localStorage.getItem("userDetails")}</h3>
  <img src=${data.image} alt="" />
  <div class="preview-actions">
  <p>${data.caption}</p>
  <button class="like-btn" data-id="${data.id}">❤️  ${
    data.likeCount || 0
  }</button>
  </div>
 </div>
  `;
  document
    .getElementById("closePreviewBtn")
    .addEventListener("click", function () {
      profileView.style.display = "none";
    });
}
// Add these functions after your existing Instagram-related functions

function openUploadSection() {
  document.getElementById("upload-post-section").style.display = "block";
  document.getElementById("upload-overlay").style.display = "block";
}
function openEditModal() {
  document.getElementById("edit-pfp-modal").style.display = "flex";
}
function closeEditModal() {
  document.getElementById("edit-pfp-modal").style.display = "none";
}
function closeUploadSection() {
  document.getElementById("upload-post-section").style.display = "none";
  document.getElementById("upload-overlay").style.display = "none";
  // Reset the form
  document.getElementById("link-input").value = "";
  document.getElementById("caption-input").value = "";
}

function updateProfile() {
  var profile = document.getElementById("profile-photo").value;

  fetch(`https://${GetParentResourceName()}/updateProfile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      userId: localStorage.getItem("user_id"),
      profile: profile,
    }),
  });
  setTimeout(() => {
    profile = "";
  }, 1000);
  document.getElementById("edit-pfp-modal").style.display = "none";
}

function logout() {
  localStorage.removeItem("userDetails");
  localStorage.removeItem("user_id");
  document.getElementById("instagram-auth").style.display = "block";
  document.getElementById("instagram-main").style.display = "none";
  getAllInstagramUserDetails();
  getUserUploadPosts();
  loadStories();
}
// Add event listener for the share button
document
  .getElementById("share-link-btn")
  .addEventListener("click", function () {
    const link = document.getElementById("link-input").value.trim();
    const caption = document.getElementById("caption-input").value.trim();

    if (!link) {
      return;
    }
    var username = localStorage.getItem("userDetails");
    // Send to Lua via NUI
    fetch(`https://${GetParentResourceName()}/uploadPost`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({
        username: username,
        image: link,
        caption: caption,
      }),
    });
    closeUploadSection();
    setTimeout(() => {
      fetch(`https://${GetParentResourceName()}/renderPost`, {
        method: "POST", // Or 'GET', depending on your use case
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          /* optional data if needed */
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          // Update your UI with the received data (posts)
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }, 2000);

    // Optionally reset the form
    document.getElementById("link-input").value = "";
    document.getElementById("caption-input").value = "";
  });
window.addEventListener("message", function (event) {
  if (event.data.type === "showPosts") {
    renderFeed(event.data.insta_posts);
  }
});
function getTimeAgo(date) {
  const now = new Date();
  const secondsAgo = Math.floor((now - new Date(date)) / 1000);

  const intervals = {
    y: 31536000,
    m: 2592000,
    w: 604800,
    d: 86400,
    hr: 3600,
    min: 60,
    sec: 1,
  };

  for (let key in intervals) {
    const interval = Math.floor(secondsAgo / intervals[key]);
    if (interval >= 1) {
      if (key === "sec" && interval < 60) return "Just now";
      return `${interval} ${key}${interval > 1 ? "s" : ""} ago`;
    }
  }
}
window.addEventListener("message", function (event) {
  if (event.data.type === "sendComments") {
    renderPubComments(event.data.comments);
  }
});
function renderFeed(posts) {
  const feed = document.getElementById("instagram-feed");
  feed.innerHTML = "";
  posts?.forEach((post) => {
    const postEl = document.createElement("div");
    postEl.className = "insta-post";
    postEl.innerHTML = `
    <div class="post-username">@${post.username}</div>
    <img src="${post.image}" alt=""/>
    <p class="post-caption">${post.caption}</p>
    <small class="post-time">${getTimeAgo(post.created_at)}</small>
  
    <div class="post-actions">
      <button class="like-btn" data-id="${post.id}">❤️  ${
      post.likeCount || 0
    }</button>
      <button class="comment-btn" data-id="${post.id}">💬  ${
      post.commentCount || 0
    }</button>
    
    </div>
  
    <div class="comment-section" id="comments-${
      post.id
    }" style="display : none">
    <button class="close-comment-btn" data-id="${post.id}">
    x
    </button>
    <div class="peoples-comments" id="public-comments"></div>
    <div class="comment-input-section">
      <input type="text" class="comment-input" placeholder="Write a comment..." />
      <button class="send-comment-btn"><img src="./images/send.png"/></button>
      </div>
    </div>
  `;

    feed.appendChild(postEl);
  });

  setupPostInteractions();
}

function renderPubComments(comments) {
  var comments_div = document.getElementById("public-comments");
  comments_div.innerHTML = "";
  comments.forEach((comment) => {
    const commentEl = document.createElement("div");
    commentEl.className = "comment-item";
    commentEl.innerHTML = `
      <h4><strong>${comment.username}:</strong>
       <span>${getTimeAgo(comment.timeStamp)} </span></h4>
      <p>${comment.comment}</p>
    `;
    comments_div.appendChild(commentEl);
  });
}
function setupPostInteractions() {
  document.querySelectorAll(".like-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const postId = btn.getAttribute("data-id");
      var username = localStorage.getItem("userDetails");
      fetch(`https://${GetParentResourceName()}/renderPost`, {
        method: "POST", // Or 'GET', depending on your use case
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      })
        .then((response) => response.json())
        .then((data) => {
          // Update your UI with the received data (posts)
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });

      fetch(`https://${GetParentResourceName()}/likePost`, {
        method: "POST",
        body: JSON.stringify({ postID: postId, username: username }),
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
        },
      });
    });
  });
  document.querySelectorAll(".close-comment-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const postId = btn.getAttribute("data-id");
      const commentBox = document.getElementById(`comments-${postId}`);
      commentBox.style.display = "none";
    });
  });

  document.querySelectorAll(".comment-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const postId = btn.getAttribute("data-id");
      const commentBox = document.getElementById(`comments-${postId}`);
      commentBox.style.display =
        commentBox.style.display === "none" ? "block" : "none";
      fetch(`https://${GetParentResourceName()}/viewComment`, {
        method: "POST",
        body: JSON.stringify({ postId }),
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
        },
      });
    });
  });
  document.querySelectorAll(".send-comment-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn.previousElementSibling;
      const comment = input.value.trim();
      fetch(`https://${GetParentResourceName()}/renderPost`, {
        method: "POST", // Or 'GET', depending on your use case
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          /* optional data if needed */
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Received data from server:", data);
          // Update your UI with the received data (posts)
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });

      // 🔥 Get postId from the closest parent element (post)
      const postElement = btn.closest(".insta-post");
      const postId = postElement
        .querySelector(".like-btn")
        .getAttribute("data-id");
      var username = localStorage.getItem("userDetails");
      if (comment !== "") {
        fetch(`https://${GetParentResourceName()}/addComment`, {
          method: "POST",
          body: JSON.stringify({ postId, comment, username }),
          headers: {
            "Content-Type": "application/json; charset=UTF-8",
          },
        });
        input.value = "";
      }
    });
  });

  document.querySelectorAll(".share-btn").forEach((btn) => {
    const postId = btn.getAttribute("data-id");
    fetch(`https://${GetParentResourceName()}/sharePost`, {
      method: "POST",
      body: JSON.stringify({ postId }),
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
    });
  });
}

document.getElementById("openModal").addEventListener("click", () => {
  document.getElementById("story-upload").style.display = "flex";
});
document.getElementById("close-story-modal").addEventListener("click", () => {
  document.getElementById("story-upload").style.display = "none";
});

let stories = [];

// Show story upload modal
document.getElementById("openModal").addEventListener("click", () => {
  document.getElementById("story-upload").style.display = "block";
});

// Close story upload modal
document.getElementById("close-story-modal").addEventListener("click", () => {
  document.getElementById("story-upload").style.display = "none";
});

// Upload story
document.getElementById("upload-story").addEventListener("click", () => {
  const imageUrlInput = document.getElementById("story-image-url");
  const imageUrl = imageUrlInput.value.trim();
  var username = localStorage.getItem("userDetails");

  if (imageUrl !== "") {
    fetch(`https://${GetParentResourceName()}/uploadStory`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ image: imageUrl, username: username }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          imageUrlInput.value = ""; // ✅ Clear input field
          document.getElementById("story-upload").style.display = "none"; // Hide modal
          loadStories(); // Reload stories
        }
      });
  }
});

function loadStories() {
  fetch(`https://${GetParentResourceName()}/getStories`)
    .then((res) => res.json())
    .then((data) => {
      stories = data;
    });
}

// Show story viewer
function showStory(username, userStories, initialIndex = 0) {
  const viewer = document.getElementById("storyViewer");
  const storyContent = document.getElementById("storyContent");

  // Clear previous story content
  storyContent.innerHTML = "";

  // Create story slider with progress indicators
  const progressContainer = document.createElement("div");
  progressContainer.className = "story-progress-container";

  // Add progress bars for each story
  userStories.forEach((_, i) => {
    const progressBar = document.createElement("div");
    progressBar.className = `story-progress ${
      i === initialIndex ? "active" : ""
    }`;
    progressContainer.appendChild(progressBar);
  });

  // Add story content
  const storyImage = document.createElement("img");
  storyImage.id = "storyImage";
  storyImage.src = userStories[initialIndex].image;

  const storyUser = document.createElement("div");
  storyUser.id = "storyUser";
  storyUser.textContent = `@${username}`;

  // Add navigation controls
  const prevBtn = document.createElement("button");
  prevBtn.className = "story-nav-btn prev-btn";
  prevBtn.innerHTML = "‹";
  prevBtn.style.display = initialIndex > 0 ? "block" : "none";

  const nextBtn = document.createElement("button");
  nextBtn.className = "story-nav-btn next-btn";
  nextBtn.innerHTML = "›";
  nextBtn.style.display =
    initialIndex < userStories.length - 1 ? "block" : "none";

  // Append elements to viewer
  storyContent.appendChild(progressContainer);
  storyContent.appendChild(storyUser);
  storyContent.appendChild(storyImage);
  storyContent.appendChild(prevBtn);
  storyContent.appendChild(nextBtn);

  // Set current story index
  viewer.dataset.currentIndex = initialIndex;
  viewer.dataset.currentUser = username;
  viewer.dataset.totalStories = userStories.length;

  // Store stories in viewer
  viewer.stories = userStories;

  // Show viewer
  viewer.style.display = "flex";

  // Auto progress after 5 seconds
  startStoryTimer();

  // Navigation event listeners
  prevBtn.addEventListener("click", navigateStory.bind(null, -1));
  nextBtn.addEventListener("click", navigateStory.bind(null, 1));

  // Touch/swipe navigation
  let touchStartX = 0;
  storyContent.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  storyContent.addEventListener("touchend", (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 30) {
      // Minimum swipe distance
      navigateStory(diff > 0 ? 1 : -1);
    }
  });
}

// Timer for auto-advancing stories
let storyTimer;
function startStoryTimer() {
  clearTimeout(storyTimer);
  storyTimer = setTimeout(() => {
    navigateStory(1);
  }, 5000); // 5 seconds per story
}

// Navigate between stories
function navigateStory(direction) {
  const viewer = document.getElementById("storyViewer");
  const currentIndex = parseInt(viewer.dataset.currentIndex);
  const totalStories = parseInt(viewer.dataset.totalStories);
  const currentUser = viewer.dataset.currentUser;
  const userStories = viewer.stories;

  clearTimeout(storyTimer);

  const newIndex = currentIndex + direction;

  // Check if we're still within the current user's stories
  if (newIndex >= 0 && newIndex < totalStories) {
    updateStoryView(currentUser, userStories, newIndex);
  } else if (newIndex >= totalStories) {
    // Move to next user's stories or close
    viewer.style.display = "none";
  } else if (newIndex < 0) {
    // Move to previous user's stories or stay at beginning
    // For simplicity, we'll just stay at beginning
    startStoryTimer();
  }
}

// Update the story view without recreating everything
function updateStoryView(username, stories, newIndex) {
  const viewer = document.getElementById("storyViewer");
  const storyImage = document.getElementById("storyImage");
  const progressBars = document.querySelectorAll(".story-progress");
  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");

  // Update image
  storyImage.src = stories[newIndex].image;

  // Update progress bars
  progressBars.forEach((bar, i) => {
    if (i < newIndex) {
      bar.className = "story-progress viewed";
    } else if (i === newIndex) {
      bar.className = "story-progress active";
    } else {
      bar.className = "story-progress";
    }
  });

  // Update navigation buttons
  prevBtn.style.display = newIndex > 0 ? "block" : "none";
  nextBtn.style.display = newIndex < stories.length - 1 ? "block" : "none";

  // Update current index
  viewer.dataset.currentIndex = newIndex;

  // Restart timer
  startStoryTimer();
}

// Close viewer
document.getElementById("closeViewer").addEventListener("click", () => {
  document.getElementById("storyViewer").style.display = "none";
  clearTimeout(storyTimer);
});

// Group stories by username
function groupStoriesByUser(stories) {
  const grouped = {};
  stories.forEach((story) => {
    if (!grouped[story.username]) {
      grouped[story.username] = [];
    }
    grouped[story.username].push(story);
  });
  return grouped;
}

// Listen for external trigger
window.addEventListener("message", (event) => {
  if (event.data.type === "loadStories") {
    const currentUsername = localStorage.getItem("userDetails");

    const myStoriesBar = document.getElementById("myStoriesBar");
    const storyBar = document.getElementById("storyBar");

    myStoriesBar.innerHTML = "";
    storyBar.innerHTML = "";

    // Group stories by username
    const groupedStories = groupStoriesByUser(event.data.stories);

    // For each user with stories
    Object.keys(groupedStories).forEach((username) => {
      const userStories = groupedStories[username];
      const storyEl = document.createElement("div");
      storyEl.className = "story-circle";

      // Use the latest story image as the preview
      storyEl.innerHTML = `
        <img src="${
          userStories[0].image
        }" alt="${username}'s story" width="100%" />
        ${
          userStories.length > 1
            ? '<div class="multi-story-indicator"></div>'
            : ""
        }
      `;

      storyEl.addEventListener("click", () => {
        showStory(username, userStories, 0);
      });

      if (username === currentUsername) {
        myStoriesBar.appendChild(storyEl);
      } else {
        storyBar.appendChild(storyEl);
      }
    });
  }
});

// Load on page load
loadStories();

// get all users
function getAllUsers() {
  var i = localStorage.getItem("userDetails");
  fetch(`https://${GetParentResourceName()}/getAllUsers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({ username: i }),
  }).then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  });
}
// get all users

function openFollowers() {
  document.getElementById("main-feed-section").style.display = "none";
  document.getElementById("follower-section").style.display = "block";
  document.getElementById("Profile-Ig-section").style.display = "none";
  document.getElementById("up-sc").style.display = "none";
  getAllUsers();
}

function openFeed() {
  document.getElementById("main-feed-section").style.display = "block";
  document.getElementById("follower-section").style.display = "none";
  document.getElementById("Profile-Ig-section").style.display = "none";
  document.getElementById("up-sc").style.display = "flex";
}
function goToIgProfile() {
  document.getElementById("main-feed-section").style.display = "none";
  document.getElementById("follower-section").style.display = "none";
  document.getElementById("Profile-Ig-section").style.display = "block";
  document.getElementById("up-sc").style.display = "none";
  getAllInstagramUserDetails();
  getUserUploadPosts();
}

window.addEventListener("message", function (event) {
  if (event.data.type === "instagramUsers") {
    renderUsersToFollow(event.data.users);
  }
});
// Initialize followingMap first
let followingData = [];
window.addEventListener("message", function (event) {
  if (event.data.type === "updateFollowStats") {
    followingData = event.data.following;
  }
});

function renderUsersToFollow(users) {
  const section = document.getElementById("follower-section");
  section.innerHTML = "";

  users.forEach((user) => {
    const isFollowing = followingData.includes(user.id);
    const userDiv = document.createElement("div");
    userDiv.className = "user-item";
    userDiv.innerHTML = `
      <div class="user-info">
        <strong>${user.username}</strong>
        <p>${user.email}</p>
      </div>
      <button class="follow-btn" data-id="${user.id}" style="display: ${
      isFollowing ? "none" : "block"
    }">Follow</button>
      <button class="unfollow-btn" data-id="${user.id}" style="display: ${
      isFollowing ? "block" : "none"
    }">Unfollow</button>
    `;
    section.appendChild(userDiv);

    // Add click handlers right after element is added
    const followBtn = userDiv.querySelector(".follow-btn");
    const unfollowBtn = userDiv.querySelector(".unfollow-btn");

    followBtn.addEventListener("click", () => {
      const followingId = user.id;
      const currentUserId = localStorage.getItem("user_id");

      fetch(`https://${GetParentResourceName()}/followUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerId: currentUserId, followingId }),
      });

      fetchFollowStats();
    });

    unfollowBtn.addEventListener("click", () => {
      const followingId = user.id;
      const currentUserId = localStorage.getItem("user_id");

      fetch(`https://${GetParentResourceName()}/unfollowUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerId: currentUserId, followingId }),
      });

      fetchFollowStats();
    });
  });
}

window.addEventListener("message", function (event) {
  if (event.data.type === "updateFollowStats") {
    document.getElementById("followers-count").innerText =
      event.data.followers.length;
    document.getElementById("following-count").innerText =
      event.data.following.length;
  }
});

function fetchFollowStats() {
  const currentUserId = localStorage.getItem("user_id");

  fetch(`https://${GetParentResourceName()}/getFollowData`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: currentUserId }),
  })
    .then((res) => res.json())
    .then((data) => {
      // This is where we need to process the data
    })
    .catch((error) => {
      console.error("Error fetching follow stats:", error);
    });
}

fetchFollowStats();

window.addEventListener("message", function (event) {
  if (event.data.type === "Mob-info") {
    document.getElementById("ph-num").innerText = event.data.data.phone;
    document.getElementById("sr-num").innerText = event.data.data.serialNumber;
    document.getElementById("serial").innerText = event.data.data.serialNumber;
  }
});

const wallpapers = [
  {
    wallpaper: "./images/wallpaper-1.jpg",
    name: "Palm",
  },
  {
    wallpaper: "./images/wallpaper-2.jpg",
    name: "galaxy",
  },
  {
    wallpaper: "./images/iphone-wall-paper.jpg",
    name: "default",
  },
];

showWallpapers(wallpapers);

function showWallpapers(param) {
  const wallpapersDiv = document.getElementById("inner-Wp");
  param.forEach((item) => {
    const img = document.createElement("img");
    img.src = item.wallpaper;
    img.style.width = "100%";
    img.style.cursor = "pointer";
    img.style.borderRadius = "10px";
    img.addEventListener("click", () => {
      localStorage.setItem("selectedWallpaper", item.wallpaper);
      document.getElementById("wallpapers").style.bottom = "-500px";
      showToast("Wallpaper Updated");
      document.getElementById(
        "subDiv"
      ).style.backgroundImage = `url(${item.wallpaper})`;
      document.getElementById("bg-name").innerText = item.name;
    });
    wallpapersDiv.appendChild(img);
  });
}
window.addEventListener("DOMContentLoaded", () => {
  const wallP = localStorage.getItem("selectedWallpaper");
  if (wallP) {
    document.getElementById("subDiv").style.backgroundImage = `url(${wallP})`;
  }
});
const wallP = localStorage.getItem("selectedWallpaper");
function openBrightness() {
  document.getElementById("set-brightness").style.bottom = "0px";
}

document.getElementById("bright-slid").addEventListener("click", function () {
  document.getElementById("set-brightness").style.bottom = "-400px";
});
function openSound() {
  document.getElementById("set-volume").style.bottom = "0px";
}

document.getElementById("vol-slid").addEventListener("click", function () {
  document.getElementById("set-volume").style.bottom = "-400px";
});
function openWallPaperModal() {
  document.getElementById("wallpapers").style.bottom = "0px";
}

document.getElementById("top-slider").addEventListener("click", function () {
  document.getElementById("wallpapers").style.bottom = "-500px";
});
function openAbout() {
  document.getElementById("set-about").classList.add("active");
}
function goBackSettings() {
  document.getElementById("set-about").classList.remove("active");
  document.getElementById("set-security").classList.remove("active");
}
function goBackSecurity() {
  document.getElementById("container-pad").classList.remove("active");
}
function openSecurity() {
  document.getElementById("set-security").classList.add("active");
}
function openDialPad() {
  document.getElementById("container-pad").classList.add("active");
}

function openAvatarModal() {
  document.getElementById("avatar-modal").style.display = "flex";
}
function closeAvatarModal() {
  document.getElementById("avatar-modal").style.display = "none";
}

function updateAvatar() {
  var inputValue = document.getElementById("update-avatar-inp").value;
  if (inputValue.trim() === "") {
    return showToast("Please Fill the Field");
  }
  fetch(`https://${GetParentResourceName()}/updateAvatar`, {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({
      avatar: inputValue,
    }),
  });
  document.getElementById("avatar-modal").style.display = "none";
}
window.addEventListener("message", function (event) {
  if (event.data.type === "ReceiveMyDetails") {
    document.getElementById("avatar").src = event.data.data.avatar;
    document.getElementById("username").innerText = event.data.data.username;
    document.getElementById("name-ab").innerText = event.data.data.username;
    document.getElementById("citizenId").innerText = event.data.data.citizen_id;
  }
});
const toggleSwitch = document.getElementById("toggleSwitch");

toggleSwitch.addEventListener("change", function () {
  if (this.checked) {
    console.log("Toggle ON");
    // koi aur action ya fetch trigger yahan likho
  } else {
    console.log("Toggle OFF");
  }
});
const toggleSwitchTheme = document.getElementById("toggleSwitchThemes");

// ✅ Check localStorage on page load
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.documentElement.setAttribute("data-theme", "dark");
  toggleSwitchTheme.checked = true; // ✅ Keep toggle ON
} else {
  document.documentElement.removeAttribute("data-theme");
  toggleSwitchTheme.checked = false; // ✅ Keep toggle OFF
}

// ✅ Listen for toggle changes
toggleSwitchTheme.addEventListener("change", function () {
  if (this.checked) {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("theme", "light");
  }
});

const slider = document.getElementById("brightnessSlider");
const fill = document.getElementById("brightnessFill");
const thumb = document.getElementById("thumb");
const container = document.getElementById("subDiv");
const bot_Nav = document.getElementById("b-nav");

// Load saved brightness on page load
window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("brightnessPercent");
  if (saved !== null) {
    const percent = parseFloat(saved);
    fill.style.width = `${percent * 100}%`;
    container.style.filter = `brightness(${0.5 + percent * 0.5})`;
  }
});

slider.addEventListener("click", function (e) {
  const rect = slider.getBoundingClientRect();
  const x = e.clientX - rect.left;
  let percent = x / rect.width;
  percent = Math.max(0, Math.min(1, percent));

  fill.style.width = `${percent * 100}%`;

  // Apply brightness
  container.style.filter = `brightness(${0.5 + percent * 0.5})`;

  // Save
  localStorage.setItem("brightnessPercent", percent.toString());
});

// Load saved volume on page load
window.addEventListener("DOMContentLoaded", () => {
  const savedVolume = localStorage.getItem("volumePercent");
  if (savedVolume !== null) {
    const percent = parseFloat(savedVolume);
    document.getElementById("volumeFill").style.width = `${percent * 100}%`;

    // Optional: Apply to volume element or console
  }
});

const volumeSlider = document.getElementById("customVolumeSlider");
const volumeFill = document.getElementById("customVolumeFill");

volumeSlider.addEventListener("click", function (e) {
  const rect = volumeSlider.getBoundingClientRect();
  const x = e.clientX - rect.left;
  let percent = x / rect.width;
  percent = Math.max(0, Math.min(1, percent));

  volumeFill.style.width = `${percent * 100}%`;

  // Optional: Set actual audio volume or log

  // Save to localStorage
  localStorage.setItem("volumePercent", percent.toString());
});

//password setting
function addDigit(digit) {
  const input = document.getElementById("pass-input");
  if (input.value.length < 6) {
    input.value += digit;
  }
}

function clearDigit() {
  const input = document.getElementById("pass-input");
  input.value = input.value.slice(0, -1);
}

// Function to handle saving the password
function submitPassword() {
  const password = document.getElementById("pass-input").value;
  showToast("Password Updated");
  localStorage.setItem("savedpassword", password);

  // Clear input field after a short delay
  setTimeout(() => {
    document.getElementById("pass-input").value = "";
  }, 1000);

  // Update the UI with the new password immediately
  updatePasswordUI();
}

// Function to handle updating the UI with the current password from localStorage
function updatePasswordUI() {
  const savedPassword = localStorage.getItem("savedpassword");
  const savedPasswordContainer = document.getElementById("saved-password");
  const openDialBtn = document.getElementById("open-dial-pad");

  if (savedPassword) {
    const hashedPassword = savedPassword.replace(/./g, "•"); // Mask the password with dots
    openDialBtn.style.display = "none"; // Hide the dial button once password is saved
    savedPasswordContainer.innerHTML = `
      <ul>
        <li>
          <p>${hashedPassword}</p>
          <button id="delete-password" onclick="deletePassword()">Delete</button>
        </li>
      </ul>
    `; // Display the masked password
  } else {
    openDialBtn.style.display = "flex"; // Show the dial button if no password is saved
  }
}

// Function to handle deleting the password
function deletePassword() {
  // Remove the password from localStorage
  localStorage.removeItem("savedpassword");

  // Reset the display to show no password
  updatePasswordUI();
}

// Event listener for opening the dial pad (shows or hides the password and delete button)
document.getElementById("open-dial-pad").addEventListener("click", function () {
  updatePasswordUI(); // Ensure the password is fetched and displayed in real-time when opening the dial pad
});

// Initial check on page load to display the password if it exists in localStorage
window.addEventListener("DOMContentLoaded", function () {
  updatePasswordUI(); // Update the UI immediately when the page loads
});

//password setting

function showToast(params) {
  var toastMessage = document.getElementById("toast");
  toastMessage.style.right = "0px";
  toastMessage.innerHTML = params;
  setTimeout(() => {
    toastMessage.style.right = "-300px";
  }, 2000);
}

function SwitchYoutubeTab(div) {
  if (div === "upload") {
    document.getElementById("upload").style.display = "block";
    document.getElementById("video").style.display = "none";
    document.getElementById("video").style.display = "none";
    document.getElementById("myVideos").style.display = "none";
    document.getElementById("myvid-btn").classList.remove("active");
    document.getElementById("up-btn").classList.add("active");
    document.getElementById("vid-btn").classList.remove("active");
  } else if (div === "videos") {
    document.getElementById("video").style.display = "flex";
    document.getElementById("upload").style.display = "none"; // <-- Fixed this line
    document.getElementById("myVideos").style.display = "none";
    document.getElementById("myvid-btn").classList.remove("active");
    document.getElementById("up-btn").classList.remove("active");
    document.getElementById("vid-btn").classList.add("active");
  } else if (div === "myVideos") {
    document.getElementById("video").style.display = "none";
    document.getElementById("upload").style.display = "none"; // <-- Fixed this line
    document.getElementById("myVideos").style.display = "flex";
    document.getElementById("myvid-btn").classList.add("active");
    document.getElementById("up-btn").classList.remove("active");
    document.getElementById("vid-btn").classList.remove("active");
    fetch(`https://${GetParentResourceName()}/getMyVideo`, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({}),
    });
  }
}

document.getElementById("openUploadModal").addEventListener("click", () => {
  document.getElementById("uploadModal").style.display = "flex";
});

function closeUploadModal() {
  document.getElementById("uploadModal").style.display = "none";
}

function uploadYoutubeLink() {
  const youtubeLink = document.getElementById("youtubeInput").value;
  const captionLink = document.getElementById("captionInput").value;

  fetch(`https://${GetParentResourceName()}/sendYoutubeVideo`, {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({
      videoLink: youtubeLink,
      caption: captionLink,
    }),
  });

  // Clear inputs
  document.getElementById("youtubeInput").value = "";
  document.getElementById("captionInput").value = "";
  // Close modal
  closeUploadModal();
}

function searchYoutubeVideo() {
  var searchQuery = document.getElementById("youtube-search").value;
  if (searchQuery.trim() === "") {
    return;
  }
  fetch(`https://${GetParentResourceName()}/youtube:search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify(searchQuery), // 👈 user input sent to server
  });
}
window.addEventListener("message", function (event) {
  if (event.data.type === "YoutubeVideosResults") {
    var data = event.data.data;
    var VideoFeed = document.getElementById("all-videos");

    // Clear previous results
    VideoFeed.innerHTML = "";

    // Check if there is no data
    if (!data || data.length === 0) {
      var noVideosMessage = document.createElement("p");
      noVideosMessage.classList.add("not-found");
      noVideosMessage.textContent = "No videos found";
      VideoFeed.appendChild(noVideosMessage);
      return; // Exit the function early if no data
    }

    // Process and display videos
    data.forEach((element) => {
      var div = document.createElement("div");
      div.classList.add("video-box"); // optional: for styling
      div.addEventListener("click", function () {
        OpenVideo(element); // ya koi custom function bhi call kar sakte ho
      });

      // Create iframe - Fix the src attribute
      var iframe = document.createElement("iframe");
      // Make sure the YouTube link is properly formatted for embedding
      if (element.youtube_link) {
        // Handle different YouTube URL formats
        var videoId = extractYouTubeVideoId(element.youtube_link);
        if (videoId) {
          iframe.src = "https://www.youtube.com/embed/" + videoId;
        } else {
          // Fallback if unable to extract video ID
          iframe.src = element.youtube_link;
        }
      }
      iframe.width = "100%";
      iframe.height = "200";
      iframe.frameBorder = "0";
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      var time = getTimeAgo(element.created_at);
      var txtBody = document.createElement("div");
      var caption = document.createElement("p");
      caption.textContent = element.caption_link;
      var timeStamps = document.createElement("p");
      timeStamps.classList.add("time-ago");
      timeStamps.textContent = time;
      txtBody.appendChild(caption);
      txtBody.appendChild(timeStamps);
      div.appendChild(iframe);
      div.appendChild(txtBody);
      VideoFeed.appendChild(div);
    });
  }
});

// Helper function to extract YouTube video ID from various URL formats
function extractYouTubeVideoId(url) {
  if (!url) return null;

  // Handle standard YouTube URLs
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  return match && match[2].length === 11 ? match[2] : null;
}

function OpenVideo(element) {
  var videoContainer = document.getElementById("video-play");
  videoContainer.style.display = "block";
  var video = document.getElementById("iframe-youtube-video");
  var time = document.getElementById("youtube-time");
  var timeAgo = getTimeAgo(element.created_at);
  time.innerText = timeAgo;
  var caption = document.getElementById("youtube-caption");
  var videoId = extractYouTubeVideoId(element.youtube_link);
  if (videoId) {
    video.src = "https://www.youtube.com/embed/" + videoId;
  }
  caption.innerText = element.caption_link;
}

document.getElementById("back-youtube").addEventListener("click", function () {
  var videoContainer = document.getElementById("video-play");
  videoContainer.style.display = "none";
});

window.addEventListener("message", function (event) {
  if (event.data.type === "myYoutubeVideosResults") {
    const data = event.data.data;
    const VideoFeed = document.getElementById("all-myVideos");

    VideoFeed.innerHTML = "";

    if (!data || data.length === 0) {
      const noVideosMessage = document.createElement("p");
      noVideosMessage.classList.add("not-found");
      noVideosMessage.textContent = "No videos found";
      VideoFeed.appendChild(noVideosMessage);
      return;
    }

    data.forEach((element) => {
      const div = document.createElement("div");
      div.classList.add("video-box");
      div.addEventListener("click", () => OpenVideo(element));

      const iframe = document.createElement("iframe");
      if (element.youtube_link) {
        const videoId = extractYouTubeVideoId(element.youtube_link);
        iframe.src = videoId
          ? `https://www.youtube.com/embed/${videoId}`
          : element.youtube_link;
      }

      iframe.width = "100%";
      iframe.height = "200";
      iframe.frameBorder = "0";
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;

      const txtBody = document.createElement("div");
      txtBody.classList.add("tsxtDiv");

      const caption = document.createElement("p");
      caption.textContent = element.caption_link;

      const timeStamps = document.createElement("p");
      timeStamps.classList.add("time-ago");
      timeStamps.textContent = getTimeAgo(element.created_at);

      const Delete = document.createElement("span");
      Delete.innerText = "⋮";
      Delete.style.cursor = "pointer";

      Delete.addEventListener("click", (e) => {
        e.stopPropagation();
        showDeleteModal(element.id);
      });

      txtBody.appendChild(Delete);
      txtBody.appendChild(caption);
      txtBody.appendChild(timeStamps);

      div.appendChild(iframe);
      div.appendChild(txtBody);
      VideoFeed.appendChild(div);
    });
  }
});

function showDeleteModal(videoId) {
  const existingModal = document.querySelector(".delete-modal-container");
  if (existingModal) existingModal.remove();
  const mondalContain = document.getElementById("my-upload-video");
  const modalContainer = document.createElement("div");
  modalContainer.classList.add("delete-modal-container");

  modalContainer.innerHTML = `
    <div class="delete-modal">
      <p>Are you sure you want to delete this video?</p>
      <button class="delete-confirm">Delete</button>
      <button class="delete-cancel">Cancel</button>
    </div>
  `;

  mondalContain.appendChild(modalContainer);

  modalContainer
    .querySelector(".delete-confirm")
    .addEventListener("click", () => {
      fetch(`https://${GetParentResourceName()}/deleteVideo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({ videoId }),
      });
      fetch(`https://${GetParentResourceName()}/getMyVideo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({}),
      });

      modalContainer.remove();
    });

  modalContainer
    .querySelector(".delete-cancel")
    .addEventListener("click", () => {
      modalContainer.remove();
    });

  document.addEventListener("click", function handler(e) {
    if (!modalContainer.contains(e.target)) {
      modalContainer.remove();
      document.removeEventListener("click", handler);
    }
  });
}

///installing app
function installAppWithLoading(appName, imgSrc, appDataName) {
  const installButton = event.target;
  installButton.disabled = true;
  installButton.innerText = "Installing...";

  setTimeout(() => {
    addAppToHomeScreen(appName, imgSrc, appDataName);

    installButton.innerText = "Installed";
    installButton.style.backgroundColor = "gray"; // Change button color
  }, 2000);
}

function addAppToHomeScreen(appName, imgSrc, appDataName) {
  const appScreens = document.querySelectorAll(".app-screen");
  const firstScreen = appScreens[0]; // Add to the first screen
  const appsWrapper = document.querySelector(".apps-wrapper");
  const screenIndicators = document.querySelector(".screen-indicators");

  const newApp = document.createElement("div");
  newApp.classList.add("app-ic");
  newApp.setAttribute("draggable", "true");
  newApp.setAttribute("data-app", appDataName);

  newApp.innerHTML = `
    <span class="delete-icon">×</span>
    <button>
      <img src="${imgSrc}" alt="${appName}" />
    </button>
    <p>${appName}</p>
  `;

  firstScreen.appendChild(newApp); // Corrected line

  newApp.addEventListener("click", function (e) {
    if (window.isEditMode || e.target.closest(".delete-icon")) return;
    const clickedAppName = this.getAttribute("data-app");
    const clickedAppTitleText =
      this.querySelector("p")?.textContent || "Unknown App";
    openApp(clickedAppName, clickedAppTitleText);
  });

  saveAppsToStorage(appName, imgSrc, appDataName);
}

function saveAppsToStorage(appName, imgSrc, appDataName) {
  let apps = JSON.parse(localStorage.getItem("installedApps")) || [];
  const alreadyInstalled = apps.some((app) => app.dataApp === appDataName);

  if (!alreadyInstalled) {
    apps.push({ name: appName, img: imgSrc, dataApp: appDataName });
    localStorage.setItem("installedApps", JSON.stringify(apps));
  }
}

function loadAppsFromStorage() {
  const storedApps = JSON.parse(localStorage.getItem("installedApps"));

  if (storedApps && Array.isArray(storedApps)) {
    storedApps.forEach((app) => {
      addAppToHomeScreen(app.name, app.img, app.dataApp);
    });
  }
}

function updateInstalledButtons() {
  const storedApps = JSON.parse(localStorage.getItem("installedApps")) || [];
  const installedAppNames = storedApps.map((app) => app.dataApp);

  document.querySelectorAll(".store-app-info button").forEach((button) => {
    const appKey = button.getAttribute("data-app");

    if (installedAppNames.includes(appKey)) {
      button.innerText = "Installed";
      button.disabled = true;
      button.style.backgroundColor = "gray";
    }
  });
}

// // Jab page load ho to already installed apps dikh jayein
document.addEventListener("DOMContentLoaded", () => {
  updateInstalledButtons();
  loadAppsFromStorage();
});

function handleAppClick(event, appName, imgSrc, appDataName) {
  // Agar user ne button pe click nahi kiya

  if (!event.target.closest("button")) {
    openPreviewModal(appName, imgSrc, appDataName);
  }
}
const appPreviews = {
  spotify: [
    "./images/spotify.png",
    "./images/spotify_1.webp",
    "./images/spotify_2.webp",
  ],
  facebook: [
    "./images/facebook.png",
    "./images/facebook_1.webp",
    "./images/facebook_2.webp",
  ],
  tiktok: [
    "./images/tiktok.png",
    "./images/tiktok_1.webp",
    "./images/tiktok_2.webp",
  ],
  twitter: [
    "./images/twitter.png",
    "./images/twitter_1.webp",
    "./images/twitter_2.webp",
  ],
};
function openPreviewModal(appName, imgSrc, appDataName) {
  document.getElementById("previewMainImage").src = imgSrc;
  document.getElementById("previewAppTitle").innerText = appName;

  const gallery = document.getElementById("previewGallery");
  gallery.innerHTML = "";

  const screenshots = appPreviews[appDataName] || [imgSrc];
  screenshots.forEach((src) => {
    const galleryContainer = document.createElement("div");
    galleryContainer.classList.add("galleryContainer");

    const img = document.createElement("img");
    img.src = src;

    galleryContainer.appendChild(img);
    gallery.appendChild(galleryContainer);
  });
  const btn = document.getElementById("previewInstallBtn");
  const installedApps = JSON.parse(localStorage.getItem("installedApps")) || [];
  const isInstalled = installedApps.some((app) => app.dataApp === appDataName);

  if (isInstalled) {
    btn.innerText = "Installed";
    btn.disabled = true;
    btn.style.backgroundColor = "gray";
  } else {
    btn.innerText = "Install";
    btn.disabled = false;
    btn.onclick = () => {
      installAppWithLoading(appName, imgSrc, appDataName);
      closePreviewModal();
    };
  }

  document.getElementById("appPreviewModal").style.transform = "translateX(0)";
}

function closePreviewModal() {
  document.getElementById("appPreviewModal").style.transform =
    "translateX(-300px)";
}
///installing app
