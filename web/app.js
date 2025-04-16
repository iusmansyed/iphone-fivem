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
  // Get all UI elements
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
          // Hide language selection
          languageSelection.style.display = "none";

          // 3. GREETING SCREEN
          greeting.style.display = "flex";

          // Set token in localStorage
          localStorage.setItem("key", "stored");

          // Setup greeting animation
          greetingText.style.opacity = "0";
          greetingText.style.transform = "translateY(20px)";
          greetingText.style.transition = "opacity 1s ease, transform 1s ease";
          greetingText.innerText = translations[selectedLanguage].heading;

          // Animate greeting
          setTimeout(() => {
            greetingText.style.opacity = "1";
            greetingText.style.transform = "translateY(0)";
          }, 100);

          // Hide greeting after 3 seconds & show lock screen
          setTimeout(() => {
            greeting.style.display = "none";
            lockScreen.style.display = "flex";
          }, 3000);

          console.log("Selected language:", selectedLanguage);
        } else {
          console.log("Please select a language to continue");
        }
      });
  } else {
    // TOKEN EXISTS: Skip to lock screen directly
    startupScreen.style.display = "none";
    lockScreen.style.display = "flex";

    // Set appropriate styles for lock screen
    if (apps.style.display == "flex") {
      clock.style.color = "white";
    }
  }

  // Common functionality regardless of token status

  // Lock screen unlock functionality
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
  const instabackButton = appContainer.querySelector(".insta-back-button");
  const header = document.getElementById("hder");
  // Get all app content divs
  const phoneApp = document.querySelector(".phones");
  const safariApp = document.querySelector(".safari");
  const messagesApp = document.querySelector(".messages");
  const musicApp = document.querySelector(".musics");
  const mapsApp = document.querySelector(".maps");
  const instagramApp = document.querySelector(".instagram");
  const whatsApp = document.querySelector(".whatsapp");
  const snapchatApp = document.querySelector(".snapchat");

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
  ];

  // Handle app clicks
  document.querySelectorAll(".app-ic").forEach((app) => {
    app.addEventListener("click", function (e) {
      if (isEditMode || e.target.closest(".delete-icon")) return;

      const appName = this.getAttribute("data-app");
      const appTitleText = this.querySelector("p").textContent;
      openApp(appName, appTitleText);
    });
  });

  // Handle back button
  backButton.addEventListener("click", closeApp);
  instabackButton.addEventListener("click", closeApp);

  function openApp(appName, title) {
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
      case "whatsapp":
        if (whatsApp) whatsApp.style.display = "block";
        break;
      default:
        // If no matching app, show default content
        appContent.innerHTML =
          '<div style="padding: 20px;">App content not available</div>';
        break;
    }

    // if (appName === "maps") {
    //   header.style.display = "none";
    // }else{
    //   header.style.display = "flex";
    // }
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

      // Hide all app content divs when closing
      allAppDivs.forEach((div) => {
        if (div) div.style.display = "none";
      });
    }, 300);
  }
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
    menu.style.top = "-602px";
  });
});

function toggleActive(element) {
  element.classList.toggle("active");
}

function setupSlider(sliderId, fillId, cssProperty, minValue, maxValue) {
  const slider = document.getElementById(sliderId);
  const fill = document.getElementById(fillId);
  slider.addEventListener("click", function (e) {
    let rect = slider.getBoundingClientRect();
    let percent = 1 - (e.clientY - rect.top) / rect.height;
    percent = Math.max(0, Math.min(1, percent)); // Clamp between 0 and 1
    let value = minValue + percent * (maxValue - minValue);
    fill.style.height = `${percent * 100}%`;
    if (cssProperty === "brightness") {
      document.getElementById("subDiv").style.filter = `brightness(${value}%)`;
    } else if (cssProperty === "volume") {
      console.log("Volume set to:", value);
    }
  });
}

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

