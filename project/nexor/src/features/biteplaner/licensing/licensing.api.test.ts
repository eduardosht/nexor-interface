import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../../lib/api';
import {
  fetchAccessOptions,
  signDentistLicensingContract,
  submitLabLicensingTest,
  updateDentistLicensingCourseProgress,
} from './licensing.api';

vi.mock('../../../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const apiGet = vi.mocked(api.get);
const apiPost = vi.mocked(api.post);

describe('licensing api module', () => {
  beforeEach(() => {
    apiGet.mockReset();
    apiPost.mockReset();
  });

  it('keeps licensing routes close to the licensing domain', async () => {
    apiGet.mockResolvedValue({});
    apiPost.mockResolvedValue({ workflow: { id: 'workflow-1' } });

    await fetchAccessOptions('tok');
    await signDentistLicensingContract('licensing', 'tok');
    await updateDentistLicensingCourseProgress('fundamentos', true, 'tok');
    await submitLabLicensingTest(['correta'], 'tok');

    expect(apiGet).toHaveBeenCalledWith('/v1/products/biteplaner/access-options', 'tok');
    expect(apiPost).toHaveBeenNthCalledWith(
      1,
      '/v1/account/biteplaner/dentist-licensing/contracts/licensing/sign',
      {},
      'tok',
    );
    expect(apiPost).toHaveBeenNthCalledWith(
      2,
      '/v1/account/biteplaner/dentist-licensing/course/progress',
      { contentId: 'fundamentos', completed: true },
      'tok',
    );
    expect(apiPost).toHaveBeenNthCalledWith(
      3,
      '/v1/account/biteplaner/lab-licensing/test/submit',
      { answers: ['correta'] },
      'tok',
    );
  });
});

