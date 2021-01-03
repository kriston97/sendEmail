const mongoose = require("mongoose");

const emailSchema = mongoose.Schema(
  {
    recipient: { type: String, required: true },
    subject: { type: String, required: true },
    emailBody: { type: String, required: true },
    scheduledDate: { type: String, required: true },
    scheduledTime: { type: String, required: true },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = { emailSchema: mongoose.model("email", emailSchema) };
