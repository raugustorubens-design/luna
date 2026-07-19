import assert from "node:assert/strict";
import test from "node:test";
import { emitReport, getRecentReports } from "../reporter";

test("reporter stamps events with a timestamp and keeps them retrievable", () => {
  const event = emitReport({ name: "test.reporter.event", evidence: { ok: true } });

  assert.equal(event.name, "test.reporter.event");
  assert.equal(typeof event.at, "string");

  const recent = getRecentReports(1);
  assert.equal(recent.length, 1);
  assert.equal(recent[0]?.name, "test.reporter.event");
});

test("reporter returns the most recent N events in order", () => {
  emitReport({ name: "test.reporter.first" });
  emitReport({ name: "test.reporter.second" });
  emitReport({ name: "test.reporter.third" });

  const recent = getRecentReports(2);
  assert.deepEqual(
    recent.map((event) => event.name),
    ["test.reporter.second", "test.reporter.third"],
  );
});
