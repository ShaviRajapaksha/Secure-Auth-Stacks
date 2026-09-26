"use client"

import { Button, Card, Form, Input, message, Typography } from "antd"
import { useState } from "react";
import api from "../lib/api";
import { useRouter } from "next/navigation";

const { Title } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const onFinish = async (values: {email: string; password: string}) => {
    setLoading(true);
    try {
        await api.post("auth/login", values);
        message.success("Login successful")
        router.push("/dashboard");
    } catch (err: any) {
        message.error(err.response?.data.message || "Login failed");
    } finally {
        setLoading(false);
    }
  }
  return (
    <div style={{display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f0f2f5"}}>
        <Card style={{width: 400}}>
            <Title level={3} style={{textAlign: "center"}}> Sign In</Title>
            <Form onFinish={onFinish} layout="vertical">
                <Form.Item name="email" rules={[{ required: true, type: "email", message: "Valid email required"}]}>
                    <Input placeholder="Email" size="large" />
                </Form.Item>
                <Form.Item name="password" rules={[{ required: true, min: 6, message: "At least 6 characters"}]}>
                    <Input.Password placeholder="Password" size="large" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block size="large">
                        Login
                    </Button>
                </Form.Item>
            </Form>
        </Card>
      
    </div>
  )
}
