"use client";

import { useEffect, useState } from "react";
import { Card, Descriptions, Button, message, Spin } from "antd";
import { useRouter } from "next/navigation";
import api from "../lib/api";

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api.get("/user/profile")
      .then((res) => setProfile(res.data))
      .catch(() => {
        message.error("Not authenticated");
        router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await api.post("/auth/logout");
    message.success("Logged out");
    router.push("/login");
  };

  if (loading) return <Spin style={{ display: "block", marginTop: 100 }} />;

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: "0 auto" }}>
      <Card title="Dashboard" extra={<Button onClick={handleLogout}>Logout</Button>}>
        <Descriptions column={1}>
          <Descriptions.Item label="User ID">{profile?.userId}</Descriptions.Item>
          <Descriptions.Item label="Email">{profile?.email}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}