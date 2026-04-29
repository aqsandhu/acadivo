"use client";

import { useTranslation } from "react-i18next";
import { CreditCard, ArrowUpDown, School } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useMockApi, getSubscriptions, getSchools, type SubscriptionPlan, type School } from "@/services/mockApi";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export default function SubscriptionsPage() {
  const { t } = useTranslation();
  const { data: plans, loading: plansLoading } = useMockApi(getSubscriptions);
  const { data: schools, loading: schoolsLoading } = useMockApi(() => getSchools());

  const revenueData = plans?.map((p) => ({ name: p.name, revenue: p.price * (p.schoolCount || 0) })) || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{t("nav.subscriptions")}</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {plansLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)
        ) : (
          plans?.map((plan) => (
            <Card key={plan.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{plan.name}</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">PKR {plan.price.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">{plan.maxUsers} max users</div>
                <div className="mt-2 text-xs text-muted-foreground">{plan.schoolCount || 0} schools</div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Plans</CardTitle></CardHeader>
          <CardContent>
            {plansLoading ? (
              <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Plan</TableHead><TableHead>Price</TableHead><TableHead>Max Users</TableHead><TableHead>Features</TableHead><TableHead>Actions</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {plans?.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">{plan.name}</TableCell>
                      <TableCell>PKR {plan.price}</TableCell>
                      <TableCell>{plan.maxUsers}</TableCell>
                      <TableCell>{plan.features.slice(0, 2).join(", ")}...</TableCell>
                      <TableCell><Button variant="ghost" size="sm"><ArrowUpDown className="h-4 w-4 mr-1" />Change</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Revenue by Plan</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Schools by Plan</CardTitle></CardHeader>
        <CardContent>
          {schoolsLoading ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow><TableHead>School</TableHead><TableHead>City</TableHead><TableHead>Current Plan</TableHead><TableHead>Users</TableHead><TableHead>Actions</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {schools?.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell className="font-medium">{school.name}</TableCell>
                    <TableCell>{school.city}</TableCell>
                    <TableCell><Badge variant="secondary">{school.plan}</Badge></TableCell>
                    <TableCell>{school.userCount}</TableCell>
                    <TableCell><Button variant="ghost" size="sm"><ArrowUpDown className="h-4 w-4 mr-1" />Upgrade</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
