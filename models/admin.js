const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const timestamp = require('./plugins/timestamps');

let MemberSchema = new Schema({
    username: String,
    password: String,
    name: String,
    isAdmin: {
        type: Boolean,
        default: true,
    },
    isDelete: {
        type: Boolean,
        default: false,
    }
});

MemberSchema.plugin(timestamp);

module.exports = mongoose.model("admin", MemberSchema);