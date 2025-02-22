const mongoose = require('mongoose');

const connectionRequestSchema = mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    requestStatus: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: 'pending'
    },

},
    { timestamps: true }
)

const ConnectionRequest = mongoose.model("ConnectionRequest", connectionRequestSchema);

module.exports = {ConnectionRequest};