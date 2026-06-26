import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../../lib/api';
import { fetchAccessOptions } from './licensing.api';

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

  it('keeps access options close to the licensing domain', async () => {
    apiGet.mockResolvedValue({});

    await fetchAccessOptions('tok');

    expect(apiGet).toHaveBeenCalledWith('/v1/products/biteplaner/access-options', 'tok');
    expect(apiPost).not.toHaveBeenCalled();
  });
});

