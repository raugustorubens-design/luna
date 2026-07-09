import { NotConfiguredAdapter } from "./not-configured-adapter";

export class ManusAdapter extends NotConfiguredAdapter {
  readonly id = "manus";
  protected readonly envVar = "MANUS_API_KEY";
}
