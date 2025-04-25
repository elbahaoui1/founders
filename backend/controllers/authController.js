const supabase = require('../services/supabaseClient');

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    // Validate password
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const { data, error } = await supabase.auth.signUp({ 
      email: email.trim().toLowerCase(), 
      password,
      options: {
        emailRedirectTo: `${process.env.FRONTEND_URL}/verify-email`
      }
    });

    if (error) {
      console.error('Error during registration:', error);
      
      // Handle specific Supabase errors
      if (error.message.includes('already registered')) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      if (error.message.includes('password')) {
        return res.status(400).json({ error: 'Invalid password format' });
      }
      if (error.message.includes('email')) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      
      return res.status(400).json({ error: 'Registration failed' });
    }

    if (!data) {
      return res.status(500).json({ error: 'Registration failed - no data returned' });
    }

    res.status(201).json({ 
      message: 'User registered successfully. Please check your email to verify your account.', 
      user: {
        id: data.user.id,
        email: data.user.email,
        email_confirmed: data.user.email_confirmed_at !== null
      }
    });
  } catch (error) {
    console.error('Unexpected error in register:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    // Validate password
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Password is required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ 
      email: email.trim().toLowerCase(), 
      password 
    });

    if (error) {
      console.error('Error during login:', error);
      
      // Handle specific Supabase errors
      if (error.message.includes('Invalid login credentials')) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      if (error.message.includes('Email not confirmed')) {
        return res.status(401).json({ 
          error: 'Email not verified',
          message: 'Please verify your email before logging in. Check your inbox for the verification link.',
          code: 'EMAIL_NOT_VERIFIED'
        });
      }
      
      return res.status(401).json({ error: 'Login failed' });
    }

    if (!data || !data.session) {
      return res.status(500).json({ error: 'Login failed - no session returned' });
    }

    res.json({ 
      message: 'Login successful',
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
      },
      user: {
        id: data.user.id,
        email: data.user.email,
        email_confirmed: data.user.email_confirmed_at !== null
      }
    });
  } catch (error) {
    console.error('Unexpected error in login:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${process.env.FRONTEND_URL}/verify-email`
      }
    });

    if (error) {
      console.error('Error resending verification:', error);
      
      if (error.message.includes('already confirmed')) {
        return res.status(400).json({ error: 'Email is already verified' });
      }
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: 'Email not found' });
      }
      
      return res.status(400).json({ error: 'Failed to resend verification email' });
    }

    res.json({ 
      message: 'Verification email sent successfully. Please check your inbox.',
      email: email
    });
  } catch (error) {
    console.error('Unexpected error in resendVerification:', error);
    res.status(500).json({ error: 'Internal server error while resending verification' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token_hash, type } = req.query;

    if (!token_hash || !type) {
      return res.status(400).json({ error: 'Invalid verification link' });
    }

    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type
    });

    if (error) {
      console.error('Error verifying email:', error);
      
      if (error.message.includes('expired')) {
        return res.status(400).json({ 
          error: 'Verification link expired',
          message: 'Please request a new verification link',
          code: 'VERIFICATION_EXPIRED'
        });
      }
      if (error.message.includes('invalid')) {
        return res.status(400).json({ 
          error: 'Invalid verification link',
          message: 'The verification link is invalid or has already been used',
          code: 'INVALID_VERIFICATION'
        });
      }
      
      return res.status(400).json({ error: 'Email verification failed' });
    }

    res.json({ 
      message: 'Email verified successfully',
      user: {
        id: data.user.id,
        email: data.user.email,
        email_confirmed: true
      }
    });
  } catch (error) {
    console.error('Unexpected error in verifyEmail:', error);
    res.status(500).json({ error: 'Internal server error during email verification' });
  }
};
