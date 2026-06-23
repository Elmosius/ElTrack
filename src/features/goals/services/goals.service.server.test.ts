import { describe, expect, it, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  findKantongByIdsAndUserId: vi.fn(),
  insertSavingGoal: vi.fn(),
  updateSavingGoalById: vi.fn(),
  deleteSavingGoalByIdAndUserId: vi.fn(),
  findSavingGoalListByUserId: vi.fn(),
  getKantongPageDataService: vi.fn(),
}));

vi.mock('#/features/kantong/repositories/kantong.repository.server', () => ({
  findKantongByIdsAndUserId: mocks.findKantongByIdsAndUserId,
}));

vi.mock('#/features/kantong/services/kantong.service.server', () => ({
  getKantongPageDataService: mocks.getKantongPageDataService,
}));

vi.mock('../repositories/goals.repository.server', () => ({
  deleteSavingGoalByIdAndUserId: mocks.deleteSavingGoalByIdAndUserId,
  findSavingGoalListByUserId: mocks.findSavingGoalListByUserId,
  insertSavingGoal: mocks.insertSavingGoal,
  updateSavingGoalById: mocks.updateSavingGoalById,
}));

import {
  createSavingGoalService,
  deleteSavingGoalService,
  updateSavingGoalService,
} from './goals.service.server';

const goalInput = {
  nama: 'Dana Investasi',
  media: 'Reksadana',
  kantong: '507f1f77bcf86cd799439011',
  targetAmount: 10_000_000,
};

function createGoalDoc(overrides: Record<string, unknown> = {}) {
  return {
    toObject: () => ({
      _id: '507f1f77bcf86cd799439012',
      userId: 'user-1',
      ...goalInput,
      ...overrides,
    }),
  };
}

describe('goals service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects create when kantong does not belong to user', async () => {
    mocks.findKantongByIdsAndUserId.mockResolvedValue([]);

    await expect(createSavingGoalService('user-1', goalInput)).rejects.toThrow(
      'Kantong tidak ditemukan.',
    );
    expect(mocks.insertSavingGoal).not.toHaveBeenCalled();
  });

  it('creates goals with the active user id after kantong validation', async () => {
    mocks.findKantongByIdsAndUserId.mockResolvedValue([{ _id: goalInput.kantong }]);
    mocks.insertSavingGoal.mockResolvedValue(createGoalDoc());

    await createSavingGoalService('user-1', goalInput);

    expect(mocks.insertSavingGoal).toHaveBeenCalledWith('user-1', goalInput);
  });

  it('updates goals using the active user id', async () => {
    mocks.findKantongByIdsAndUserId.mockResolvedValue([{ _id: goalInput.kantong }]);
    mocks.updateSavingGoalById.mockResolvedValue(createGoalDoc());

    await updateSavingGoalService('user-1', {
      id: '507f1f77bcf86cd799439012',
      ...goalInput,
    });

    expect(mocks.updateSavingGoalById).toHaveBeenCalledWith('user-1', {
      id: '507f1f77bcf86cd799439012',
      ...goalInput,
    });
  });

  it('rejects update when goal is not found for active user', async () => {
    mocks.findKantongByIdsAndUserId.mockResolvedValue([{ _id: goalInput.kantong }]);
    mocks.updateSavingGoalById.mockResolvedValue(null);

    await expect(
      updateSavingGoalService('user-1', {
        id: '507f1f77bcf86cd799439012',
        ...goalInput,
      }),
    ).rejects.toThrow('Goal tidak ditemukan.');
  });

  it('deletes goals using the active user id', async () => {
    mocks.deleteSavingGoalByIdAndUserId.mockResolvedValue({ _id: 'goal-1' });

    await deleteSavingGoalService('user-1', {
      id: '507f1f77bcf86cd799439012',
    });

    expect(mocks.deleteSavingGoalByIdAndUserId).toHaveBeenCalledWith('user-1', {
      id: '507f1f77bcf86cd799439012',
    });
  });
});
