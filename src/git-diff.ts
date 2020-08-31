import * as exec from '@actions/exec';
import * as io from '@actions/io';

export default async function getDiff(directory = ''): Promise<string> {
  const stdout: string[] = [];

  const options = {
    cwd: directory,
    listeners: {
      stdout: (data: Buffer) => stdout.push(data.toString())
    }
  };

  const gitPath = await io.which('git', true);
  await exec.exec(`"${gitPath}"`, ['diff'], options);

  return stdout.join('');
}
