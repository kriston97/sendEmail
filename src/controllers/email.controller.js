const { emailSchema } = require("../model/email.model");
const moment = require("moment-timezone");
const nodemailer = require("nodemailer");

exports.scheduleEmail = async (req, res) => {
  const { body, query } = req;
  try {
    console.log(query.id);
    if (
      !body.recipient ||
      !body.subject ||
      !body.emailBody ||
      !body.scheduledDate ||
      !body.scheduledTime
    ) {
      res.status(400).send({
        message:
          "recipient or subject or emailBody or scheduledDate or scheduledTime missing in body",
      });
      return;
    }
    if (body.scheduledDate) {
      let reg = /^\d{4}\-\d{1,2}\-\d{1,2}$/;
      if (reg.test(body.scheduledDate) == false) {
        res
          .status(400)
          .send({ message: "date should be in format YYYY-MM-DD" });
        return;
      }
    }
    if (body.recipient) {
      let emailreg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (emailreg.test(body.recipient) === false) {
        res.status(400).send({ message: "Invalid email" });
        return;
      }
    }
    if (body.scheduledTime) {
      let datereg = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
      if (datereg.test(body.scheduledTime) == false) {
        res.status(400).send({ message: "Time should be in format HH:MM" });
        return;
      }
    }
    let currentTime = moment().tz("Asia/Calcutta").valueOf();
    let ScheduledTime = moment(`${body.scheduledDate} ${body.scheduledTime}`)
      .tz("Asia/Calcutta")
      .valueOf();
    if (currentTime > ScheduledTime) {
      res
        .status(400)
        .send({ message: "Email can be rescheduled in the future only" });
      return;
    }
    body.status = "PENDING";
    const emailDoc = await new emailSchema(req.body).save();
    if (emailDoc && emailDoc.id) {
      res.status(200).send({
        message: `email scheduled at ${body.scheduledDate} ${body.scheduledTime} successfully`,
      });
      return;
    } else {
      res
        .status(400)
        .send({ message: "Error Occurred in DB", error: emailDoc.toString() });
      return;
    }
  } catch (error) {
    res
      .status(400)
      .send({ message: "Error Occurred", error: error.toString() });
  }
};

exports.getEmailDetails = async (req, res) => {
  try {
    const emailDoc = await emailSchema.find({
      $or: [{ status: "PENDING" }, { status: "FAILED" }],
    });
    if (emailDoc && emailDoc.length) {
      res.status(200).send({ message: "Success", result: emailDoc });
      return;
    } else {
      res.status(404).send({ message: "No scheduled or failed emails found" });
      return;
    }
  } catch (error) {
    res
      .status(400)
      .send({ message: "Error Occurred", error: error.toString() });
  }
};

exports.rescheduleEmail = async (req, res) => {
  const { body } = req;
  try {
    if (!body.id || !body.scheduledDate || !body.scheduledTime) {
      res.status(400).send({
        message: "id or scheduledDate or scheduledTime missing in body",
      });
      return;
    }
    if (body.scheduledDate) {
      let reg = /^\d{4}\-\d{1,2}\-\d{1,2}$/;
      if (reg.test(body.scheduledDate) == false) {
        res
          .status(400)
          .send({ message: "date should be in format YYYY-MM-DD" });
        return;
      }
    }
    if (body.scheduledTime) {
      let datereg = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
      if (datereg.test(body.scheduledTime) == false) {
        res.status(400).send({ message: "Time should be in format HH:MM" });
        return;
      }
    }
    let currentTime = moment().tz("Asia/Calcutta").valueOf();
    let ScheduledTime = moment(`${body.scheduledDate} ${body.scheduledTime}`)
      .tz("Asia/Calcutta")
      .valueOf();
    if (currentTime > ScheduledTime) {
      res
        .status(400)
        .send({ message: "Email can be rescheduled in the future only" });
      return;
    }
    await emailSchema.findByIdAndUpdate(
      body.id,
      {
        $set: {
          scheduledDate: body.scheduledDate,
          scheduledTime: body.scheduledTime,
        },
      },
      { new: true },
      (err, doc) => {
        if (err) {
          res
            .status(400)
            .send({ message: "Error in DB", error: err.toString() });
          return;
        } else if (doc && doc.id) {
          res.status(200).send({ message: "Email rescheduled successfully" });
        }
      }
    );
  } catch (error) {
    res
      .status(400)
      .send({ message: "Error Occurred", error: error.toString() });
  }
};

exports.sendEmail = async (date, time) => {
  try {
    const emailDoc = await emailSchema.find({
      scheduledDate: date.toString(),
      scheduledTime: time.toString(),
      status: "PENDING",
    });
    if (emailDoc && emailDoc.length) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        secure: false,
        auth: {
          user: process.env.SOURCE_EMAIL,
          pass: process.env.PASSWORD,
        },
      });
      let emailStatus = "";
      emailDoc.forEach((ele) => {
        var mailOptions = {
          from: process.env.SOURCE_EMAIL,
          to: ele.recipient,
          subject: ele.subject,
          text: ele.emailBody,
        };
        transporter.sendMail(mailOptions, async function (error, info) {
          if (error) {
            emailStatus = "FAILED";
          } else {
            emailStatus = "SUCCESS";
          }
          await emailSchema.findByIdAndUpdate(
            ele.id,
            {
              $set: {
                status: emailStatus,
              },
            },
            { new: true }
          );
        });
      });
    }
  } catch (error) {
    console.log(`Error Occurred - ${error.toString()}`);
  }
};

exports.deleteScheduledEmail = async (req,res) =>{
  const {body} = req;
  try {
    if(!body.id){
      res
      .status(400)
      .send({ message: "id missing in body" });
    }
    const emailDoc = await emailSchema.findById(body.id);
    if(!emailDoc || !emailDoc.id){
      res
      .status(404)
      .send({ message: "Record not found"});
        return;
    }
    await emailSchema.findByIdAndRemove(body.id, function (err, doc) {
      if (err) {
        res
      .status(400)
      .send({ message: "Error Occurred", error: err.toString() });
        return;
      } else {
        res.status(200).send({ message: "Email deleted successfully" });
      }
    });
    
  } catch (error) {
    
  }
}
