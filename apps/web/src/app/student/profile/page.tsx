"use client";

import { useAuth } from "@/hooks/useAuth";
import { StudentSidebar } from "@/components/layout/StudentSidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProfileForm } from "@/components/dashboard/ProfileForm";

export default function StudentProfilePage() {
  const { user } = useAuth();
  return (
    <>
      <StudentSidebar />
      <DashboardLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">My Profile</h1>
          <ProfileForm user={user} role="STUDENT" />
        </div>
      </DashboardLayout>
    </>
  );
}
