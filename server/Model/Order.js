import mongoose from "mongoose";
const { Schema } = mongoose;

const OrderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    orderItems: [
      {
        type: Schema.Types.ObjectId,
        ref: "OrderItem",
        required: true,
      },
    ],
    status: {
      type: String,
      enum: ["Pending", "InTransit", "Completed", "Cancelled"],
      default: "Pending",
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

OrderSchema.pre("save", async function (next) {
  if (!this.isModified("orderItems")) return next();

  try {
    const OrderItem = mongoose.model("OrderItem");

    const items = await OrderItem.find({
      _id: { $in: this.orderItems },
    }).populate("product", "isOnSale price salePrice");
    console.log(items)
    this.price = items.reduce((total, item) => {
      if (!item.product) return total;

      const unitPrice = item.product.isOnSale
        ? item.product.salePrice
        : item.product.price;
      return total + unitPrice * item.quantity;
    }, 0);

    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model("Order", OrderSchema);
