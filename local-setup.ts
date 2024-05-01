import {
  packages,
  forPlatform,
  getHostPlatform,
  installTo,
  mapPlatform,
  cachedDownload,
  setAlias,
} from "https://deno.land/x/adllang_localsetup@v0.11/mod.ts";
import * as path from "https://deno.land/std@0.105.0/path/mod.ts";
import * as fs from "https://deno.land/std@0.105.0/fs/mod.ts";

const DENO = packages.deno("1.34.1");
// const ADL = packages.adl("1.2");
const NODE = packages.nodejs("16.13.0");
const YARN = packages.yarn("1.22.15");
const RADL = radlc("millergarym", "0.1.13");
const PNPM = pnpm("8.1.1");

export async function main() {
  if (Deno.args.length != 1) {
    console.error("Usage: local-setup LOCALDIR");
    Deno.exit(1);
  }
  const localdir = Deno.args[0];

  const platform = getHostPlatform();

  const installs = [
    forPlatform(RADL, platform),
    forPlatform(PNPM, platform),
    forPlatform(DENO, platform),
    // forPlatform(ADL, platform),
    forPlatform(NODE, platform),
    YARN,
  ];

  await installTo(installs, localdir);
}

main()
  .catch((err) => {
    console.error("error in main", err);
  });

// pnpm  binary
export function pnpm(version: string): MultiPlatform<Installable> {
  const urls: MultiPlatform<DownloadFile> = {
    linux_x86_64: {
      url:
        `https://github.com/pnpm/pnpm/releases/download/v${version}/pnpm-linux-x64`,
      cachedName: `pnpm-linux-x64_${version}`,
    },
    darwin_x86_64: {
      url:
        `https://github.com/pnpm/pnpm/releases/download/v${version}/pnpm-macos-x64`,
      cachedName: `pnpm-macos-x64_${version}`,
    },
  };

  function install(url: DownloadFile): Installable {
    return {
      manifestName: url.cachedName,
      install: async (localdir: string): Promise<void> => {
        const downloadFile = await cachedDownload(url);
        Deno.chmod(downloadFile, 0o770);
        console.log(`installing ${url.cachedName}`);
        const installdir = path.join(localdir, `bin`);
        const dest = path.join(installdir, "pnpm");
        Deno.copyFile(downloadFile, dest);
      },
      env: () => [
        setAlias("npm", "echo \"using pnpm\"; pnpm"),
        setAlias("yarn", "echo \"USE pnpm\!!!\""),
        setAlias("pn", "pnpm"),
      ],
    };
  }

  return mapPlatform(urls, install);
}


// Rust ADL tooling
export function radlc(gh_org: string, version: string): MultiPlatform<Installable> {
  const urls: MultiPlatform<DownloadFile> = {
    linux_x86_64: {
      url:
        `https://github.com/${gh_org}/adl/releases/download/rust%2Fcompiler%2Fv${version}/radlc-v${version}-linux`,
      cachedName: `radlc-${version}-linux`,
    },
    darwin_x86_64: {
      url:
        `https://github.com/${gh_org}/adl/releases/download/rust%2Fcompiler%2Fv${version}/radlc-v${version}-osx`,
      cachedName: `radlc-${version}-osx`,
    },
  };

  function install(url: DownloadFile): Installable {
    return {
      manifestName: url.cachedName,
      install: async (localdir: string): Promise<void> => {
        const downloadFile = await cachedDownload(url);
        Deno.chmod(downloadFile, 0o770);
        console.log(`installing ${url.cachedName}`);
        const installdir = path.join(localdir, `bin`)
        const dest = path.join(installdir, "radlc")
        Deno.copyFile(downloadFile, dest)
      },
      env: () => []
    }
  }

  return mapPlatform(urls, install);
}
