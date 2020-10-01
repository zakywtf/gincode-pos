const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const timestamp = require("./plugins/timestamps");

let ProjectSchema = new Schema({
  project_name: {
    type: String
  },
  banner_project: {
    type: String,
    required: true
  },
  project_profile: {
    type: String,
    required: true
  },
  project_category:{
    type: String,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  project_owner: {
    type: Schema.Types.ObjectId,
    ref: "members"
  },
  pic: {
    type: String,
    required: true
  },
  target_goal: {
    type: Number,
    required: true
  },
  receive_goal: {
    type: Number,
    default: 0
  },
  pending_goal: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["funded", "ongoing", "ended", "success", "draft"],
    default: "draft"
  },
  isDelete: {
    type: Boolean,
    default: false
  }
});

ProjectSchema.plugin(timestamp);

module.exports = mongoose.model("projects", ProjectSchema);
