function showGlobalAlert(message) {
  const alertContent = document.querySelector(".globalAlert");
  alertContent.innerText = message;
  alertContent.style.right = "0px";
  setTimeout(() => {
    alertContent.style.right = "-300px";
  }, 3000);
}
//facebook login
document
  .getElementById("signup-btn-facebook")
  .addEventListener("click", function () {
    document.getElementById("login-facebook").style.display = "none";
    document.getElementById("signup-facebook").style.display = "flex";
  });
document
  .getElementById("login-btn-facebook")
  .addEventListener("click", function () {
    document.getElementById("login-facebook").style.display = "flex";
    document.getElementById("signup-facebook").style.display = "none";
  });

function facebookLogin(e) {
  e.preventDefault();
  const email = document.getElementById("email-facebook-signin").value;
  const password = document.getElementById("password-facebook-signin").value;

  fetch(`https://${GetParentResourceName()}/facebookLogin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({ email, password }),
  });
}
function facebookSignup(e) {
  e.preventDefault();
  const email = document.getElementById("email-facebook").value;
  const password = document.getElementById("password-facebook").value;
  const username = document.getElementById("username-facebook").value;
  const confirmPassword = document.getElementById(
    "confirm-password-facebook"
  ).value;

  if (password !== confirmPassword) {
    showGlobalAlert("Passwords do not match");
    return;
  }

  fetch(`https://${GetParentResourceName()}/facebookSignup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({ email, password, username }),
  });
}

window.addEventListener("message", function (event) {
  if (event.data.type === "facebookSignupResult") {
    showGlobalAlert(event.data.message);
  }
});
window.addEventListener("message", function (event) {
  const login = document.getElementById("login-facebook");
  const feedPage = document.getElementById("facebook-feed-page");
  const bottomNavbar = document.getElementById("bottom-nav-facebook");
  const header = document.getElementById("hder");
  if (event.data.type === "facebookLoginResult") {
    showGlobalAlert(event.data.message);
    const data = event.data;
    if (data.status === true) {
      localStorage.setItem("facebookUserId", JSON.stringify(data.userId));
      login.style.display = "none";
      feedPage.style.display = "flex";
      header.style.display = "none"; // Hide header when logged in
      bottomNavbar.style.display = "flex";
    } else {
      showGlobalAlert(event.data.message);
    }
  }
});

