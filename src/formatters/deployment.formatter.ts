import type { DeploymentEventPayload, DeploymentStatusEventPayload } from '../types/github.js';
import type { FormattedMessage } from '../types/whatsapp.js';

export function formatDeploymentEvent(payload: DeploymentEventPayload): FormattedMessage {
  const repoName = payload.repository.full_name;
  const actor = payload.sender.login;
  const deployment = payload.deployment;

  const text =
    `> *[GITHUB // DEPLOYMENT CREATED]*\n` +
    `> *Repository:* ${repoName}\n` +
    `> *Environment:* \`${deployment.environment}\`\n\n` +
    `*Details:*\n` +
    `- *Creator:* ${actor}\n` +
    `- *Ref:* \`${deployment.ref}\`\n` +
    `- *SHA:* \`${deployment.sha.substring(0, 7)}\`\n` +
    (deployment.description ? `- *Description:* ${deployment.description}\n` : '') +
    `\n*Reference:*\n` +
    `${payload.repository.html_url}`;

  return {
    text,
    title: `[DEPLOYMENT] ${deployment.environment}`,
    subtitle: `${repoName} | Ref: ${deployment.ref}`,
    sourceUrl: payload.repository.html_url,
  };
}

export function formatDeploymentStatusEvent(payload: DeploymentStatusEventPayload): FormattedMessage {
  const repoName = payload.repository.full_name;
  const actor = payload.sender.login;
  const deployment = payload.deployment;
  const status = payload.deployment_status;
  const stateLabel = status.state.toUpperCase();

  const text =
    `> *[GITHUB // DEPLOYMENT STATUS]*\n` +
    `> *Repository:* ${repoName}\n` +
    `> *Environment:* \`${deployment.environment}\`\n\n` +
    `*Status:*\n` +
    `- *State:* \`${stateLabel}\`\n` +
    `- *Actor:* ${actor}\n` +
    (status.description ? `- *Description:* ${status.description}\n` : '') +
    (status.target_url ? `- *Target URL:* ${status.target_url}\n` : '') +
    `\n*Reference:*\n` +
    `${payload.repository.html_url}`;

  return {
    text,
    title: `[DEPLOY ${stateLabel}] ${deployment.environment}`,
    subtitle: `${repoName} | Ref: ${deployment.ref}`,
    sourceUrl: status.target_url || payload.repository.html_url,
  };
}
