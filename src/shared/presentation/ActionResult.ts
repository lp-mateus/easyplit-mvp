export type ActionResult<T = void> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: { message: string; fieldErrors?: Record<string, string[]> };
    };

export function actionSuccess<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function actionSuccessVoid(): ActionResult<void> {
  return { ok: true, data: undefined };
}

export function actionError(
  message: string,
  fieldErrors?: Record<string, string[]>
): ActionResult<never> {
  return { ok: false, error: { message, fieldErrors } };
}
