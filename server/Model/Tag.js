import mongoose from "mongoose";
const { Schema } = mongoose;

const TagSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

TagSchema.pre("save", function (next) {
  this.name =
    this.name.charAt(0).toUpperCase() + this.name.slice(1).toLowerCase();
  next();
});

export default mongoose.model("Tag", TagSchema);
