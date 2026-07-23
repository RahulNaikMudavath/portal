const mongoose = require("mongoose");

const workOrderSchema = new mongoose.Schema(
{
    workRequest:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"WorkRequest",
        required:true,
    },

    engineer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
},

    assignedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },

    priority:{
        type:String,
        default:"medium",
    },

    deadline:Date,

    estimatedBudget:Number,

    notes:String,

    status:{
        type:String,
        default:"Assigned",
        enum:[
            "Assigned",
            "Accepted",
            "Site Visit",
            "Estimation",
            "Review",
            "Completed",
            "Rejected"
        ]
    }

},
{
timestamps:true,
});

module.exports=mongoose.model("WorkOrder",workOrderSchema);