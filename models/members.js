const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const timestamp = require('./plugins/timestamps');

let MemberSchema = new Schema({
    password: {
        type: String,
    },
    name: {
        type: String,
        required: true,
    },
    idMember: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isDelete: {
        type: Boolean,
        default: false,
    }
});

MemberSchema.plugin(timestamp);

module.exports = mongoose.model("members", MemberSchema);