export type UpdateManifest = {
  version: string;
  buildNumber?: number;
  apkUrl?: string;
  releaseUrl?: string;
  forceUpdate?: boolean;
  changelog?: string[];
};

export type UpdateCheckResult =
  | {
      status: "available";
      manifest: UpdateManifest;
    }
  | {
      status: "current";
      manifest: UpdateManifest;
    };

export const UPDATE_MANIFEST_URL = "https://hackenleung.github.io/securevault-mobile/latest.json";

const normalizeVersion = (version: string) =>
  version
    .replace(/^v/i, "")
    .split(".")
    .map((part) => Number.parseInt(part, 10))
    .map((part) => (Number.isFinite(part) ? part : 0));

export const compareVersions = (nextVersion: string, currentVersion: string) => {
  const next = normalizeVersion(nextVersion);
  const current = normalizeVersion(currentVersion);
  const maxLength = Math.max(next.length, current.length);

  for (let index = 0; index < maxLength; index += 1) {
    const nextPart = next[index] ?? 0;
    const currentPart = current[index] ?? 0;

    if (nextPart > currentPart) return 1;
    if (nextPart < currentPart) return -1;
  }

  return 0;
};

const hasNewerBuild = (nextBuildNumber?: number, currentBuildNumber?: number) =>
  typeof nextBuildNumber === "number" &&
  typeof currentBuildNumber === "number" &&
  Number.isFinite(nextBuildNumber) &&
  Number.isFinite(currentBuildNumber) &&
  nextBuildNumber > currentBuildNumber;

const assertUpdateManifest = (value: unknown): UpdateManifest => {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid update manifest");
  }

  const manifest = value as Partial<UpdateManifest>;
  if (!manifest.version || typeof manifest.version !== "string") {
    throw new Error("Invalid update version");
  }

  return {
    version: manifest.version,
    buildNumber: manifest.buildNumber,
    apkUrl: manifest.apkUrl,
    releaseUrl: manifest.releaseUrl,
    forceUpdate: manifest.forceUpdate,
    changelog: Array.isArray(manifest.changelog) ? manifest.changelog.filter((item): item is string => typeof item === "string") : [],
  };
};

export const checkForUpdate = async (currentVersion: string, currentBuildNumber?: number): Promise<UpdateCheckResult> => {
  const response = await fetch(UPDATE_MANIFEST_URL, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Update manifest request failed: ${response.status}`);
  }

  const manifest = assertUpdateManifest(await response.json());
  const versionCompare = compareVersions(manifest.version, currentVersion);
  const hasUpdate = versionCompare > 0 || (versionCompare === 0 && hasNewerBuild(manifest.buildNumber, currentBuildNumber));

  return {
    status: hasUpdate ? "available" : "current",
    manifest,
  };
};