function updateFavoritesList(contacts) {
  const favSection = document.querySelector("#favSection .phone-tab ul");
  if (favSection && contacts.length > 0) {
    favSection.innerHTML = contacts
      .map(
        (contact) =>
          `<li class="contact-item" onclick="call()">⭐ ${contact.username} - ${contact.phone}</li>`
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
const contacts = [
  {
    name: "John Doe",
    time: "5 mins ago",
    img: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    name: "Jane Smith",
    time: "Yesterday",
    img: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  {
    name: "Michael Brown",
    time: "2 days ago",
    img: "https://randomuser.me/api/portraits/men/3.jpg",
  },
  {
    name: "Emily Davis",
    time: "Last seen at 11:45 AM",
    img: "https://randomuser.me/api/portraits/women/4.jpg",
  },
];

// ❌ Incorrect: document.getElementById("whatapp-contactList") ❌
// ✅ Correct:
const contactList = document.getElementById("contactList"); // Fixed ID
const chatPage = document.getElementById("chatPage");
const chatBox = document.getElementById("chatBox");
const chatName = document.getElementById("chatNameWhatsapp"); // Fixed ID
const chatImg = document.getElementById("chatImg");
const messageInput = document.getElementById("messageInput");
const whatappBottom = document.getElementById("whatappBottom");
const hder = document.getElementById("hder");

// ✅ Check if contactList exists before appending elements
if (contactList) {
  contacts.forEach((contact) => {
    const contactDiv = document.createElement("div");
    contactDiv.classList.add("whatapp-contact");
    contactDiv.innerHTML = `
        <img src="${contact.img}" alt="${contact.name}">
        <div class="whatapp-contact-info">
            <div class="whatapp-contact-name">${contact.name}</div>
            <div class="whatapp-contact-time">${contact.time}</div>
        </div>
    `;

    contactDiv.addEventListener("click", () => openWhatsAppChat(contact));
    contactList.appendChild(contactDiv);
  });
} else {
  console.error("❌ contactList element not found!");
}
function loadNavigate(page) {
  const pages = ["contactList", "statusPage"];
  const chatButton = document.querySelector(
    "#whatappBottom button:nth-child(1)"
  );
  const statusButton = document.querySelector(
    "#whatappBottom button:nth-child(2)"
  );

  // Hide all pages
  pages.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.classList.add("whatapp-hidden");
    }
  });

  // Show selected page
  const targetPage = document.getElementById(page);
  if (targetPage) {
    targetPage.classList.remove("whatapp-hidden");
  }

  // Change button colors based on selection
  if (page === "contactList") {
    chatButton.style.color = "white";
    statusButton.style.color = "#ccc";
  } else if (page === "statusPage") {
    chatButton.style.color = "#ccc";
    statusButton.style.color = "white";
  }
}

// ✅ Open Chat Function
function openWhatsAppChat(contact) {
  console.log("Opening chat with:", contact.name);
  whatappBottom.style.display = "none"; // Show chat input
  hder.style.display = "none"; // Show chat input
  contactList.classList.add("whatapp-hidden");
  chatPage.classList.remove("whatapp-hidden");

  chatName.innerText = contact.name;
  chatImg.src = contact.img;

  chatBox.innerHTML = ""; // Clear previous messages
  addMessage("Hello! How are you?", "whatapp-received");
}

// ✅ Send Message Function
function sendMessage() {
  const message = messageInput.value.trim();
  if (message) {
    addMessage(message, "whatapp-sent");
    messageInput.value = "";
  }
}

// ✅ Add Message to Chat
function addMessage(text, type) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("whatapp-message", type);
  messageDiv.innerText = text;
  chatBox.appendChild(messageDiv);

  chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll
}

// ✅ Go Back to Contact List
function goBackWhatsapp() {
  chatPage.classList.add("whatapp-hidden");
  contactList.classList.remove("whatapp-hidden");
  whatappBottom.style.display = "flex"; // Show chat input
  hder.style.display = "block"; // Show chat input
}
// Instagram App Functionality

