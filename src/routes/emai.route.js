const emailController = require("../controllers/email.controller");

module.exports = ({ app }) => {
  app.post("/email/v1/schedule", emailController.scheduleEmail);
  app.post("/email/v1/reschedule", emailController.rescheduleEmail);
  app.get("/email/v1/get-status", emailController.getEmailDetails);
};
