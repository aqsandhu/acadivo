"use client";

import { useAuth } from "@/hooks/useAuth";
import { TeacherSidebar } from "@/components/layout/TeacherSidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProfileForm } from "@/components/dashboard/ProfileForm";

export default function TeacherProfilePage() {
  const { user } = useAuth();
  return (
    <>
      <TeacherSidebar />
      <DashboardLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">My Profile</h1>
          <ProfileForm user={user} role="TEACHER" />
        </div>
      </DashboardLayout>
    </>
  );
}
