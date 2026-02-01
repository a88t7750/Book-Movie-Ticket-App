import React, { useState, useEffect } from 'react'
import { Button, Form, Input, message, Card, Typography } from "antd";
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { resetPassword } from '../calls/authCalls.js';
import { VideoCameraOutlined } from '@ant-design/icons';
import './Auth.css';

const { Title, Text } = Typography;

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const resetToken = searchParams.get('token');
    if (!resetToken) {
      message.error("Invalid reset link. Please request a new password reset.");
      navigate('/forgot-password');
    } else {
      setToken(resetToken);
    }
  }, [searchParams, navigate]);

  const onSubmit = async (values) => {
    if (!token) {
      message.error("Invalid reset token");
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(token, values.password);
      if (result.success) {
        message.success(result.message);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        message.error(result.message || "Failed to reset password");
      }
    } catch (error) {
      console.log(error.message);
      message.error("Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

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
            <Title level={2} className="auth-title">Reset Password</Title>
            <Text className="auth-subtitle">Enter your new password below</Text>

            <Form layout="vertical" onFinish={onSubmit} className="auth-form">
              <Form.Item
                label="New Password"
                name="password"
                rules={[
                  { required: true, message: "Password is required" },
                  { min: 6, message: "Password must be at least 6 characters" }
                ]}
              >
                <Input.Password
                  size="large"
                  placeholder="Enter your new password"
                  className="auth-input"
                />
              </Form.Item>

              <Form.Item
                label="Confirm Password"
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: "Please confirm your password" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('The two passwords do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  size="large"
                  placeholder="Confirm your new password"
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
                  Reset Password
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

export default ResetPassword