function getUserDetails() {
  const userId = localStorage.getItem("facebookUserId");
  fetch(`https://${GetParentResourceName()}/facebookGetUserDetails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({ userId }),
  });
  window.addEventListener("message", function (event) {
    const data = event.data;
    if (data.type === "facebookUserDetails") {
      document.getElementById("facebook-username").innerText =
        data.data.username;

      document.getElementById("fb-prp").src = data.data.image;
      document.getElementById("fd-pfp-img").src = data.data.image;
    }
  });
}
window.addEventListener("DOMContentLoaded", function () {
  const userId = localStorage.getItem("facebookUserId");

  const login = document.getElementById("login-facebook");
  const feedPage = document.getElementById("facebook-feed-page");
  const bottomNavbar = document.getElementById("bottom-nav-facebook");
  const header = document.getElementById("hder");

  if (!login || !feedPage || !header) {
    console.error("One or more elements not found");
    return;
  }

  if (userId) {
    getUserDetails();
    login.style.display = "none";
    feedPage.style.display = "flex";
    header.style.display = "none"; // Hide header when logged in
    bottomNavbar.style.display = "flex"; // Hide header when logged in
  } else {
    login.style.display = "flex";
    feedPage.style.display = "none";
    header.style.display = "none"; // Show header when not logged in
    bottomNavbar.style.display = "none"; // Hide header when logged in
  }
});

function bottomNavFacebook(params) {
  const userId = localStorage.getItem("facebookUserId");
  console.log(JSON.stringify(userId));

  const login = document.getElementById("login-facebook");
  const feedPage = document.getElementById("facebook-feed-page");
  const bottomNavbar = document.getElementById("bottom-nav-facebook");
  const header = document.getElementById("hder");
  if (params === "Request") {
    document.getElementById("request-facebook-btn").classList.add("active");
    document.getElementById("feed-facebook-btn").classList.remove("active");
    document.getElementById("profile-facebook-btn").classList.remove("active");

    document.getElementById("facebook-feed-page").style.display = "none";
    document.getElementById("facebook-request-page").style.display = "block";
    document.getElementById("facebook-profile-page").style.display = "none";
  const userId = localStorage.getItem("facebookUserId");

    fetch(`https://${GetParentResourceName()}/facebook_users_fetch`, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({ id: userId }),
    });
    fetch(`https://${GetParentResourceName()}/FetchIncomingRequests`, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({ id: userId }),
    });
  } else if (params === "Feed") {
    document.getElementById("request-facebook-btn").classList.remove("active");
    document.getElementById("feed-facebook-btn").classList.add("active");
    document.getElementById("profile-facebook-btn").classList.remove("active");
    document.getElementById("facebook-feed-page").style.display = "block";
    document.getElementById("facebook-request-page").style.display = "none"; // <- missing line added
    document.getElementById("facebook-profile-page").style.display = "none";
    fetch(`https://${GetParentResourceName()}/facebookGetUserDetails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ userId }),
    });
    fetch(`https://${GetParentResourceName()}/fetchingFbPosts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ userId }),
    });
  } else if (params === "Profile") {
    document.getElementById("request-facebook-btn").classList.remove("active");
    document.getElementById("feed-facebook-btn").classList.remove("active");
    document.getElementById("profile-facebook-btn").classList.add("active");

    document.getElementById("facebook-feed-page").style.display = "none";
    document.getElementById("facebook-request-page").style.display = "none";
    document.getElementById("facebook-profile-page").style.display = "block";
    fetch(`https://${GetParentResourceName()}/facebookGetUserDetails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ userId }),
    });
  } else if (params === "logout") {
    login.style.display = "flex";
    header.style.display = "flex"; // Show header when not logged in
    bottomNavbar.style.display = "none";
    localStorage.removeItem("facebookUserId");
    document.getElementById("request-facebook-btn").classList.remove("active");
    document.getElementById("feed-facebook-btn").classList.remove("active");
    document.getElementById("profile-facebook-btn").classList.remove("active");
    document.getElementById("facebook-feed-page").style.display = "none";
    document.getElementById("facebook-request-page").style.display = "none";
    document.getElementById("facebook-profile-page").style.display = "none";
  }
}

function updatePfpFacebook() {
  const userId = localStorage.getItem("facebookUserId");
  const pfpImg = document.getElementById("fbPfpTxt").value;

  if (!pfpImg || pfpImg.trim() === "") {
    showGlobalAlert("Please fill the field");
    return;
  }

  fetch(`https://${GetParentResourceName()}/uploadPfpFb`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({ profilePicture: pfpImg, id: userId }),
  });
  fetch(`https://${GetParentResourceName()}/facebookGetUserDetails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({ userId }),
  });
  document.querySelector(".profile-upload-modal").style.display = "none";
  document.querySelector(".profile-upload-modal2").style.display = "none";
}
function closeFbModal() {
  document.querySelector(".profile-upload-modal2").style.display = "none";
  document.querySelector(".profile-upload-modal").style.display = "none";
}
let currentUploadType = "Text";
function openFacebookProfileModal() {
  document.querySelector(".profile-upload-modal2").style.display = "flex";
}
function openFacebookPostModal() {
  document.querySelector(".profile-upload-modal").style.display = "flex";
  currentUploadType = "Text";
  document.getElementById("fbTxtcntnt").placeholder = "What's on your mind?";
}

function openPictureUploadModal() {
  document.querySelector(".profile-upload-modal").style.display = "flex";
  document.getElementById("fbTxtcntnt").placeholder = "Upload Photo ...";
  currentUploadType = "Photo";
}
function uploadTxtFacebook() {
  const userId = localStorage.getItem("facebookUserId");
  const txtConent = document.getElementById("fbTxtcntnt").value;
  if (!txtConent || txtConent.trim() === "") {
    showGlobalAlert("Please fill the field");
    return;
  }

  fetch(`https://${GetParentResourceName()}/uploadTxtContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({
      id: userId,
      content: txtConent,
      type: currentUploadType,
    }),
  });
  document.querySelector(".profile-upload-modal").style.display = "none";
  document.querySelector(".profile-upload-modal2").style.display = "none";
}
let postLikeState = {};
let activeCommentPostId = null; // Track which post is being commented
let commentCounts = {}; // Track comment counts for each post

