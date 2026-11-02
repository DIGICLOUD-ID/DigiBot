import type { CreateEventPayload, DeleteEventPayload } from '../types/github.js';

export function formatCreateEvent(payload: CreateEventPayload): string {
  const repoName = payload.repository.full_name;
  const actor = payload.sender.login;
  const refType = payload.ref_type.toUpperCase();

  return (
    `> *[GITHUB // ${refType} CREATED]*\n` +
    `> *Repository:* ${repoName}\n` +
    `> *Ref:* \`${payload.ref}\`\n\n` +
    `*Details:*\n` +
    `- *Type:* ${refType}\n` +
    `- *Author:* ${actor}\n` +
    `- *Master Branch:* \`${payload.master_branch}\`\n\n` +
    `*Reference:*\n` +
    `${payload.repository.html_url}`
  );
}

export function formatDeleteEvent(payload: DeleteEventPayload): string {
  const repoName = payload.repository.full_name;
  const actor = payload.sender.login;
  const refType = payload.ref_type.toUpperCase();

  return (
    `> *[GITHUB // ${refType} DELETED]*\n` +
    `> *Repository:* ${repoName}\n` +
    `> *Ref:* \`${payload.ref}\`\n\n` +
    `*Details:*\n` +
    `- *Type:* ${refType}\n` +
    `- *Deleted by:* ${actor}\n\n` +
    `*Reference:*\n` +
    `${payload.repository.html_url}`
  );
}
