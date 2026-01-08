import { apiFetch } from "./apiClient";

export async function createCheckout(userId, orderItems) {
  const method = {
     method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ orderItems })
  }
  return apiFetch(`/order/${userId}/create`, method)
}

export async function getOrder(userId) {
  return apiFetch(`/order/user/${userId}`)
}

export async function modifyStatusOrder({ orderId, status}) {
  const method = {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status })
  }
  return apiFetch(`/order/modify/${orderId}`, method)
}

export async function getAllOrders() {
  return apiFetch(`/order`)
}

export async function getOrderById(id) {
  return apiFetch(`/order/${id}`)
}

// Alias for updateOrderStatus
export async function updateOrderStatus(orderId, status) {
  return modifyStatusOrder({ orderId, status })
}
