export class EnvironmentVariableUtil {
    public static checkVariable(name: string): void {
        if (!process.env[name]) {
            throw new Error(`Expected environment variable $${name} not present!`);
        }
    }

    public static getVariableOrThrow(name: string): string {
        EnvironmentVariableUtil.checkVariable(name);
        return process.env[name] as string;
    }

    public static getVariableOrDefault(name: string, defaultVal: string): string {
        return process.env[name] === undefined ? defaultVal : (process.env[name] as string);
    }
}
