"use client"

import { Button, Card, Form, Input, message, Typography } from "antd"
import { useRouter } from "next/navigation";

const { Title } = Typography;

import React, { useState } from 'react'
import api from "../lib/api";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: {email: string; password: string}) => {
    setLoading(true);
    try {
        await api.post("/auth/register", values);
        message.success("Registration successfull, please login");
        router.push("/login");
    } catch (err: any) {
        message.error(err.response?.data?.message || "Registration failed");
    } finally {
        setLoading(false);
    }
  }
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f0f2f5"}}>      
        <Card style={{width: 400}}>
            <Title level={3} style={{textAlign: "center"}}>Create Account</Title>
            <Form onFinish={onFinish} layout="vertical">
                <Form.Item name="email" rules={[{required:true, type:"email"}]}>
                    <Input placeholder="Email" size="large"/>
                </Form.Item>
                <Form.Item name="password" rules={[{required:true, min:6}]}>
                    <Input.Password placeholder="Password" size="large" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block size="large">
                        Register
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    </div>
  )
}
