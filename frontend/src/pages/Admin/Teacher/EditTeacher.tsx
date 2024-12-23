import { Button } from "@/components/ui/button";
import {
  CourseType,
  SectionType,
  StudentCreds,
  TeacherCreds,
  UsersType,
} from "@/lib/types";
import { AnimatePresence } from "framer-motion";
import { PencilIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Notification } from "@/components/SlideInNotifications";
import { Heading } from "@/components/heading";

import ProfileSetModal from "@/components/ProfileSetModal";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useParams } from "react-router-dom";

const EditTeacher = ({ token }: { token: string }) => {
  const { id } = useParams();
  const [courseName, setCourseName] = useState<string | null>(null);
  const [editProfile, setEditProfile] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<
    { id: number; successMessage: string }[]
  >([]);
  const [user, setUser] = useState<any | null>(null);
  const [teacherInfo, setTeacherInfo] = useState<TeacherCreds | null>(null);
  const [teacherInput, setTeacherInput] = useState({
    id: teacherInfo?.id || "",
    fn: teacherInfo?.fn || "",
    ln: teacherInfo?.ln || "",
    gender: teacherInfo?.gender || "",
    birthday: teacherInfo?.birthday || "",
    profile_picture: teacherInfo?.profile_picture || "",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [sections, setSections] = useState<SectionType[]>([]);
  const [courses, setCourses] = useState<CourseType[]>([]);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (teacherInfo) {
      setTeacherInput({
        id: teacherInfo.id || "",
        fn: teacherInfo.fn || "",
        ln: teacherInfo.ln || "",
        gender: teacherInfo.gender || "",
        birthday: teacherInfo.birthday || "",
        profile_picture: teacherInfo.profile_picture || "",
      });
    }
  }, [teacherInfo]);

  useEffect(() => {
    if (errors.length > 0) {
      errors.forEach((e) => {
        addNotification(e);
      });
    }
  }, [errors]);

  const addNotification = (message: string) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, successMessage: message }]);
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  // this saveProfile() function handles form submition and notifications
  const saveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setErrors([]);
      const res = await fetch(
        `/api/${
          user.user_type === "S"
            ? "students"
            : user.user_type === "T"
            ? "teachers"
            : ""
        }/${id}`,
        {
          method: "put",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include the token here
          },
          body: JSON.stringify(teacherInput),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat() as string[];
          setErrors(errorMessages);
        } else {
          setErrors((e) => [...e, "Something went wrong"]);
        }
      } else {
        fetchUserData();
        window.location.reload();
        addNotification("Profile saved successfully!");
      }
    } catch (error) {
      console.log(errors);
    } finally {
      setIsLoading(false);
    }
  };

  async function fetchUserData() {
    setUser(null);
    setTeacherInfo(null);
    setIsLoading(true);
    setCourseName(null);
    setCourses([]);
    setSections([]);
    setErrors([]);
    try {
      const userData = await fetchWithErrorHandling(`/api/admin/edit/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const teacherData = await fetchWithErrorHandling(`/api/teachers/${id}`);

      setUser(userData.user);
      setTeacherInfo(teacherData.teacher);
      const allCoursesData = await fetchWithErrorHandling("/api/courses");
      setCourses(allCoursesData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleChange = <T extends keyof typeof teacherInfo>(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setTeacherInput((prev) => {
      if (!prev) return prev; // Guard against undefined
      const key = name as T; // Cast `name` to the type of `T`
      const newValue = typeof prev[key] === "number" ? Number(value) : value; // Handle type correctly
      return {
        ...prev,
        [key]: newValue,
      };
    });
  };

  async function fetchWithErrorHandling(url: string, headers: any = {}) {
    try {
      const res = await fetch(url, headers);
      const data = await res.json();
      if (!res.ok) {
        console.log(data);
        handleApiErrors(data);
        return null;
      }
      return data;
    } catch (err) {
      console.error("Fetch error:", err);
      return null;
    }
  }

  const handleApiErrors = (data: any) => {
    let errorMessages;

    if (data.errors) {
      errorMessages = Object.values(data.errors).flat();
    } else if (data.error) {
      errorMessages = Array.isArray(data.error) ? data.error : [data.error];
    } else if (data.message) {
      errorMessages = Array.isArray(data.message)
        ? data.message
        : [data.message];
    } else {
      errorMessages = ["Something went wrong"];
    }
    setErrors((prev: any) => [...prev, ...errorMessages]);
  };

  if (isLoading || !teacherInfo) return <LoadingSpinner loading={true} />;

  return (
    <>
      <div className="px-6 py-4">
        <Heading title="Profile" />
      </div>
      <div className="p-6 flex items-center justify-center">
        <div className="flex gap-3">
          <div className="w-96 ml-0 bg-form rounded-lg shadow-drop-1 min-w-0">
            <div className="bg-form rounded-t-lg p-6 flex flex-col items-center">
              <div className="relative z-10 w-16 h-16 bg-DHVSU-white rounded-full flex items-center justify-center font-semibold border border-dhvsu dark:border-dhvsu-lighter">
                <Avatar className="h-16 w-16 rounded-full overflow-hidden flex items-center justify-center">
                  <AvatarImage
                    className="h-full w-full object-cover object-center"
                    src={teacherInfo.profile_picture!}
                    alt={user.id.toString()}
                  />
                  <AvatarFallback className="rounded-lg">
                    {teacherInfo.fn[0].toUpperCase() +
                      teacherInfo.ln[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="text-center mt-4 text-brand dark:text-white">
                <p className="text-lg font-bold">
                  {teacherInfo.ln}, {teacherInfo.fn} (Teacher)
                </p>
                {courseName && <p className="text-sm">{courseName}</p>}
                <p className="text-sm">{user.id}</p>
              </div>

              <Button
                className="mt-4 px-4 py-2 bg-brown-700 text-white dark:text-brand bg-brand dark:bg-white text-sm font-semibold rounded-full flex items-center gap-2"
                onClick={() => setEditProfile(true)}
              >
                <PencilIcon size={14} /> Edit profile
              </Button>
            </div>
          </div>

          {editProfile && (
            <ProfileSetModal
              isOpen={editProfile}
              setIsOpen={setEditProfile}
              userId={user.id}
              token={token}
              user_type={user.user_type}
              setErrors={setErrors}
            />
          )}

          <div className="flex-grow p-10 bg-dhvsu-light dark:bg-dhvsu-lighter rounded-xl w-full shadow-md">
            <span className="text-dhvsu-lighter font-semibold mx-3 dark:text-dhvsu-light">
              TEACHER INFORMATION
            </span>

            <form
              onSubmit={saveProfile}
              className="bg-dhvsu-lighter dark:bg-dhvsu-light rounded-xl mx-0 my-2 w-full shadow-md p-6 space-y-4 min-w-0"
            >
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 dark:text-white text-dhvsu-light">
                <div className="flex flex-col col-span-2">
                  <label className="font-semibold mb-2">Last Name</label>
                  <input
                    type="text"
                    className="border border-dhvsu rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-DHVSU-hover w-full text-black"
                    value={teacherInput.ln}
                    onChange={handleChange}
                    name="ln"
                  />
                </div>

                <div className="flex flex-col col-span-2">
                  <label className="font-semibold mb-2">First Name</label>
                  <input
                    type="text"
                    className="border border-dhvsu rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-DHVSU-hover w-full text-black"
                    value={teacherInput.fn}
                    onChange={handleChange}
                    name="fn"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 text-dhvsu dark:text-white">
                <div className="flex flex-col col-span-1">
                  <label className=" font-semibold mb-2">Gender</label>
                  <select
                    className="border border-dhvsu rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-DHVSU-hover w-full text-black"
                    value={teacherInput.gender}
                    onChange={handleChange}
                    name="gender"
                  >
                    <option value="" disabled>
                      Select an option
                    </option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div className="flex flex-col col-span-2 dark:text-white">
                  <label className=" font-semibold mb-2">
                    Date of Birth / Age
                  </label>
                  <input
                    type="date"
                    className="border border-dhvsu rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-DHVSU-hover w-full"
                    value={teacherInput.birthday}
                    onChange={handleChange}
                    name="birthday"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 text-dhvsu-light dark:text-white">
                <div className="flex flex-col col-span-2">
                  <label className=" font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    className="border border-dhvsu rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-DHVSU-hover w-full"
                    value={user.email}
                    disabled={true}
                    onChange={handleChange}
                    name="email"
                  />
                </div>
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save profile"}
              </Button>
            </form>
          </div>
        </div>
        <div>
          <AnimatePresence>
            {notifications.map((notif) => (
              <Notification
                key={notif.id}
                id={notif.id}
                successMessage={notif.successMessage}
                removeNotif={removeNotification}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default EditTeacher;
