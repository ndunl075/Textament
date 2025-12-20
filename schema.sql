-- Create subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL UNIQUE,
  active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index on phone_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscribers_phone_number ON subscribers(phone_number);

-- Create index on active for faster filtering
CREATE INDEX IF NOT EXISTS idx_subscribers_active ON subscribers(active);

-- Enable Row Level Security (RLS)
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert subscribers (for the subscription form)
CREATE POLICY "Allow public inserts"
  ON subscribers
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow service role to manage subscribers (for cron job)
CREATE POLICY "Service role can manage subscribers"
  ON subscribers
  FOR ALL
  USING (auth.role() = 'service_role');

