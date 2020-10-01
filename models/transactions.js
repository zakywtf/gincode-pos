const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const timestamp = require("./plugins/timestamps");

let TransactionSchema = new Schema({
  project: {
    type: Schema.Types.ObjectId,
    ref: "projects"
  },
  member: {
    type: Schema.Types.ObjectId,
    ref: "members"
  },
  share: {
    type: Number,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["unpaid", "paid", "verified", "cancel"],
    default: "unpaid"
  },
  proof_of_payment: {
    type: String,
  },
  transaction_id: {
    type: String,
    required: true
  },
  pay_at: {
    type: Date,
    default: null
  }
});

TransactionSchema.plugin(timestamp);

module.exports = mongoose.model("transactions", TransactionSchema);