// Story and Feed Data (from your existing code)
const storyData = [
  {
    id: 1,
    username: "User 1",
    image: "https://randomuser.me/api/portraits/men/1.jpg",
    stories: [
      {
        type: "image",
        content: "https://randomuser.me/api/portraits/men/10.jpg",
        duration: 15000,
      },
      {
        type: "image",
        content: "https://randomuser.me/api/portraits/men/11.jpg",
        duration: 15000,
      },
    ],
  },
  {
    id: 2,
    username: "User 2",
    image: "https://randomuser.me/api/portraits/women/2.jpg",
    stories: [
      {
        type: "image",
        content: "https://randomuser.me/api/portraits/women/10.jpg",
        duration: 15000,
      },
      {
        type: "image",
        content: "https://randomuser.me/api/portraits/women/11.jpg",
        duration: 15000,
      },
    ],
  },
  // ... other existing story entries
];

const feedData = [
  {
    id: 1,
    username: "travel_enthusiast",
    userImage: "https://randomuser.me/api/portraits/women/12.jpg",
    postImage: "https://randomuser.me/api/portraits/men/1.jpg",
    likes: 1243,
    caption: "Exploring new horizons! 🌄 #travel #adventure",
    comments: 42,
  },
  {
    id: 2,
    username: "foodie_central",
    userImage: "https://randomuser.me/api/portraits/men/22.jpg",
    postImage: "https://randomuser.me/api/portraits/men/1.jpg",
    likes: 892,
    caption: "Today's special dish! 🍕 #foodgram #delicious",
    comments: 29,
  },
  {
    id: 3,
    username: "fitness_guru",
    userImage: "https://randomuser.me/api/portraits/women/33.jpg",
    postImage: "https://randomuser.me/api/portraits/men/1.jpg",
    likes: 1537,
    caption: "No pain, no gain! 💪 #workout #fitnessmotivation",
    comments: 76,
  },
];

// Function to render stories
function renderStories() {
  const storySection = document.getElementById("story-section");

  // Clear any existing content
  storySection.innerHTML = "";

  const storiesContainer = document.createElement("div");
  storiesContainer.className = "stories";

  storyData.forEach((story) => {
    const storyElement = document.createElement("div");
    storyElement.className = "story";
    storyElement.onclick = () => viewStory(story.id);

    storyElement.innerHTML = `
      <img src="${story.image}" alt="${story.username}'s story">
      <p>${story.username}</p>
    `;

    storiesContainer.appendChild(storyElement);
  });

  storySection.appendChild(storiesContainer);
}

