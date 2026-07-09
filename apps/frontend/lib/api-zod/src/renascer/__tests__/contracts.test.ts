import assert from "node:assert/strict";
import test from "node:test";
import { RenascerGenerationRequest } from "../contracts";

test("RenascerGenerationRequest accepts a well-formed structured request", () => {
  const parsed = RenascerGenerationRequest.parse({
    description: "Landing page para uma cafeteria com seção de menu e contato",
    projectType: "landing_page",
  });

  assert.equal(parsed.projectType, "landing_page");
  assert.deepEqual(parsed.features, []);
});

test("RenascerGenerationRequest rejects an unstructured payload (the [object Object] bug class)", () => {
  const rawObjectPayload = { toString: () => "[object Object]" };
  const result = RenascerGenerationRequest.safeParse(rawObjectPayload);

  assert.equal(result.success, false);
});

test("RenascerGenerationRequest rejects a description that is too short to be meaningful", () => {
  const result = RenascerGenerationRequest.safeParse({
    description: "app",
    projectType: "web_app",
  });

  assert.equal(result.success, false);
});
