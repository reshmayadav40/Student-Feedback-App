const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const app = express();

// middleware
app.use(express.json());
app.use(express.static("public"));

// --------------------
// MongoDB connection
// --------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// --------------------
// Schema & Model
// --------------------
const feedbackSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);

// --------------------
// Routes
// --------------------

// POST – save feedback
app.post("/api/feedback", async (req, res) => {
  try {
    const { name, rating, comment } = req.body;

    const newFeedback = new Feedback({
      name,
      rating,
      comment,
    });

    await newFeedback.save();

    res.status(201).json({ message: "Feedback saved successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to save feedback" });
  }
});

// GET – get all feedback
app.get("/api/feedback", async (req, res) => {
  try {
    const allFeedback = await Feedback.find().sort({ createdAt: -1 });
    res.json(allFeedback);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
});


// UPDATE feedback
app.put("/api/feedback/:id", async (req, res) => {
  try {
    const { name, rating, comment } = req.body;

    const updated = await Feedback.findByIdAndUpdate(
      req.params.id,
      { name, rating, comment },
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update feedback" });
  }
});

// DELETE feedback
app.delete("/api/feedback/:id", async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete feedback" });
  }
});

// --------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
