const Projects = require("../models/projects");

const deadlineCheck = async () => {
  let today = new Date();
  Projects.updateMany(
    { deadline: { $lte: today }, status: "ongoing" },
    { $set: { status: "ended" } }
  ).exec((err, data) => {
    if (err)
      return console.log(
        "There is some error when checking overdue project: " + err.message
      );
    if (data.length) {
      console.log("There is " + data.length + " overdue project");
      return console.log("Updating overdue project: " + err.message);
    }
  });
  //expiredProject.map()
};

module.exports = deadlineCheck;
