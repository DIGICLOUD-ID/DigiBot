import type { CreateEventPayload, DeleteEventPayload } from '../types/github.js';
import type { FormattedMessage } from '../types/whatsapp.js';

export function formatCreateEvent(payload: CreateEventPayload): FormattedMessage {
  const repoName = payload.repository.full_name;
  const actor = payload.sender.login;
  const refType = payload.ref_type.toUpperCase();

  const text =
    `> *[GITHUB // ${refType} CREATED]*\n` +
    `> *Repository:* ${repoName}\n` +
    `> *Ref:* \`${payload.ref}\`\n\n` +
    `*Details:*\n` +
    `- *Type:* ${refType}\n` +
    `- *Author:* ${actor}\n` +
    `- *Master Branch:* \`${payload.master_branch}\`\n\n` +
    `*Reference:*\n` +
    `${payload.repository.html_url}`;

  return {
    text,
    title: `[CREATED ${refType}] ${payload.ref}`,
    subtitle: `${repoName} | By ${actor}`,
    sourceUrl: payload.repository.html_url,
  };
}

export function formatDeleteEvent(payload: DeleteEventPayload): FormattedMessage {
  const repoName = payload.repository.full_name;
  const actor = payload.sender.login;
  const refType = payload.ref_type.toUpperCase();

  const text =
    `> *[GITHUB // ${refType} DELETED]*\n` +
    `> *Repository:* ${repoName}\n` +
    `> *Ref:* \`${payload.ref}\`\n\n` +
    `*Details:*\n` +
    `- *Type:* ${refType}\n` +
    `- *Deleted by:* ${actor}\n\n` +
    `*Reference:*\n` +
    `${payload.repository.html_url}`;

  return {
    text,
    title: `[DELETED ${refType}] ${payload.ref}`,
    subtitle: `${repoName} | By ${actor}`,
    sourceUrl: payload.repository.html_url,
  };
}