window.addEventListener("message", function (event) {
  const userId = localStorage.getItem("facebookUserId");
  const data = event.data;

  if (data.type === "facebookposts" && Array.isArray(data.posts)) {
    const feed = document.querySelector(".facebook-feed-section");
    feed.innerHTML = ""; // Clear existing posts

    data.posts.forEach((post) => {
      const postElement = document.createElement("div");
      postElement.className = "fb-post";
      postElement.id = `post-${post.id}`;

      const isLiked = postLikeState[post.id] === true;
      const likeCount = post.likeCount + (isLiked ? 1 : 0);
      commentCounts[post.id] = post.commentCount || 0;

      postElement.innerHTML = `
        <div class="fb-post-content">
          ${
            post.type === "Photo"
              ? `<img src="${post.content}" alt="Photo" class="fb-post-image">`
              : `<p class="fb-post-text">${escapeHTML(post.content)}</p>`
          }
        </div>
        <div class="fb-post-meta">
          <span>${new Date(post.created_at).toLocaleString()}</span>
        </div>
        <div class="fb-post-actions">
          <button class="like-button ${
            isLiked ? "liked" : ""
          }" onclick="likePost('${post.id}', '${userId}', this)">
            👍 Like<span class="like-counter">${
              likeCount > 0 ? " · " + likeCount : ""
            }</span>
          </button>
          <button onclick="openCommentPanel('${post.id}')">
            💬 Comment<span class="comment-counter">${
              commentCounts[post.id] > 0 ? " · " + commentCounts[post.id] : ""
            }</span>
          </button>
        </div>
      `;

      feed.appendChild(postElement);
    });
  } else if (data.type === "facebookcomments" && data.postId) {
    updateCommentList(data.comments || [], data.postId);
  }
});

function escapeHTML(str) {
  return str.replace(
    /[&<>'"]/g,
    (tag) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      }[tag] || tag)
  );
}

function likePost(postId, userId, button) {
  const isAlreadyLiked = postLikeState[postId] === true;
  postLikeState[postId] = !isAlreadyLiked;

  fetch(`https://${GetParentResourceName()}/facebook_likes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ post_id: postId, user_id: userId }),
  });

  // Update UI
  const likeCounter = button.querySelector(".like-counter");
  let currentCount = 0;
  if (likeCounter.textContent) {
    currentCount =
      parseInt(likeCounter.textContent.replace("·", "").trim()) || 0;
  }

  if (isAlreadyLiked) {
    button.classList.remove("liked");
    likeCounter.textContent =
      currentCount > 1 ? " · " + (currentCount - 1) : "";
  } else {
    button.classList.add("liked");
    likeCounter.textContent = " · " + (currentCount + 1);
  }
}

// Shows the external comment box
function openCommentPanel(postId) {
  const panel = document.getElementById("comment-panel");
  const input = document.getElementById("comment-input");
  const commentList = document.getElementById("comment-list");
  const sendButton = document.getElementById("send-comment");

  panel.style.display = "flex";
  input.value = "";
  input.focus();
  sendButton.disabled = true;
  activeCommentPostId = postId;

  // Clear previous
  commentList.innerHTML = "<div class='no-comments'>Loading comments...</div>";

  // Fetch comments
  fetch(`https://${GetParentResourceName()}/fb_fetch_comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postId: postId }),
  });

  // Comments will be received via the message event handler
}

function closeCommentPanel() {
  document.getElementById("comment-panel").style.display = "none";
  activeCommentPostId = null;
}

function updateCommentList(comments, postId) {
  const commentList = document.getElementById("comment-list");

  if (!comments || comments.length === 0) {
    commentList.innerHTML =
      "<div class='no-comments'>No comments yet. Be the first to comment!</div>";
    return;
  }

  commentList.innerHTML = "";
  comments.forEach((comment) => {
    const commentDate = new Date(comment.created_at);
    const timeAgo = getTimeAgo(commentDate);

    const commentEl = document.createElement("div");
    commentEl.className = "comment-item";
    commentEl.innerHTML = `
      <div class="comment-bubble">
        <div class="comment-author">${escapeHTML(
          comment.username || "User"
        )}</div>
        <p class="comment-text">${escapeHTML(comment.comment)}</p>
      </div>
      <div class="comment-time">${timeAgo}</div>
    `;

    commentList.appendChild(commentEl);
  });

  // Update comment count on the post button
  commentCounts[postId] = comments.length;
  const postElement = document.getElementById(`post-${postId}`);
  if (postElement) {
    const commentButton = postElement.querySelector(
      ".fb-post-actions button:nth-child(2)"
    );
    const commentCounter = commentButton.querySelector(".comment-counter");
    if (commentCounter) {
      commentCounter.textContent =
        comments.length > 0 ? " · " + comments.length : "";
    }
  }
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return interval + " years ago";
  if (interval === 1) return "a year ago";

  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return interval + " months ago";
  if (interval === 1) return "a month ago";

  interval = Math.floor(seconds / 86400);
  if (interval > 1) return interval + " days ago";
  if (interval === 1) return "yesterday";

  interval = Math.floor(seconds / 3600);
  if (interval > 1) return interval + " hours ago";
  if (interval === 1) return "an hour ago";

  interval = Math.floor(seconds / 60);
  if (interval > 1) return interval + " minutes ago";
  if (interval === 1) return "a minute ago";

  return "just now";
}

