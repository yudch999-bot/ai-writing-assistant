import { useCopy } from '../lib/useCopy';
import { renderHook, act } from '@testing-library/react';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe('useCopy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should start with empty copiedText', () => {
    const { result } = renderHook(() => useCopy());
    expect(result.current.copiedText).toBe('');
  });

  it('should copy text and set copiedText', async () => {
    const { result } = renderHook(() => useCopy());

    await act(async () => {
      await result.current.copy('hello world');
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hello world');
    expect(result.current.copiedText).toBe('已复制');
  });

  it('should clear copiedText after 2 seconds', async () => {
    const { result } = renderHook(() => useCopy());

    await act(async () => {
      await result.current.copy('test');
    });

    expect(result.current.copiedText).toBe('已复制');

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(result.current.copiedText).toBe('');
  });

  it('should show custom label when provided', async () => {
    const { result } = renderHook(() => useCopy());

    await act(async () => {
      await result.current.copy('test', '已复制到剪贴板');
    });

    expect(result.current.copiedText).toBe('已复制到剪贴板');
  });
});
