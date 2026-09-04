import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const migration = readFileSync(resolve(__dirname, "../../supabase/migrations/0001_init.sql"), "utf-8");

describe("RLS policies — SQL inspection (unit, no network)", () => {
  it("enables RLS on all 3 tables", () => {
    expect(migration).toMatch(/alter table public\.profiles enable row level security/i);
    expect(migration).toMatch(/alter table public\.saved_locations enable row level security/i);
    expect(migration).toMatch(/alter table public\.weather_history enable row level security/i);
  });

  it("profiles policies use auth.uid() = id", () => {
    expect(migration).toContain("profiles_select_own");
    expect(migration).toContain("profiles_update_own");
    expect(migration).toContain("profiles_insert_own");
    expect(migration).toMatch(/using\s*\(\s*auth\.uid\(\)\s*=\s*id\s*\)/i);
  });

  it("saved_locations policies use auth.uid() = user_id", () => {
    expect(migration).toContain("saved_locations_select_own");
    expect(migration).toContain("saved_locations_insert_own");
    expect(migration).toContain("saved_locations_update_own");
    expect(migration).toContain("saved_locations_delete_own");
    const matches = migration.match(/saved_locations[^;]*auth\.uid\(\)\s*=\s*user_id/g);
    expect(matches?.length).toBeGreaterThanOrEqual(4);
  });

  it("weather_history policies use auth.uid() = user_id", () => {
    expect(migration).toContain("weather_history_select_own");
    expect(migration).toContain("weather_history_insert_own");
    const matches = migration.match(/weather_history[^;]*auth\.uid\(\)\s*=\s*user_id/g);
    expect(matches?.length).toBeGreaterThanOrEqual(4);
  });

  it("revokes PUBLIC execute on SECURITY DEFINER functions", () => {
    expect(migration).toMatch(/revoke execute on function public\.handle_new_user/i);
    expect(migration).toMatch(/revoke execute on function public\.purge_old_weather_history/i);
    expect(migration).toMatch(/revoke execute on function public\.current_user_id/i);
    expect(migration).toMatch(/grant execute on function public\.purge_old_weather_history\(\) to service_role/i);
  });

  it("has on delete cascade for GDPR erasure", () => {
    expect(migration).toMatch(/references auth\.users\s*\(id\) on delete cascade/g);
  });

  it("has index for recent history queries", () => {
    expect(migration).toContain("weather_history_user_created_idx");
  });
});
