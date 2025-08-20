import { envelopeServerAction, ServerActionState } from '../utils';

describe('envelopeServerAction', () => {
  it('should return success state when action succeeds', async () => {
    const mockAction = jest.fn().mockResolvedValue('success-data');
    
    const result = await envelopeServerAction(mockAction);
    
    expect(result).toEqual({
      success: true,
      response: 'success-data'
    });
    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it('should return error state when action throws', async () => {
    const mockAction = jest.fn().mockRejectedValue(new Error('Test error'));
    
    const result = await envelopeServerAction(mockAction);
    
    expect(result).toEqual({
      success: false,
      error: 'Test error'
    });
    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it('should handle action that returns undefined', async () => {
    const mockAction = jest.fn().mockResolvedValue(undefined);
    
    const result = await envelopeServerAction(mockAction);
    
    expect(result).toEqual({
      success: true,
      response: undefined
    });
  });

  it('should handle action that returns null', async () => {
    const mockAction = jest.fn().mockResolvedValue(null);
    
    const result = await envelopeServerAction(mockAction);
    
    expect(result).toEqual({
      success: true,
      response: null
    });
  });

  it('should handle action that returns complex objects', async () => {
    const complexResponse = {
      id: 123,
      data: { nested: 'value' },
      array: [1, 2, 3],
      timestamp: new Date('2024-01-01')
    };
    const mockAction = jest.fn().mockResolvedValue(complexResponse);
    
    const result = await envelopeServerAction(mockAction);
    
    expect(result).toEqual({
      success: true,
      response: complexResponse
    });
  });

  it('should handle non-Error objects thrown', async () => {
    const mockAction = jest.fn().mockRejectedValue('string-error');
    
    const result = await envelopeServerAction(mockAction);
    
    expect(result).toEqual({
      success: false,
      error: undefined 
    });
  });

  it('should handle Error objects with custom properties', async () => {
    const customError = new Error('Custom error');
    (customError as any).code = 'CUSTOM_CODE';
    const mockAction = jest.fn().mockRejectedValue(customError);
    
    const result = await envelopeServerAction(mockAction);
    
    expect(result).toEqual({
      success: false,
      error: 'Custom error'
    });
  });

  it('should handle async action that takes time to resolve', async () => {
    const mockAction = jest.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve('delayed-result'), 10))
    );
    
    const result = await envelopeServerAction(mockAction);
    
    expect(result).toEqual({
      success: true,
      response: 'delayed-result'
    });
  });

  it('should handle async action that takes time to reject', async () => {
    const mockAction = jest.fn().mockImplementation(
      () => new Promise((_, reject) => setTimeout(() => reject(new Error('delayed-error')), 10))
    );
    
    const result = await envelopeServerAction(mockAction);
    
    expect(result).toEqual({
      success: false,
      error: 'delayed-error'
    });
  });
});

describe('ServerActionState type', () => {
  it('should allow valid success state', () => {
    const successState: ServerActionState<string> = {
      success: true,
      response: 'test-data'
    };
    
    expect(successState.success).toBe(true);
    expect(successState.response).toBe('test-data');
    expect(successState.error).toBeUndefined();
  });

  it('should allow valid error state', () => {
    const errorState: ServerActionState<string> = {
      success: false,
      error: 'test-error'
    };
    
    expect(errorState.success).toBe(false);
    expect(errorState.error).toBe('test-error');
    expect(errorState.response).toBeUndefined();
  });

  it('should allow state with only success property', () => {
    const minimalState: ServerActionState<string> = {
      success: true
    };
    
    expect(minimalState.success).toBe(true);
    expect(minimalState.response).toBeUndefined();
    expect(minimalState.error).toBeUndefined();
  });
});
