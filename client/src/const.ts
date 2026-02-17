export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Local login — always redirect to /login page (no Manus OAuth)
export const getLoginUrl = (returnPath?: string) => {
  if (returnPath) {
    return `/login?returnTo=${encodeURIComponent(returnPath)}`;
  }
  return "/login";
};