function viewStory(storyId) {
  const story = storyData.find((story) => story.id === storyId);
  if (!story || !story.stories || story.stories.length === 0) {
    console.error("No stories found for this user");
    return;
  }

  // Remove any existing story viewer first
  const existingViewer = document.querySelector(".story-viewer");
  if (existingViewer) {
    existingViewer.remove();
  }

  const frame = document.getElementById("frame");

  // Create story viewer container
  const storyViewer = document.createElement("div");
  storyViewer.className = "story-viewer";
  storyViewer.innerHTML = `
    <div class="story-progress-container">
      ${story.stories
        .map(
          () => `
        <div class="story-progress-bar">
          <div class="story-progress-bar-fill"></div>
        </div>
      `
        )
        .join("")}
    </div>
    <div class="story-header">
      <img src="https://randomuser.me/api/portraits/men/${storyId}.jpg" class="story-user-avatar" />
      <div class="story-username">${story.username}</div>
      <button class="close-story-btn">×</button>
    </div>
    <div class="story-content-container">
      <img class="story-content" />
      <div class="story-navigation">
        <div class="story-nav-prev"></div>
        <div class="story-nav-next"></div>
      </div>
    </div>
  `;

  // Append to frame
  frame.appendChild(storyViewer);

  const storyContentImg = storyViewer.querySelector(".story-content");
  const progressBars = storyViewer.querySelectorAll(".story-progress-bar-fill");
  const closeBtn = storyViewer.querySelector(".close-story-btn");
  const prevNav = storyViewer.querySelector(".story-nav-prev");
  const nextNav = storyViewer.querySelector(".story-nav-next");

  let currentStoryIndex = 0;
  let autoAdvanceTimeout = null;

  function showStory(index) {
    if (index < 0 || index >= story.stories.length) return;

    // Clear any existing timeout
    if (autoAdvanceTimeout) {
      clearTimeout(autoAdvanceTimeout);
    }

    currentStoryIndex = index;
    const currentStory = story.stories[index];

    // Reset all progress bars
    progressBars.forEach((bar, i) => {
      if (i < index) {
        bar.style.width = "100%";
      } else if (i === index) {
        bar.style.width = "0%";
        // Animate current progress bar
        bar.style.width = "100%";
        bar.style.transition = `width ${currentStory.duration}ms linear`;
      } else {
        bar.style.width = "0%";
        bar.style.transition = "none";
      }
    });

    // Show current story
    storyContentImg.src = currentStory.content;

    // Start auto-advance timer
    startAutoAdvance();
  }

  // Navigation handlers
  prevNav.addEventListener("click", () => {
    if (currentStoryIndex > 0) {
      showStory(currentStoryIndex - 1);
    }
  });

  nextNav.addEventListener("click", () => {
    if (currentStoryIndex < story.stories.length - 1) {
      showStory(currentStoryIndex + 1);
    } else {
      closeStoryViewer();
    }
  });

  function closeStoryViewer() {
    // Clear any existing timeout
    if (autoAdvanceTimeout) {
      clearTimeout(autoAdvanceTimeout);
    }

    // Remove the story viewer if it exists
    if (storyViewer && storyViewer.parentNode) {
      storyViewer.parentNode.removeChild(storyViewer);
    }
  }

  // Close button handler
  closeBtn.addEventListener("click", closeStoryViewer);

  // Start with first story
  showStory(0);

  // Auto-advance timer
  function startAutoAdvance() {
    const currentStory = story.stories[currentStoryIndex];
    autoAdvanceTimeout = setTimeout(() => {
      if (currentStoryIndex < story.stories.length - 1) {
        showStory(currentStoryIndex + 1);
      } else {
        closeStoryViewer();
      }
    }, currentStory.duration);
  }
}

// Function to render feed posts
function renderFeed() {
  const feedSection = document.getElementById("feed-section");

  // Clear any existing content
  feedSection.innerHTML = "";

  feedData.forEach((post) => {
    const postElement = document.createElement("div");
    postElement.className = "post";

    postElement.innerHTML = `
      <div class="post-header">
        <img src="${post.userImage}" alt="${post.username}">
        <span class="username">${post.username}</span>
      </div>
      <img src="${post.postImage}" alt="Post by ${
      post.username
    }" class="post-image">
      <div class="post-actions">
        <div class="post-likes">
          <svg class="like-icon" onclick="toggleLike(this)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path fill="currentColor" d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"/>
          </svg>
          <svg class="dislike-icon hidden" onclick="toggleLike(this)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path fill="red" d="M256 96l-12-12c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5l180.7 168.7c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84z"/>
          </svg>
          <span class="like-count">${post.likes.toLocaleString()} likes</span>
        </div>
        <div class="post-caption">
          <span class="username">${post.username}</span> ${post.caption}
        </div>
        <div class="post-comments">View all ${post.comments} comments</div>
      </div>
    `;

    feedSection.appendChild(postElement);
  });
}

// Function to handle story viewing

