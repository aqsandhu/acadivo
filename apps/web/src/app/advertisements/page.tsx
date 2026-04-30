"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ParentSidebar } from "@/components/layout/ParentSidebar";
import { StudentSidebar } from "@/components/layout/StudentSidebar";
import { TeacherSidebar } from "@/components/layout/TeacherSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { getConsumerAdvertisements, trackAdClick } from "@/services/apiClient";
import type { Advertisement } from "@/types";
import { Megaphone, ExternalLink, Eye } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function AdvertisementsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConsumerAdvertisements()
      .then((data) => {
        setAds(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        toast.error(t("common.loadFailed"));
      });
  }, [t]);

  const handleViewAd = async (ad: Advertisement) => {
    try {
      await trackAdClick(ad.id);
    } catch {
      // silently fail tracking
    }
    if (ad.linkUrl) {
      window.open(ad.linkUrl, "_blank", "noopener,noreferrer");
    }
  };

  const renderSidebar = () => {
    switch (user?.role) {
      case "parent":
        return <ParentSidebar />;
      case "student":
        return <StudentSidebar />;
      case "teacher":
        return <TeacherSidebar />;
      default:
        return null;
    }
  };

  const content = (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("advertisements.title")}</h1>
        <p className="text-muted-foreground">{t("advertisements.subtitle")}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : ads.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title={t("advertisements.emptyTitle")}
          description={t("advertisements.emptyDesc")}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ads.map((ad) => (
            <Card key={ad.id} className="overflow-hidden flex flex-col">
              <div className="relative aspect-video bg-muted">
                {ad.imageUrl ? (
                  <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Megaphone className="h-12 w-12 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <CardContent className="p-4 flex flex-col flex-1">
                <h3 className="font-semibold text-base mb-2 line-clamp-2">{ad.title}</h3>
                <div className="mt-auto pt-3 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    className="flex-1"
                    onClick={() => handleViewAd(ad)}
                  >
                    <Eye className="mr-1.5 h-4 w-4" />
                    {t("advertisements.viewDetails")}
                  </Button>
                  {ad.linkUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewAd(ad)}
                      title={t("advertisements.openLink")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      {renderSidebar()}
      <DashboardLayout>{content}</DashboardLayout>
    </>
  );
}
