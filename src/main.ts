import * as core from '@actions/core';
import * as github from '@actions/github';
import parseDiff from 'parse-diff';
import getDiff from './git-diff';

async function run(): Promise<void> {
  try {
    if (github.context.eventName !== 'pull_request') {
      core.debug(`Skipping suggest diff because event ${github.context.eventName} is not "pull_request"`);
      return;
    }

    const token = core.getInput('token', {required: true});

    const prNumber = getPrNumber();
    if (!prNumber) {
      core.warning('Could not get pull request number from context, exiting');
      return;
    }

    const octokit = github.getOctokit(token);

    const diffString = getDiff(process.env['GITHUB_WORKSPACE']);
    const diff = parseDiff(await diffString);

    octokit.checks.create({
      ...github.context.repo,
      name: 'wpiformat',
      head_sha: github.context.sha,
      pull_number: github.context.issue.number,
      status: 'completed',
      conclusion: 'failure',
      output: {
        title: 'wpiformat',
        summary: 'wpiformat',
        annotations: [
          {
            path: diff[0].to || '',
            start_line: diff[0].chunks[0].newStart,
            end_line: diff[0].chunks[0].newStart + diff[0].chunks[0].newLines,
            annotation_level: 'failure',
            message: JSON.stringify(diff[0])
          }
        ]
      }
    });

    core.debug(JSON.stringify(diff));
  } catch (error) {
    core.error(error);
    core.setFailed(error.message);
  }
}

function getPrNumber(): number | undefined {
  const pullRequest = github.context.payload.pull_request;
  if (!pullRequest) {
    return undefined;
  }

  return pullRequest.number;
}

run();
