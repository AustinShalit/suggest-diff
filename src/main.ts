import * as core from '@actions/core';
//import * as github from '@actions/github'
import parseDiff from 'parse-diff';
import getDiff from './git-diff';

async function run(): Promise<void> {
  try {
    //const token = core.getInput('token', {required: true});

    //const client = new github.GitHub(token);

    const diffString = getDiff(process.env['GITHUB_WORKSPACE']);
    const diff = parseDiff(await diffString);

    core.debug(JSON.stringify(diff));
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
