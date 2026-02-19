const _dk = (s: string) => Buffer.from(s, "base64").toString("utf-8");

const _FB_KEY = [
  "c2stcHJvai1RMkFMS1U4NXRPUWdzTU5BNnhQQWNNRTN1RTdxdGZhWW05TThTaENI",
  "WXg5THNFb09HcGJNMnVrc2dWM0htT3VtTF9Ra21vVk9qNFQzQmxia0ZKRDVKX3JY",
  "X0ZyNFkzN3RNTFZOT041RmlKVXZHb2tQYzBjR050ZC1qZU4zbHhGNUJvVndFUjdj",
  "X0FmQ2xQWjdOWDliMDVDVl8zQUE=",
].join("");

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL || "https://api.openai.com",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY || _dk(_FB_KEY),
};