function checkCommentInput() {
  const input = document.getElementById("comment-input");
  const sendButton = document.getElementById("send-comment");

  // Enable/disable send button based on input
  sendButton.disabled = input.value.trim() === "";
}

function submitComment() {
  const userId = localStorage.getItem("facebookUserId");
  const comment = document.getElementById("comment-input").value.trim();
  const sendButton = document.getElementById("send-comment");

  if (!activeCommentPostId || !comment) return;

  sendButton.disabled = true;

  fetch(`https://${GetParentResourceName()}/facebook_comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      postId: activeCommentPostId,
      user_id: userId,
      comment: comment,
    }),
  });

  document.getElementById("comment-input").value = "";

  // Auto-refresh comments after submitting
  setTimeout(() => {
    fetch(`https://${GetParentResourceName()}/fb_fetch_comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: activeCommentPostId }),
    });
  }, 500);
}

window.addEventListener("message", function (event) {
  let data = event.data;
  if (data.type === "AllUserRecieved") {
    const requestList = document.getElementById("suggested-list");
    requestList.innerHTML = ""; // Clear existing list

    data.users.forEach((user) => {
    console.log(JSON.stringify(user));
    
      const isRequested =
        user.requested === true ||
        user.requested === "true" ||
        user.requested === 1;
    
      const userDiv = document.createElement("div");
      userDiv.className = "suggest-user";
    
      userDiv.innerHTML = `
        <div class="sug-det">
          <img src="${user.image}" alt="" />
          <span>${user.username}</span>
        </div>
        <button 
          id="add-friend-${user.id}" 
          ${isRequested ? "disabled" : ""}
          style="
            background-color: ${isRequested ? "grey" : "#007bff"};
            cursor: ${isRequested ? "not-allowed" : "pointer"};
          "
        >
          ${isRequested ? "Requested" : "Add Friend"}
        </button>
      `;
    
      requestList.appendChild(userDiv);
    
      // Attach event listener if not requested
      if (!isRequested) {
        const button = document.getElementById(`add-friend-${user.id}`);
        button.addEventListener("click", () => sendFriendRequest(user.id));
      }
    });
    
  }
});
window.addEventListener("message", function (event) {
  let data = event.data;
  if (data.type === "IncomingRequestsReceived") {
    const requestList = document.getElementById("request-list");
    requestList.innerHTML = "";
    let notFound = document.createElement("p");
    requestList.appendChild(notFound);

    const userId = localStorage.getItem("facebookUserId");

    if (data.requests && data.requests.length > 0) {
      data.requests.forEach((request) => {
        requestList.innerHTML += `
          <div class="suggest-user">
            <div class="sug-det">
              <img src="${request.image}" alt="" />
              <span>${request.username}</span>
            </div>
            <div style="display:flex;gap:2px">
              <button style="width:45px" onclick="acceptRequest(${userId}, ${request.sender_id})">Accept</button>
              <button style="width:45px" onclick="rejectRequest(${userId}, ${request.sender_id})">Reject</button>
            </div>
          </div>`;
      });
    } else {
      notFound.innerText = "No Requests";
    }
  }
});


function sendFriendRequest(receiverId) {
  const userId = localStorage.getItem("facebookUserId");
  fetch(`https://${GetParentResourceName()}/facebook_users_fetch`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify({ id: userId }),
  });
  fetch(`https://${GetParentResourceName()}/SendFbRequest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      senderId: userId,
      recieverId: receiverId,
    }),
  }).then(() => {
    showGlobalAlert("Friend Request Sent");

    // Disable the button and change its color
    const button = document.querySelector(
      `button[onclick="sendFriendRequest(${receiverId})"]`
    );
    if (button) {
      button.innerText = "Requested";
      button.disabled = true;
      button.style.backgroundColor = "grey";
      button.style.cursor = "not-allowed";
    }
  });
}

function acceptRequest(requestId, senderId) {
  console.log(JSON.stringify(requestId), JSON.stringify(senderId));

  fetch(`https://${GetParentResourceName()}/handleFacebookRequest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      myId: requestId,
      senderId: senderId,
      action: "accepted",
    }),
  });
}
function rejectRequest(requestId, senderId) {
  console.log(JSON.stringify(requestId), JSON.stringify(senderId));

  fetch(`https://${GetParentResourceName()}/handleFacebookRequest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      myId: requestId,
      senderId: senderId,
      action: "declined",
    }),
  });
}
