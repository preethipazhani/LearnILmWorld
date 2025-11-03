import express from 'express';
import { sendEmail } from '../utils/sendEmail.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();



// Register
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      profile: {
        education,
        teachingExperienceDetails,
        certifications,
        dob,
        bio,
        resume,
        phone
      } = {}
    } = req.body;


    // CountDown for Re registration
    const COOLDOWN_MS = 2 * 60 * 1000; // 2 mins for testing, later 6 months ~ 6*30*24*60*60*1000

    let existingUser = await User.findOne({ email });

    if (existingUser) {
      // Trainer re-registration logic
      if (
        existingUser.role === 'trainer' &&
        existingUser.profile.verificationStatus === 'rejected'
      ) {
        const now = new Date();
        const rejectionTime = existingUser.profile.rejectionDate || now;
        if (now - rejectionTime < COOLDOWN_MS) {
          return res.status(400).json({
            message:
              'You can re-register only after the cooldown period. Please wait a few minutes for testing.',
          });
        }

        // Reset trainer data for re-registration
        // Allow trainer to re-register with their own password
        // Reset trainer data for re-registration
        existingUser.password = password;
        existingUser.profile.education =
          education || req.body.profile?.education || '';
        existingUser.profile.teachingExperienceDetails =
          teachingExperienceDetails ||
          req.body.profile?.teachingExperienceDetails ||
          '';
        existingUser.profile.certifications = Array.isArray(
          certifications || req.body.profile?.certifications
        )
          ? certifications || req.body.profile?.certifications
          : [];
        existingUser.profile.phone =
          phone || req.body.profile?.phone || ''; // ✅ added phone reset
        existingUser.profile.verificationStatus = 'pending';
        existingUser.profile.rejectionDate = null;

        await existingUser.save();
        sendTrainerVerificationEmail(existingUser);
        return res.status(200).json({
          message: 'You have re-registered successfully. Awaiting verification.',
          user: existingUser,
        });
      } else {
        return res.status(400).json({ message: 'User already exists' });
      }
    }

    // For new User Registration

    const userData = {
      name,
      email,
      password,
      role,
      profile: {}
    };


    // ✅ Use extracted or nested values safely
    const edu = education || req.body.profile?.education || '';
    const exp =
      teachingExperienceDetails || req.body.profile?.teachingExperienceDetails || '';
    const certs = certifications || req.body.profile?.certifications || [];

    // for preventing malisious creation of admin
    const allowedRoles = ['student', 'trainer'];
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: 'Invalid role' });
    }



    // If trainer, attach verification-related data
    if (role === 'trainer') {
      userData.profile = {
        education: edu,
        teachingExperienceDetails: exp,
        experience: parseInt(exp) || 0,
        certifications: Array.isArray(certs)
          ? certs.map(cert => ({
            ...cert,
            issueYear: cert.issuedDate ? new Date(cert.issuedDate).getFullYear() : null,
          }))
          : [],
        dob: dob || null,
        bio: bio || '',
        resume: resume || '',
        phone: phone || '',
        verificationStatus: 'pending'
      };
    } else if (role === 'student') {
      userData.profile = {
        phone: phone || '',  // store student’s phone number
      };
    }



    if (userData.profile?.certifications?.length) {
      userData.profile.certifications = userData.profile.certifications.map(cert => ({
        ...cert,
        certificateImage:
          typeof cert.certificateImage === 'string'
            ? cert.certificateImage
            : '',
      }));
    }

    const user = new User(userData);
    await user.save();

    if (role === 'trainer') {
      sendTrainerVerificationEmail(user);

      // Optionally clear resume after sending mail
      user.profile.resume = '';
      await user.save();
    }
    // sends e-mail using helper

    // JWT token for immediate use (optional, can skip for trainer)
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );


    res.status(201).json({
      message: role === 'trainer'
        ? 'Trainer registered successfully. Awaiting verification.'
        : 'User registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Helper to send email to admin for trainer verification
const sendTrainerVerificationEmail = async (user) => {
  // Prepare certifications list in HTML
  const certList = (user.profile.certifications || [])
    .map(
      (c, i) =>
        `<p>
        <b>${i + 1}.</b> ${c.name} <br>
        <b>Issuer:</b> ${c.issuer || 'N/A'} <br>
        <b>Link:</b> ${c.certificateLink || 'No link'} <br>
        <b>Issued Date:</b> ${c.issuedDate ? new Date(c.issuedDate).toLocaleDateString() : 'N/A'}
        </p>`
    )
    .join('');

  const verifyToken = jwt.sign(
    { trainerId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  const approveLink = `${process.env.FRONTEND_URL}/api/auth/verify-trainer/${verifyToken}?action=approve`;
  const rejectLink = `${process.env.FRONTEND_URL}/api/auth/verify-trainer/${verifyToken}?action=reject`;

  const htmlBody = `
    <h2>Trainer Registration - Verification Required</h2>
    <p><b>Name:</b> ${user.name}</p>
    <p><b>Email:</b> ${user.email}</p>
    <p><b>Phone:</b> ${user.profile.phone || 'N/A'}</p>
    <p><b>Education:</b> ${user.profile.education}</p>
    <p><b>Teaching Experience:</b> ${user.profile.teachingExperienceDetails}</p>
    <p><b>Date of Birth:</b> ${user.profile.dob ? new Date(user.profile.dob).toLocaleDateString() : 'N/A'}</p>
    <p><b>Bio:</b> ${user.profile.bio || 'N/A'}</p>
    <h3>Certifications:</h3>
    ${certList || '<p>No certificates provided</p>'}
    <p>Click below to verify or reject:</p>
    <a href="${approveLink}" style="color: green;">✅ Approve Trainer</a><br>
    <a href="${rejectLink}" style="color: red;">❌ Reject Trainer</a>
  `;

  // Prepare attachments array
  const attachments = [];

  // Attach resume if present
  if (user.profile.resume) {
    attachments.push({
      filename: 'resume.pdf', // or detect extension dynamically
      content: user.profile.resume.split(',')[1] || user.profile.resume, // handle base64 string
      encoding: 'base64'
    });
  }

  // Attach certificate images if present
  (user.profile.certifications || []).forEach((cert, idx) => {
    if (cert.certificateImage) {
      attachments.push({
        filename: `certificate_${idx + 1}.png`, // or detect extension
        content: cert.certificateImage.split(',')[1] || cert.certificateImage,
        encoding: 'base64'
      });
    }
  });

  // Send email with attachments
  await sendEmail({
    to: process.env.ADMIN_VERIFICATION_EMAIL,
    subject: 'Trainer Verification Required',
    html: htmlBody,
    attachments
  });
};


// End of helper

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    //for admin
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        { role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      return res.json({
        token,
        user: {
          id: 'admin_static_id',
          name: 'Super Admin',
          email,
          role: 'admin'
        }
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Block unverified trainers
    if (user.role === 'trainer') {
      if (user.profile.verificationStatus === 'pending') {
        return res.status(403).json({
          message: 'Your account verification is still pending. Please wait until it is approved.'
        });
      }
      if (user.profile.verificationStatus === 'rejected') {
        return res.status(403).json({
          message: 'Your account verification was rejected. You may reapply after 6 months from your previous registration.'
        });
      }
    }


    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    profile: req.user.profile,
    stats: req.user.stats
  });
});



// ---------------- FORGOT PASSWORD ----------------
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'No account found with this email' });
    }

    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' } // token valid for 15 minutes
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const htmlBody = `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password. This link will expire in 15 minutes.</p>
      <a href="${resetLink}" style="color:blue;">Reset Password</a>
      <p>If you didn't request this, ignore this email.</p>
    `;

    await sendEmail({
      to: email,
      subject: 'Password Reset',
      html: htmlBody
    });

    res.json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Something went wrong, try again later.' });
  }
});

