"use server";

/** Server-action result envelope */
export type ServerActionState<T> = {
  success: boolean;
  response?: T;
  error?: string;
};

/**
 * Helper for server actions to normalize success/error shape.
 */
export const envelopeServerAction = async <T>(
  action: () => Promise<T>
): Promise<ServerActionState<T>> => {
  try {
    const response = await action();
    return { success: true, response };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};
