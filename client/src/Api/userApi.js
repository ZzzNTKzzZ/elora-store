import { apiFetch } from "./apiClient";

export async function addAddress(userId ,{ address }) {


const option = {
    method: "POST",
    body: address,
  };

    return apiFetch(`/user/edit/address/${userId}`, option)
}

export async function  deleteAddress(userId, {address}) {
    const option = {
        method: "DELETE",
        body: address
    }
        return apiFetch(`/user/delete/address/${userId}`, option)

}