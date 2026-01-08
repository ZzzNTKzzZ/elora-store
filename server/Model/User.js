import mongoose from "mongoose";
import Cart from "./Cart.js";
const { Schema } = mongoose;

const AddressSchema = new Schema(
  {
    city: String,
    ward: String,
    addressDetail: String,
    isDefault: Boolean,
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    image: String,
    phone: String,
    address: [AddressSchema],
    cart: { type: Schema.Types.ObjectId, ref: "Cart" },
    orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.cart) {
    const cart = await Cart.create({ user: this._id });
    this.cart = cart._id;
  }
  next();
});

export default mongoose.model("User", UserSchema);
