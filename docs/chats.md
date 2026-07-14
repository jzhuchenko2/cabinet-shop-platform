# Chats

The chat MVP gives every signed-in shop user access to `/chats`.

## Scope

- Direct messages between two users in the same organization.
- Group chats with a custom title and selected shop users.
- Conversation unread counts based on each participant's `lastReadAt`.
- Message notifications are stored as `Notification` rows with type `CHAT_MESSAGE`.
- The chat workspace refreshes every five seconds while the browser tab is visible.

## Permissions

All active shop roles receive the `view_chats` permission. Settings remain manager-only through `view_settings`.

## Data model

Chats use three Prisma models:

- `Conversation` stores organization, creator, title, and direct/group type.
- `ConversationParticipant` links users to conversations and tracks read state.
- `ChatMessage` stores message body, sender, and timestamp.

## Notes

This is intentionally simple for the MVP. It uses short polling instead of a dedicated websocket/Supabase realtime channel, which keeps the feature deployable without adding another moving part. A later pass can subscribe to `ChatMessage` changes through Supabase Realtime for instant delivery.