// ---------------- RESET PASSWORD ----------------
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password reset successful! You can now log in.' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Invalid or expired token' });
  }
});


// ---------- VERIFY TRAINER VIA EMAIL LINK ---------------
router.get('/verify-trainer/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { action } = req.query; // approve or reject

    // Decode and verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const trainerId = decoded.trainerId;

    const trainer = await User.findById(trainerId);
    if (!trainer) return res.status(404).send('Trainer not found');

    if (trainer.profile.verificationStatus !== 'pending') {
      return res.status(400).send('Trainer already verified or rejected');
    }

    if (action === 'approve') {
      trainer.profile.verificationStatus = 'verified';
      await trainer.save();

      // Send approval email to trainer
      const htmlBody1 = `
        <h2>Congratulations, ${trainer.name}!</h2>
        <p>Your documents have been verified successfully.</p>
        <p>You can now log in using your registered email and password.</p>
      `;

      await sendEmail({
        to: trainer.email,
        subject: 'Trainer Verification Approved',
        html: htmlBody1
      });

      return res.send(`
        <html>
          <head>
            <title>Trainer Verified</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f0f4f8; }
              .container { background: white; padding: 30px; border-radius: 10px; display: inline-block; }
              h1 { color: green; }
              a { color: #007bff; text-decoration: none; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>✅ Trainer Verified!</h1>
              <p>${trainer.name} has been successfully approved.</p>
            </div>
          </body>
        </html>
      `);
    }

    if (action === 'reject') {
      trainer.profile.verificationStatus = 'rejected';
      trainer.profile.rejectionDate = new Date();
      // set rejection date
      await trainer.save();

      // Send rejection email
      const htmlBody1 = `
        <h2>Hello ${trainer.name},</h2>
        <p>Unfortunately, your trainer verification has been rejected.</p>
        <p>Please review your submitted details and try again after cooldown period of 6 months.</p>
      `;

      await sendEmail({
        to: trainer.email,
        subject: 'Trainer Verification Rejected',
        html: htmlBody1
      });

      return res.send(`
        <html>
          <head>
            <title>Trainer Rejected</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f0f4f8; }
              .container { background: white; padding: 30px; border-radius: 10px; display: inline-block; }
              h1 { color: green; }
              a { color: #007bff; text-decoration: none; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>❌ Trainer Rejected!</h1>
              <p>${trainer.name}  has been successfully rejected and notified..</p>
            </div>
          </body>
        </html>
      `);
    }

    res.status(400).send('Invalid action');
  } catch (error) {
    console.error('Verification link error:', error);
    res.status(400).send('Invalid or expired link');
  }
});

export default router;
