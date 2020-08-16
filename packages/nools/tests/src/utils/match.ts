import { Flow } from "../../../src/flow";

export async function match(session: Flow) {
  await session.match();
  session.dispose();
}
