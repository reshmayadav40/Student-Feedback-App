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
});

showListBtn.addEventListener("click", () => {
  formPage.classList.add("hidden");
  listPage.classList.remove("hidden");
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
  msg.textContent = data.message || "Saved";

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
      <h4>${f.name} (⭐ ${f.rating})</h4>
      <p>${f.comment}</p>

      <div style="margin-top:8px;">
        <button class="editBtn">Edit</button>
        <button class="deleteBtn">Delete</button>
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
