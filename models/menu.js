const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const timestamp = require("./plugins/timestamps");

let MenuSchema = new Schema({
    menu_id:String,
    title:String,
    price:Number,
    tags:[String],
    desc:String,
    pict:String,
});

MenuSchema.plugin(timestamp);

module.exports = mongoose.model("menus", MenuSchema);
