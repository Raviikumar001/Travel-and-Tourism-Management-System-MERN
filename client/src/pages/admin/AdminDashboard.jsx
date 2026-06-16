import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  CalendarCheck,
  CreditCard,
  History as HistoryIcon,
  LogOut,
  PackagePlus,
  Pencil,
  Shield,
  Star,
  Trash2,
  UserCircle,
  Users,
} from "lucide-react";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  logOutStart,
  logOutSuccess,
  logOutFailure,
  deleteUserAccountStart,
  deleteUserAccountSuccess,
  deleteUserAccountFailure,
} from "../../redux/user/userSlice";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../../firebase";
import AllBookings from "./AllBookings";
import AdminUpdateProfile from "./AdminUpdateProfile";
import AddPackages from "./AddPackages";
import "./styles/DashboardStyle.css";
import AllPackages from "./AllPackages";
import AllUsers from "./AllUsers";
import Payments from "./Payments";
import RatingsReviews from "./RatingsReviews";
import History from "./History";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [profilePhoto, setProfilePhoto] = useState(undefined);
  const [photoPercentage, setPhotoPercentage] = useState(0);
  const [activePanelId, setActivePanelId] = useState(1);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    address: "",
    phone: "",
    avatar: "",
  });

  useEffect(() => {
    if (currentUser !== null) {
      setFormData({
        username: currentUser.username,
        email: currentUser.email,
        address: currentUser.address,
        phone: currentUser.phone,
        avatar: currentUser.avatar,
      });
    }
  }, [currentUser]);

  const handleProfilePhoto = (photo) => {
    try {
      dispatch(updateUserStart());
      const storage = getStorage(app);
      const photoname = new Date().getTime() + photo.name.replace(/\s/g, "");
      const storageRef = ref(storage, `profile-photos/${photoname}`); //profile-photos - folder name in firebase
      const uploadTask = uploadBytesResumable(storageRef, photo);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.floor(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          //   console.log(progress);
          setPhotoPercentage(progress);
        },
        (error) => {
          console.log(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadUrl) => {
            const res = await fetch(
              `/api/user/update-profile-photo/${currentUser._id}`,
              {
                method: "POST",
                headers: {
                  "Content-Type": " application/json",
                },
                body: JSON.stringify({ avatar: downloadUrl }),
              }
            );
            const data = await res.json();
            if (data?.success) {
              alert(data?.message);
              setFormData({ ...formData, avatar: downloadUrl });
              dispatch(updateUserSuccess(data?.user));
              setProfilePhoto(null);
              return;
            } else {
              dispatch(updateUserFailure(data?.message));
            }
            dispatch(updateUserFailure(data?.message));
            alert(data?.message);
          });
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = async () => {
    try {
      dispatch(logOutStart());
      const res = await fetch("/api/auth/logout");
      const data = await res.json();
      if (data?.success !== true) {
        dispatch(logOutFailure(data?.message));
        return;
      }
      dispatch(logOutSuccess());
      navigate("/login");
      alert(data?.message);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    const CONFIRM = confirm(
      "Are you sure ? the account will be permenantly deleted!"
    );
    if (CONFIRM) {
      try {
        dispatch(deleteUserAccountStart());
        const res = await fetch(`/api/user/delete/${currentUser._id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (data?.success === false) {
          dispatch(deleteUserAccountFailure(data?.message));
          alert("Something went wrong!");
          return;
        }
        dispatch(deleteUserAccountSuccess());
        alert(data?.message);
      } catch (error) {}
    }
  };

  const adminPanels = [
    { id: 1, label: "Bookings", icon: CalendarCheck },
    { id: 2, label: "Add Packages", icon: PackagePlus },
    { id: 3, label: "All Packages", icon: PackagePlus },
    { id: 4, label: "Users", icon: Users },
    { id: 5, label: "Payments", icon: CreditCard },
    { id: 6, label: "Ratings/Reviews", icon: Star },
    { id: 7, label: "History", icon: HistoryIcon },
  ];

  const activePanel =
    adminPanels.find((panel) => panel.id === activePanelId) ||
    (activePanelId === 8 && { label: "Edit Profile" }) ||
    { label: "Dashboard" };

  const renderActivePanel = () => {
    if (activePanelId === 1) return <AllBookings />;
    if (activePanelId === 2) return <AddPackages />;
    if (activePanelId === 3) return <AllPackages />;
    if (activePanelId === 4) return <AllUsers />;
    if (activePanelId === 5) return <Payments />;
    if (activePanelId === 6) return <RatingsReviews />;
    if (activePanelId === 7) return <History />;
    if (activePanelId === 8) return <AdminUpdateProfile />;
    return <div>Page Not Found!</div>;
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 p-3 sm:p-5 lg:p-8">
      {currentUser ? (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 lg:flex-row">
          <aside className="w-full lg:w-[330px] lg:shrink-0">
            <div className="sticky top-5 overflow-hidden rounded-3xl border border-white/70 bg-white shadow-xl shadow-slate-200">
              <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-blue-700 p-5 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                    <Shield size={24} />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-blue-100">
                      Admin
                    </p>
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-5 p-5">
                <div className="flex flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileRef.current.click()}
                    className="group relative h-44 w-44 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-inner"
                    aria-label="Choose profile photo"
                  >
                    {profilePhoto || formData.avatar ? (
                      <img
                        src={
                          (profilePhoto && URL.createObjectURL(profilePhoto)) ||
                          formData.avatar
                        }
                        alt="Profile photo"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400">
                        <UserCircle size={96} strokeWidth={1.4} />
                      </div>
                    )}
                    <span className="absolute inset-x-0 bottom-0 bg-slate-950/70 py-2 text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                      Change Photo
                    </span>
                  </button>
                  <input
                    type="file"
                    name="photo"
                    id="photo"
                    hidden
                    ref={fileRef}
                    accept="image/*"
                    onChange={(e) => setProfilePhoto(e.target.files[0])}
                  />

                  {profilePhoto && (
                    <button
                      onClick={() => handleProfilePhoto(profilePhoto)}
                      className="w-full rounded-xl bg-green-600 px-4 py-2 font-semibold text-white shadow-md shadow-green-100 transition hover:bg-green-700 disabled:opacity-70"
                      disabled={loading}
                    >
                      {loading ? `Uploading...(${photoPercentage}%)` : "Upload Photo"}
                    </button>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    Profile
                  </p>
                  <h2 className="mt-2 break-words text-2xl font-bold text-slate-900">
                    Hi {currentUser.username}!
                  </h2>
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <p className="break-all">
                      <span className="font-semibold text-slate-900">Email:</span>{" "}
                      {currentUser.email || "Not added"}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Phone:</span>{" "}
                      {currentUser.phone || "Not added"}
                    </p>
                    <p className="break-words">
                      <span className="font-semibold text-slate-900">Address:</span>{" "}
                      {currentUser.address || "Not added"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActivePanelId(8)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>

                <button
                  onClick={handleDeleteAccount}
                  className="flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 size={16} />
                  Delete account
                </button>
              </div>
            </div>
          </aside>

          <main className="min-w-0 flex-1 rounded-3xl border border-white/70 bg-white shadow-xl shadow-slate-200">
            <div className="border-b border-slate-200 p-4 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                    Manage Platform
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                    {activePanel.label}
                  </h2>
                </div>
                <p className="max-w-md text-sm text-slate-500">
                  Use the sections below to manage bookings, packages, users,
                  payments, reviews, and account settings.
                </p>
              </div>

              <nav className="mt-5 overflow-x-auto pb-1">
                <div className="flex w-max gap-2">
                  {adminPanels.map((panel) => {
                    const Icon = panel.icon;
                    const isActive = activePanelId === panel.id;

                    return (
                      <button
                        key={panel.id}
                        type="button"
                        onClick={() => setActivePanelId(panel.id)}
                        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                          isActive
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        <Icon size={17} />
                        <span className="text-nowrap">{panel.label}</span>
                      </button>
                    );
                  })}
                </div>
              </nav>
            </div>

            <div className="content-div min-h-[520px] overflow-x-auto p-3 sm:p-5">
              {renderActivePanel()}
            </div>
          </main>
        </div>
      ) : (
        <div className="mx-auto mt-10 max-w-md rounded-2xl bg-white p-6 text-center shadow-lg">
          <p className="font-semibold text-red-700">Login First</p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
