import { Router } from 'express';
import { Webhook } from 'svix';
import { prisma } from '../index.js';

const r = Router();

/**
 * Generate a unique username from email or name
 * Format: firstname_lastname_123 or email_123
 */
async function generateUniqueUsername(email, name) {
  let baseUsername = '';
  
  // Try to use name first
  if (name && name.trim()) {
    baseUsername = name.toLowerCase()
      .replace(/\s+/g, '_')  // Replace spaces with underscores
      .replace(/[^a-z0-9_]/g, '')  // Remove special characters
      .substring(0, 20);  // Limit length
  }
  
  // Fallback to email username
  if (!baseUsername && email) {
    baseUsername = email.split('@')[0]
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
      .substring(0, 20);
  }
  
  // Fallback to generic username
  if (!baseUsername) {
    baseUsername = 'user';
  }
  
  // Check if username exists, if so, add random number
  let username = baseUsername;
  let attempts = 0;
  
  while (attempts < 10) {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (!existing) {
      return username;
    }
    // Add random 3-digit number
    const randomNum = Math.floor(Math.random() * 900) + 100;
    username = `${baseUsername}_${randomNum}`;
    attempts++;
  }
  
  // Last resort: add timestamp
  return `${baseUsername}_${Date.now().toString().slice(-6)}`;
}

// Clerk webhook handler for syncing users to database
r.post('/clerk', async (req, res) => {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    
    if (!WEBHOOK_SECRET) {
      throw new Error('Missing CLERK_WEBHOOK_SECRET environment variable');
    }

    // Get the headers
    const svix_id = req.headers['svix-id'];
    const svix_timestamp = req.headers['svix-timestamp'];
    const svix_signature = req.headers['svix-signature'];

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res.status(400).json({ error: 'Missing svix headers' });
    }

    // Get the body
    const payload = req.body;
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your webhook secret
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt;

    // Verify the payload with the headers
    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      });
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return res.status(400).json({ error: 'Webhook verification failed' });
    }

    // Handle the webhook
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const eventType = evt.type;

    console.log(`Webhook event: ${eventType}`, id);

    if (eventType === 'user.created' || eventType === 'user.updated') {
      const email = email_addresses[0]?.email_address;
      const name = `${first_name || ''} ${last_name || ''}`.trim() || email?.split('@')[0];

      // Generate unique username for new users
      const username = await generateUniqueUsername(email, name);

      // Create or update user in database using Clerk ID as primary key
      const user = await prisma.user.upsert({
        where: { id: id }, // Use Clerk user ID as primary key
        update: {
          email,
          name,
          avatar: image_url,
        },
        create: {
          id: id, // Store Clerk user ID
          email,
          name,
          username,
          avatar: image_url,
          provider: 'clerk',
          providerId: id,
          role: 'student',
        },
      });

      console.log('User synced to database:', user.id);
    } else if (eventType === 'user.deleted') {
      // Delete user from database
      await prisma.user.delete({
        where: { id: id }
      }).catch(err => console.error('User deletion failed:', err));
      console.log('User deleted:', id);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default r;
