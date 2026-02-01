import React, { useState } from 'react'
import { Button, Form, Input, message, Card, Typography } from "antd";
import { Link } from "react-router-dom"
import { forgotPassword } from '../calls/authCalls.js';
import { VideoCameraOutlined } from '@ant-design/icons';
import './Auth.css';

const { Title, Text } = Typography;

function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const result = await forgotPassword(values.email);
      if (result.success) {
        message.success(result.message);
        setEmailSent(true);
      } else {
        message.error(result.message || "Failed to send reset email");
      }
    } catch (error) {
      console.log(error.message);
      message.error("Failed to request password reset");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-left">
            <div className="auth-brand">
              <VideoCameraOutlined className="brand-icon" />
              <Title level={1} className="brand-title">MovieHub</Title>
              <Text className="brand-subtitle">Your Gateway to Cinematic Excellence</Text>
            </div>
          </div>

          <div className="auth-right">
            <Card className="auth-card">
              <Title level={2} className="auth-title">Check Your Email</Title>
              <Text className="auth-subtitle">
                We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.
              </Text>
              <div style={{ marginTop: '32px' }}>
                <Text>
                  Didn't receive the email? Check your spam folder or{' '}
                  <Link to="/forgot-password" className="auth-link" onClick={() => setEmailSent(false)}>
                    try again
                  </Link>
                </Text>
              </div>
              <div className="auth-footer" style={{ marginTop: '24px' }}>
                <Text>
                  <Link to="/login" className="auth-link">Back to Sign In</Link>
                </Text>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-brand">
            <VideoCameraOutlined className="brand-icon" />
            <Title level={1} className="brand-title">MovieHub</Title>
            <Text className="brand-subtitle">Your Gateway to Cinematic Excellence</Text>
          </div>
        </div>

        <div className="auth-right">
          <Card className="auth-card">
            <Title level={2} className="auth-title">Forgot Password?</Title>
            <Text className="auth-subtitle">Enter your email address and we'll send you a link to reset your password</Text>

            <Form layout="vertical" onFinish={onSubmit} className="auth-form">
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Email is required" },
                  { type: 'email', message: "Please enter a valid email" }
                ]}
              >
                <Input
                  size="large"
                  placeholder="Enter your email"
                  className="auth-input"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  block
                  htmlType="submit"
                  size="large"
                  className="auth-button"
                  loading={loading}
                >
                  Send Reset Link
                </Button>
              </Form.Item>
            </Form>

            <div className="auth-footer">
              <Text>Remember your password? <Link to="/login" className="auth-link">Sign in</Link></Text>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword


