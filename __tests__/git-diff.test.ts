import getDiff from '../src/git-diff';

test('Error if path is not git dir', async () => {
  await expect(getDiff('/')).rejects.toThrowError();
});
