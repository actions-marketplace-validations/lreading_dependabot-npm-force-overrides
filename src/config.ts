export type ActionConfig = {
  readonly githubToken: string;
  readonly dryRun: boolean;
  readonly packageRoots: readonly string[];
  readonly skipLabel?: string;
};

export type InputReader = {
  readonly getInput: (name: string) => string;
  readonly getBooleanInput: (name: string) => boolean;
};

export function createDefaultConfig(): ActionConfig {
  return {
    githubToken: '',
    dryRun: false,
    packageRoots: [],
  };
}

export function parseActionConfig(inputs: InputReader): ActionConfig {
  const defaults = createDefaultConfig();
  const githubTokenInput = readOptionalInput(inputs, 'github-token');
  const githubToken = githubTokenInput === '' ? (process.env.GITHUB_TOKEN ?? '') : githubTokenInput;
  const skipLabel = readOptionalInput(inputs, 'skip-label');

  return {
    githubToken,
    dryRun: readBooleanInput(inputs, 'dry-run', defaults.dryRun),
    packageRoots: parseListInput(readOptionalInput(inputs, 'package-roots')) ?? [],
    ...(skipLabel === '' ? {} : { skipLabel }),
  };
}

function readOptionalInput(inputs: InputReader, name: string): string {
  return inputs.getInput(name).trim();
}

function readBooleanInput(inputs: InputReader, name: string, defaultValue: boolean): boolean {
  const rawValue = readOptionalInput(inputs, name);
  if (rawValue === '') {
    return defaultValue;
  }

  return inputs.getBooleanInput(name);
}

function parseListInput(value: string): readonly string[] | undefined {
  if (value.trim() === '') {
    return undefined;
  }

  const entries = value
    .split(/[\n,]/)
    .map((entry) => entry.trim())
    .filter((entry) => entry !== '');

  return entries.length === 0 ? undefined : entries;
}
