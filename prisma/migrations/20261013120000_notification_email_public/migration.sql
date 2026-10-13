-- Whether the practice publishes its Notification Email itself. Only a
-- public address is ever shown to visitors (the email button); a private
-- one is only used to forward contact form messages.
ALTER TABLE "Provider" ADD COLUMN "notificationEmailPublic" BOOLEAN NOT NULL DEFAULT false;
