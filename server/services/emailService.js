const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Email template for booking confirmation
const createBookingEmailTemplate = (bookingData) => {
  const { user, show, seats, totalAmount, _id } = bookingData;
  const movie = show.movie;
  const theatre = show.theatre;
  
  // Format date and time
  const showDate = new Date(show.date).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
        .ticket-details { background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid #4CAF50; }
        .detail-row { margin: 10px 0; }
        .label { font-weight: bold; color: #555; }
        .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎬 Ticket Booking Confirmed!</h1>
        </div>
        <div class="content">
          <p>Dear ${user.name},</p>
          <p>Your ticket booking has been confirmed. Here are your booking details:</p>
          
          <div class="ticket-details">
            <div class="detail-row">
              <span class="label">Booking ID:</span> ${_id}
            </div>
            <div class="detail-row">
              <span class="label">Movie:</span> ${movie.title || 'N/A'}
            </div>
            <div class="detail-row">
              <span class="label">Theatre:</span> ${theatre.name || 'N/A'}
            </div>
            <div class="detail-row">
              <span class="label">Show Date:</span> ${showDate}
            </div>
            <div class="detail-row">
              <span class="label">Show Time:</span> ${show.time}
            </div>
            <div class="detail-row">
              <span class="label">Seats:</span> ${seats.sort((a, b) => a - b).join(', ')}
            </div>
            <div class="detail-row">
              <span class="label">Total Amount:</span> ₹${totalAmount}
            </div>
          </div>
          
          <p>Please arrive at the theatre 15 minutes before the show time.</p>
          <p>Thank you for booking with us!</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Ticket Booking Confirmed!
    
    Dear ${user.name},
    
    Your ticket booking has been confirmed. Here are your booking details:
    
    Booking ID: ${_id}
    Movie: ${movie.name || 'N/A'}
    Theatre: ${theatre.name || 'N/A'}
    Show Date: ${showDate}
    Show Time: ${show.time}
    Seats: ${seats.sort((a, b) => a - b).join(', ')}
    Total Amount: ₹${totalAmount}
    
    Please arrive at the theatre 15 minutes before the show time.
    Thank you for booking with us!
  `;

  return { html, text };
};

// Function to send booking confirmation email
const sendBookingConfirmationEmail = async (bookingData) => {
  try {
    // Check if email credentials are configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('Email credentials not configured. Skipping email send.');
      return { success: false, message: 'Email service not configured' };
    }

    const { user } = bookingData;
    
    if (!user || !user.email) {
      console.error('User email not found in booking data');
      return { success: false, message: 'User email not found' };
    }

    const { html, text } = createBookingEmailTemplate(bookingData);

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: user.email,
      subject: '🎬 Your Movie Ticket Booking Confirmation',
      text: text,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Booking confirmation email sent:', info.messageId);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    return { success: false, error: error.message };
  }
};

// Email template for password reset
const createPasswordResetEmailTemplate = (resetToken, userName) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5177'}/reset-password?token=${resetToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
        .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
        .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Dear ${userName},</p>
          <p>We received a request to reset your password for your MovieHub account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
          <div class="warning">
            <strong>⚠️ Important:</strong> This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.
          </div>
          <p>Thank you,<br>The MovieHub Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Password Reset Request
    
    Dear ${userName},
    
    We received a request to reset your password for your MovieHub account.
    
    Click the following link to reset your password:
    ${resetUrl}
    
    This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.
    
    Thank you,
    The MovieHub Team
  `;

  return { html, text };
};

// Function to send password reset email
const sendPasswordResetEmail = async (userEmail, userName, resetToken) => {
  try {
    // Check if email credentials are configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('Email credentials not configured. Skipping email send.');
      return { success: false, message: 'Email service not configured' };
    }

    if (!userEmail) {
      console.error('User email not provided');
      return { success: false, message: 'User email not provided' };
    }

    const { html, text } = createPasswordResetEmailTemplate(resetToken, userName);

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: userEmail,
      subject: '🔐 Reset Your MovieHub Password',
      text: text,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendBookingConfirmationEmail,
  sendPasswordResetEmail,
};


