import * as core from '@actions/core';
import * as github from '@actions/github';
import parseDiff from 'parse-diff';
import getDiff from './git-diff';

async function run(): Promise<void> {
  try {
    const token = core.getInput('token', {required: true});

    const prNumber = getPrNumber();
    if (!prNumber) {
      core.warning('Could not get pull request number from context, exiting');
      return;
    }

    const octokit = github.getOctokit(token);

    const diffString = getDiff(process.env['GITHUB_WORKSPACE']);
    const diff = parseDiff(await diffString);

    octokit.pulls.createReview({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      commit_id: github.context.sha,
      pull_number: github.context.issue.number,
      body: 'Please see these automated change suggestions',
      event: 'REQUEST_CHANGES'
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
