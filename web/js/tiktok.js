function showGlobalAlert(message) {
  const alertContent = document.querySelector(".globalAlert");
  alertContent.innerText = message;
  alertContent.style.right = "0px";
  setTimeout(() => {
    alertContent.style.right = "-300px";
  }, 3000);
}

document.addEventListener("DOMContentLoaded", function () {
  const tiktokLoginForm = document.getElementById("tiktok-login-form");
  const tiktokSignupForm = document.getElementById("tiktok-signup-form");
  const tiktokFormTitle = document.getElementById("tiktok-form-title");
  const tiktokGoToSignup = document.getElementById("tiktok-go-to-signup");
  const tiktokGoToLogin = document.getElementById("tiktok-go-to-login");

  const tiktokLoginBtn = document.getElementById("tiktok-login-btn");
  const tiktokSignupBtn = document.getElementById("tiktok-signup-btn");

  const tiktokLoginEmail = document.getElementById("tiktok-login-email");
  const tiktokLoginPassword = document.getElementById("tiktok-login-password");

  const tiktokSignupUsername = document.getElementById(
    "tiktok-signup-username"
  );
  const tiktokSignupEmail = document.getElementById("tiktok-signup-email");
  const tiktokSignupPassword = document.getElementById(
    "tiktok-signup-password"
  );
  const tiktokSignupBirthday = document.getElementById(
    "tiktok-signup-birthday"
  );

  // Initially show login form
  tiktokSignupForm.classList.add("tiktok-active-form");

  // Switch to signup form
  tiktokGoToSignup.addEventListener("click", function (e) {
    e.preventDefault();
    tiktokLoginForm.classList.remove("tiktok-active-form");
    tiktokSignupForm.classList.add("tiktok-active-form");
    tiktokFormTitle.textContent = "Sign up for TikTok";
  });

  // Switch to login form
  tiktokGoToLogin.addEventListener("click", function (e) {
    e.preventDefault();
    tiktokSignupForm.classList.remove("tiktok-active-form");
    tiktokLoginForm.classList.add("tiktok-active-form");
    tiktokFormTitle.textContent = "Log in to TikTok";
  });

  // Back button functionality

  // Login form validation
  function validateLoginForm() {
    const isEmailValid = tiktokLoginEmail.value.trim() !== "";
    const isPasswordValid = tiktokLoginPassword.value.trim() !== "";

    tiktokLoginBtn.disabled = !(isEmailValid && isPasswordValid);
  }

  tiktokLoginEmail.addEventListener("input", validateLoginForm);
  tiktokLoginPassword.addEventListener("input", validateLoginForm);

  // Signup form validation
  function validateSignupForm() {
    const isUsernameValid = tiktokSignupUsername.value.trim() !== "";
    const isEmailValid =
      tiktokSignupEmail.value.trim() !== "" &&
      tiktokSignupEmail.value.includes("@");
    const isPasswordValid = tiktokSignupPassword.value.trim().length >= 6;
    const isBirthdayValid = tiktokSignupBirthday.value !== "";

    tiktokSignupBtn.disabled = !(
      isUsernameValid &&
      isEmailValid &&
      isPasswordValid &&
      isBirthdayValid
    );
  }

  tiktokSignupUsername.addEventListener("input", validateSignupForm);
  tiktokSignupEmail.addEventListener("input", validateSignupForm);
  tiktokSignupPassword.addEventListener("input", validateSignupForm);
  tiktokSignupBirthday.addEventListener("input", validateSignupForm);

  // Form submissions
  tiktokLoginBtn.addEventListener("click", function (e) {
    e.preventDefault();
    const tiktokLoginIdentifier = document.getElementById("tiktok-login-email");
    const tiktokLoginPassword = document.getElementById(
      "tiktok-login-password"
    );
    const identifier = tiktokLoginIdentifier.value.trim();
    const password = tiktokLoginPassword.value.trim();
    if (identifier === "" || password === "") {
      showGlobalAlert("Please enter your email/username and password.");
      return;
    }
    fetch(`https://${GetParentResourceName()}/tiktokLogin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: identifier,
        password: password,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
        } else {
        }
      })
      .catch((err) => {
        console.error("Login error:", err);
      });

    // Here you would typically send the data to a server
  });

  tiktokSignupBtn.addEventListener("click", function (e) {
    e.preventDefault(); // Prevent form from reloading the page

    const username = tiktokSignupUsername.value.trim();
    const email = tiktokSignupEmail.value.trim();
    const password = tiktokSignupPassword.value.trim();
    const birthday = tiktokSignupBirthday.value;

    // Log the values

    fetch(`https://${GetParentResourceName()}/tiktokSignUp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username,
        email: email,
        password: password,
        birthday: birthday,
      }),
    });

    // Here you can send data to the server using fetch or TriggerServerEvent if needed

    // Clear the form fields
    tiktokSignupUsername.value = "";
    tiktokSignupEmail.value = "";
    tiktokSignupPassword.value = "";
    tiktokSignupBirthday.value = "";

    // Disable signup button again until valid input is re-entered
    tiktokSignupBtn.disabled = true;
  });
});

