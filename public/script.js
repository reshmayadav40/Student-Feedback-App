const formPage = document.getElementById("formPage");
const listPage = document.getElementById("listPage");

const showFormBtn = document.getElementById("showFormBtn");
const showListBtn = document.getElementById("showListBtn");

const form = document.getElementById("feedbackForm");
const msg = document.getElementById("msg");

const feedbackList = document.getElementById("feedbackList");

// ------------------
// page switching
// ------------------
showFormBtn.addEventListener("click", () => {
  formPage.classList.remove("hidden");
  listPage.classList.add("hidden");
  showFormBtn.classList.add("active");
  showListBtn.classList.remove("active");
});

showListBtn.addEventListener("click", () => {
  formPage.classList.add("hidden");
  listPage.classList.remove("hidden");
  showListBtn.classList.add("active");
  showFormBtn.classList.remove("active");
  loadFeedback();
});

// ------------------
// submit feedback
// ------------------
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const rating = Number(document.getElementById("rating").value);
  const comment = document.getElementById("comment").value;

  const res = await fetch("/api/feedback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, rating, comment }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    msg.textContent = `Error: ${res.status} ${res.statusText}`;
    console.error("Server error:", errorText);
    return;
  }

  const data = await res.json();
  msg.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${data.message || "Feedback submitted successfully!"}`;
  
  setTimeout(() => {
    msg.innerHTML = "";
  }, 3000);

  form.reset();
});

// ------------------
// load all feedback
// ------------------
async function loadFeedback() {
  feedbackList.innerHTML = "Loading...";

  const res = await fetch("/api/feedback");
  
  if (!res.ok) {
    feedbackList.innerHTML = `<p style="color:red">Error loading feedback: ${res.status} ${res.statusText}</p>`;
    return;
  }

  const data = await res.json();

  feedbackList.innerHTML = "";

  if (data.length === 0) {
    feedbackList.innerHTML = "<p>No feedback yet.</p>";
    return;
  }

  data.forEach((f) => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <h4>
        <span class="student-name"><i class="fa-solid fa-user"></i> ${f.name}</span>
        <span class="rating-badge"><i class="fa-solid fa-star"></i> ${f.rating}/5</span>
      </h4>
      <p><i class="fa-solid fa-quote-left" style="opacity: 0.3; margin-right: 8px;"></i>${f.comment}</p>

      <div class="actions">
        <button class="editBtn"><i class="fa-solid fa-pen"></i> Edit</button>
        <button class="deleteBtn"><i class="fa-solid fa-trash"></i> Delete</button>
      </div>
    `;

    // ------------------
    // DELETE
    // ------------------
    div.querySelector(".deleteBtn").addEventListener("click", async () => {
      const ok = confirm("Are you sure you want to delete?");
      if (!ok) return;

      await fetch(`/api/feedback/${f._id}`, {
        method: "DELETE",
      });

      loadFeedback();
    });

    // ------------------
    // EDIT
    // ------------------
    div.querySelector(".editBtn").addEventListener("click", async () => {
      const newName = prompt("Edit name", f.name);
      if (newName === null) return;

      const newRating = prompt("Edit rating (1-5)", f.rating);
      if (newRating === null) return;

      const newComment = prompt("Edit comment", f.comment);
      if (newComment === null) return;

      await fetch(`/api/feedback/${f._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newName,
          rating: Number(newRating),
          comment: newComment,
        }),
      });

      loadFeedback();
    });

    feedbackList.appendChild(div);
  });
}