// Toggle like function
function toggleLike(icon) {
  const postLikes = icon.parentElement;
  const likeIcon = postLikes.querySelector(".like-icon");
  const dislikeIcon = postLikes.querySelector(".dislike-icon");
  const likeCount = postLikes.querySelector(".like-count");

  let currentLikes = parseInt(
    likeCount.innerText.split(" ")[0].replace(",", "")
  );

  if (likeIcon.classList.contains("hidden")) {
    // Switch to like
    likeIcon.classList.remove("hidden");
    dislikeIcon.classList.add("hidden");
    likeCount.innerText = `${(currentLikes - 1).toLocaleString()} likes`;
  } else {
    // Switch to dislike
    likeIcon.classList.add("hidden");
    dislikeIcon.classList.remove("hidden");
    likeCount.innerText = `${(currentLikes + 1).toLocaleString()} likes`;
  }
}

// Switch Instagram Tab Function

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
document.addEventListener("DOMContentLoaded", function () {
  renderStories();
  renderFeed();
});
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
      console.log("Received Event:", JSON.stringify(data)); // Debugging ke liye
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
    chatItem.setAttribute("onclick", `openChatTextUser('${contact.username}')`);

    const chatName = document.createElement("div");
    chatName.classList.add("chat-name");
    chatName.innerText = contact.username;

    const chatDetails = document.createElement("div");
    chatDetails.classList.add("chat-details");
    chatDetails.innerText = `+${contact.phone} • ${getRandomTime()}`;

    chatItem.appendChild(chatName);
    chatItem.appendChild(chatDetails);
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
    .then((data) => {
      console.log("Group Created:", data);
    })
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
function openChatTextUser(username) {
  selectedChatUser = username; // Store the selected user's name

  // Show the chat screen and hide other sections
  document.getElementById("chatScreen").style.display = "flex";
  document.getElementById("hder").style.display = "none";
  document.getElementById("messages-main").style.display = "none";

  // Update the chat header with the selected user's name
  document.getElementById("chatName").innerText = selectedChatUser;

  // Fetch messages for the selected user
  fetch(`https://${GetParentResourceName()}/getMessages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      receiver: selectedChatUser, // Pass the selected user's name to the server
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      // You can now process the 'data' to update the UI as needed
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

  // const messageList = document.getElementById("phoneMessageList");

  // // Show message instantly in UI (temporary)
  // const msgItem = document.createElement("div");
  // msgItem.classList.add("message-item", "sent"); // Since it's sent by you
  // msgItem.innerHTML = `${message}`;
  // messageList.appendChild(msgItem);
  // messageList.scrollTop = messageList.scrollHeight;

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
    // Optional: Show error message or remove the temporary message
  });
}

let lastMessageId = 0; // Track last message shown

window.addEventListener("message", function (event) {
  const data = event.data;

  if (data.type === "receiveMessages") {
    const messages = data.messages;
    const messageList = document.getElementById("phoneMessageList");
    const currentPlayer = data.name || "AsyncPc1";

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

// Close the chat screen (go back to contacts list or home screen)

// Add message to chat UI
// function addMessageToUI(msg) {
//   const chatBox = document.getElementById("chatBox");
//   const div = document.createElement("div");
//   div.innerHTML = `<strong>${msg.sender}:</strong> ${msg.message}`;
//   chatBox.appendChild(div);
// }

// When server sends previous or new messages
window.addEventListener("message", function (event) {
  if (event.data.action === "showMessages") {
    showMessages(event.data.messages);
  }
});

// function showMessages(messages) {
//   const chatBox = document.getElementById("chatBox");
//   chatBox.innerHTML = "";
//   messages.forEach((msg) => {
//     const msgDiv = document.createElement("div");
//     msgDiv.innerHTML = `<strong>${msg.sender}:</strong> ${msg.message}`;
//     chatBox.appendChild(msgDiv);
//   });
// }

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

function updateRecentsList() {
  const recentsSection = document.querySelector(
    "#recentsSection .phone-tab ul"
  );
  if (recentsSection && recentCalls.length > 0) {
    recentsSection.innerHTML = recentCalls
      .map((call) => {
        const timeAgo = getTimeAgo(new Date(call.timestamp));
        return `<li class="contact-item" onclick="dialNumber('${call.phone}')">
                <div class="recent-call-info">
                  <span class="recent-call-icon">📞</span>
                  <div class="recent-call-details">
                    <div class="recent-call-name">${call.name}</div>
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
      console.log("Creating group:", groupName);
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

  if (tab === "chat") {
    chatScreen.style.display = "block";
    groupSection.style.display = "none";
  } else if (tab === "groups") {
    chatScreen.style.display = "none";
    groupSection.style.display = "block";
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
        console.log(JSON.stringify(event.data.username));
        localStorage.setItem("userDetails", event.data.username);
        instagramAuth.style.display = "none";
        instagramMain.style.display = "block";
        renderStories();
        renderFeed();
      }
    }
  });
  instagramAuth.style.display = "none";
  instagramMain.style.display = "block";
  renderStories();
  renderFeed();
  var i = localStorage.getItem("userDetails");
  if (i) {
    instagramAuth.style.display = "none";
    instagramMain.style.display = "block";
    renderStories();
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

// ... existing code ...

// Add these functions after your existing Instagram-related functions

function openUploadSection() {
  document.getElementById("upload-post-section").style.display = "block";
  document.getElementById("upload-overlay").style.display = "block";
}

function closeUploadSection() {
  document.getElementById("upload-post-section").style.display = "none";
  document.getElementById("upload-overlay").style.display = "none";
  // Reset the form
  document.getElementById("link-input").value = "";
  document.getElementById("caption-input").value = "";
}

// Add event listener for the share button
document
  .getElementById("share-link-btn")
  .addEventListener("click", function () {
    const link = document.getElementById("link-input").value.trim();
    const caption = document.getElementById("caption-input").value.trim();

    if (!link) {
      alert("⚠️ Please paste a link.");
      return;
    }
    var i = localStorage.getItem("userDetails");
    // Send to Lua via NUI
    fetch(`https://${GetParentResourceName()}/uploadPost`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({
        username: i.username,
        image: link,
        caption: caption,
      }),
    });

    // Optionally reset the form
    document.getElementById("link-input").value = "";
    document.getElementById("caption-input").value = "";
  });