window.addEventListener("message", function (event) {
  let data = event.data;

  if (data.type === "TiktokSignUp") {
    showGlobalAlert(data.message);
  }
  if (data.type === "TiktokLogin") {
    showGlobalAlert(data.message);
    if (data.status === true) {
      document.querySelector(".tiktok-container").style.display = "none";
      document.querySelector(".tiktok-bottom-bar").style.display = "flex";
      localStorage.setItem("tiktokId", data.userId);
      document.getElementById("tiktok-video-feed").style.display = "block";
    }
  }
  if (data.type === "TiktokerDetail") {
    this.document.querySelector(".username-tiktok").innerText =
      data.data.username || "User Name";
  }
  if (data.type === "TiktokFeedVideos") {
    feedRender(data.data);
  }
  if (data.type === "TiktokProfileUpdate") {
    showGlobalAlert(data.message);
    fetch(`https://${GetParentResourceName()}/GetTiktokUserDetails`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
  }
});

document.querySelectorAll(".tiktok-like-btn").forEach((button) => {
  button.addEventListener("click", () => {
    button.textContent = button.textContent === "❤️" ? "💔" : "❤️";
  });
});

// Show comment popup
document.querySelectorAll(".tiktok-comment-btn").forEach((button) => {
  button.addEventListener("click", () => {
    document.getElementById("tiktok-comment-popup").style.display = "block";
  });
});

function tiktokBottomTab(pageName) {
  const pages = {
    home: document.querySelector(".tiktok-video-feed"),
    profile: document.querySelector(".tiktok-profile"),
  };

  // Hide all pages first
  Object.values(pages).forEach((page) => {
    if (page) page.style.display = "none";
  });

  // Show the selected page
  if (pages[pageName]) {
    pages[pageName].style.display = "block";
  }
}

document
  .getElementById("tiktok-close-comment")
  .addEventListener("click", () => {
    document.getElementById("tiktok-comment-popup").style.display = "none";
  });
const Videos = [
  { video: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { video: "https://www.w3schools.com/html/movie.mp4" },
  {
    video:
      "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4",
  },
];

function feedRender(params) {
  const FeedContainer = document.getElementById("tiktok-video-feed");
  FeedContainer.innerHTML = "";

  params.forEach((data) => {
    const videoBlock = `
        <div class="tiktok-video">
          <video autoplay loop muted>
            <source src="${data.video}" type="video/mp4" />
          </video>
          <div class="tiktok-actions">
            <div class="tiktok-profile-picture">
        ${
          data.profile_image
            ? `<img src="${data.profile_image}" alt="Profile">`
            : `<img src="../images/user.png" alt="no profile">`
        }
            
            </div>
            <div class="tiktok-action-button tiktok-like-btn">❤️</div>
            <div class="tiktok-action-button tiktok-comment-btn">💬</div>
            <div class="tiktok-action-button">↗️</div>
          </div>
        </div>
      `;

    FeedContainer.insertAdjacentHTML("beforeend", videoBlock);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  tiktokBottomTab("home");
  fetch(`https://${GetParentResourceName()}/getTiktokVideos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  var tiktoker = localStorage.getItem("tiktokId");
  if (tiktoker) {
    document.querySelector(".tiktok-container").style.display = "none";
    document.querySelector(".tiktok-bottom-bar").style.display = "flex";
    document.getElementById("tiktok-video-feed").style.display = "block";
  } else {
    document.querySelector(".tiktok-bottom-bar").style.display = "none";
    document.querySelector(".tiktok-container").style.display = "block";
    document.getElementById("tiktok-video-feed").style.display = "none";
  }
});

function logoutTiktok() {
  document.querySelector(".tiktok-container").style.display = "block";
  document.querySelector(".tiktok-bottom-bar").style.display = "none";
  document.getElementById("tiktok-discover").style.display = "none";
  document.getElementById("tiktok-profile").style.display = "none";
  document.getElementById("tiktok-video-feed").style.display = "none";
  localStorage.remove("tiktokId");
}

function uploadAVideo() {
  document.querySelector(".tiktok-video-upload-modal").style.display = "flex";
}
function closeTiktokUploadVideoModal() {
  document.querySelector(".tiktok-video-upload-modal").style.display = "none";
  document.querySelector(".profileupdate-tiktok").style.display = "none";
}
function openProfileupdateTiktok() {
  document.querySelector(".profileupdate-tiktok").style.display = "flex";
}
function uploadProfileImageTiktok() {
  var tiktoker = localStorage.getItem("tiktokId");
  const profile = document.getElementById("prfTiktok");
  const profileLink = profile.value;

  if (profileLink.trim() === "") {
    showGlobalAlert("Please Enter Video Link");
    return;
  }

  fetch(`https://${GetParentResourceName()}/uploadProfiletiktok`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      profile: profileLink,
      id: tiktoker,
    }),
  });

  videoInput.value = "";
  showGlobalAlert("Video Uploaded");
  document.querySelector(".profileupdate-tiktok").style.display = "none";
}
function uploadTiktokVideo() {
  var tiktoker = localStorage.getItem("tiktokId");
  const videoInput = document.getElementById("upldTkVid");
  const videoLink = videoInput.value;

  if (videoLink.trim() === "") {
    showGlobalAlert("Please Enter Video Link");
    return;
  }

  fetch(`https://${GetParentResourceName()}/uploadTiktokVideo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      videoLink: videoLink,
      userId: tiktoker,
    }),
  });

  // Clear the input field
  videoInput.value = "";

  showGlobalAlert("Video Uploaded");
  document.querySelector(".tiktok-video-upload-modal").style.display = "none";
}
