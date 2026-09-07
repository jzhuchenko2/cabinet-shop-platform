# Chats

The chat MVP gives every signed-in shop user access to `/chats`.

## Scope

- Direct messages between two users in the same organization.
- Group chats with a custom title and selected shop users.
- Project group chats can be associated to a specific active project so project decisions and install/delivery updates stay connected to the job.
- Conversation unread counts based on each participant's `lastReadAt`.
- Message notifications are stored as `Notification` rows with type `CHAT_MESSAGE`.
- The chat workspace refreshes every five seconds while the browser tab is visible.

## Appearance

Chats uses the shared palette from `app/globals.css`: orange actions, unread
badges, and outgoing messages; charcoal avatars; warm neutral panels and
incoming messages; and the platform's standard border and muted text colors.
Orange surfaces use dark text and icons for readability. Selected conversations
have a soft orange background and an orange edge, and keyboard focus uses the
shared orange focus ring. The primary button hover color is shared with other
pages through `--accent-hover`.

The conversation header uses the available thread width so names do not get
truncated into a narrow column. Desktop columns can shrink for smaller screens,
while the existing single-pane mobile layout is preserved.

## Permissions

All active shop roles receive the `view_chats` permission. Settings remain manager-only through `view_settings`.

## Data model

Chats use three Prisma models:

- `Conversation` stores organization, creator, optional project, title, and direct/group type.
- `ConversationParticipant` links users to conversations and tracks read state.
- `ChatMessage` stores message body, sender, and timestamp.

## Notes

This is intentionally simple for the MVP. It uses short polling instead of a dedicated websocket/Supabase realtime channel, which keeps the feature deployable without adding another moving part. A later pass can subscribe to `ChatMessage` changes through Supabase Realtime for instant delivery.