window.addEventListener("message", function (event) {
  if (event.data.type === "showPosts") {
    renderFeed(event.data.posts);
    console.log(JSON.stringify(event.data.posts), "<<<<<<<<<<<<<<<<<");
  }
});

function renderFeed(posts) {
  const feed = document.getElementById("instagram-feed");
  feed.innerHTML = "";

  posts.forEach((post) => {
    const postEl = document.createElement("div");
    postEl.className = "insta-post";
    postEl.innerHTML = `
          <div class="post-username">@${post.username}</div>
          <img src=${post.link} alt=""/>
          <p class="post-caption">${post.caption}</p>
          <small class="post-time">${post.date}</small>
          
          
      `;
    feed.appendChild(postEl);
  });

  // Like Button Click
  document.querySelectorAll(".like-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const username = localStorage.getItem("instagram_logged_in");
      fetch(`https://${GetParentResourceName()}/likePost`, {
        method: "POST",
        body: JSON.stringify({ id, username }),
        headers: { "Content-Type": "application/json" },
      });
    });
  });

  // Comment Button Click
  document.querySelectorAll(".comment-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const comment = document.querySelector(
        `.comment-input[data-id="${id}"]`
      ).value;
      const username = localStorage.getItem("instagram_logged_in");
      if (comment.trim() !== "") {
        fetch(`https://${GetParentResourceName()}/commentPost`, {
          method: "POST",
          body: JSON.stringify({ id, username, comment }),
          headers: { "Content-Type": "application/json" },
        });
      }
    });
  });
}
