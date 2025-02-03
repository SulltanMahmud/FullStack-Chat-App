import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIng: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  // authFunctionality
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("error in IN checkauth");
      set({ authUser: null });
    } finally {
      console.log("finally");
      set({ isCheckingAuth: false });
    }
  },
  //  signUp functionality
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Acount created Successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  // login Function
  // when login socket Io connect Immediately

  login: async (data) => {
    set({ isLoggingIng: true });
    try {
      console.log("hit login");
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged In Successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIng: false });
    }
  },

  // logout functionality
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged Out Successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  // update Profile
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("profile Updated Successfully");
    } catch (error) {
      console.log("error In Update Profile", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();

    if (!authUser || get().socket?.connected) return;
    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
