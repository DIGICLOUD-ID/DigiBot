import type { CreateEventPayload, DeleteEventPayload } from '../types/github.js';

export function formatCreateEvent(payload: CreateEventPayload): string {
  const repoName = payload.repository.full_name;
  const actor = payload.sender.login;
  const refType = payload.ref_type.toUpperCase();
  const icon = payload.ref_type === 'tag' ? '🏷️' : '🌿';

  return (
    `${icon} *${refType} CREATED*\n\n` +
    `📦 *Repository:* ${repoName}\n` +
    `👤 *Actor:* ${actor}\n` +
    `📌 *${payload.ref_type}:* \`${payload.ref}\`\n\n` +
    `🔗 *URL:* ${payload.repository.html_url}`
  );
}

export function formatDeleteEvent(payload: DeleteEventPayload): string {
  const repoName = payload.repository.full_name;
  const actor = payload.sender.login;
  const refType = payload.ref_type.toUpperCase();

  return (
    `🗑️ *${refType} DELETED*\n\n` +
    `📦 *Repository:* ${repoName}\n` +
    `👤 *Actor:* ${actor}\n` +
    `📌 *${payload.ref_type}:* \`${payload.ref}\`\n\n` +
    `🔗 *URL:* ${payload.repository.html_url}`
  );
}
