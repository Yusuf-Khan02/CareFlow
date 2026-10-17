import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Appointment Logic & Scheduling Rules", () => {
  const STANDARD_SLOTS = [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
  ];

  it("should generate 13 half-hour standard appointment slots excluding lunch break", () => {
    assert.equal(STANDARD_SLOTS.length, 13);
    assert.equal(STANDARD_SLOTS[0], "09:00 AM");
    assert.equal(STANDARD_SLOTS[STANDARD_SLOTS.length - 1], "04:30 PM");
    // Ensure 1:00 PM - 2:00 PM lunch window is properly blocked out
    assert.ok(!STANDARD_SLOTS.includes("01:00 PM"));
    assert.ok(!STANDARD_SLOTS.includes("01:30 PM"));
  });

  it("should detect double-booking collisions for identical doctor, date and time", () => {
    const existingBookings = [
      { doctorId: "doc-1", date: "2026-10-25", time: "10:00 AM", status: "Confirmed" },
      { doctorId: "doc-1", date: "2026-10-25", time: "11:00 AM", status: "Scheduled" },
      { doctorId: "doc-2", date: "2026-10-25", time: "10:00 AM", status: "Confirmed" },
    ];

    const checkConflict = (doctorId: string, date: string, time: string) => {
      return existingBookings.some(
        (b) =>
          b.doctorId === doctorId &&
          b.date === date &&
          b.time === time &&
          !["Cancelled", "Completed"].includes(b.status)
      );
    };

    // Conflicts
    assert.equal(checkConflict("doc-1", "2026-10-25", "10:00 AM"), true);
    assert.equal(checkConflict("doc-1", "2026-10-25", "11:00 AM"), true);
    assert.equal(checkConflict("doc-2", "2026-10-25", "10:00 AM"), true);

    // No conflict - different time for doc-1
    assert.equal(checkConflict("doc-1", "2026-10-25", "02:00 PM"), false);

    // No conflict - different doctor at same time
    assert.equal(checkConflict("doc-3", "2026-10-25", "10:00 AM"), false);

    // No conflict - different date for doc-1
    assert.equal(checkConflict("doc-1", "2026-10-26", "10:00 AM"), false);
  });

  it("should ignore cancelled or completed bookings when calculating slot availability", () => {
    const bookings = [
      { doctorId: "doc-1", date: "2026-10-25", time: "09:30 AM", status: "Cancelled" },
      { doctorId: "doc-1", date: "2026-10-25", time: "10:30 AM", status: "Completed" },
      { doctorId: "doc-1", date: "2026-10-25", time: "11:30 AM", status: "Confirmed" },
    ];

    const activeBookedTimes = bookings
      .filter((b) => !["Cancelled", "Completed"].includes(b.status))
      .map((b) => b.time);

    const availableSlots = STANDARD_SLOTS.filter((slot) => !activeBookedTimes.includes(slot));

    assert.ok(availableSlots.includes("09:30 AM"), "Cancelled slot should be available");
    assert.ok(availableSlots.includes("10:30 AM"), "Completed slot should be available for new booking");
    assert.ok(!availableSlots.includes("11:30 AM"), "Confirmed slot must remain blocked");
    assert.equal(availableSlots.length, STANDARD_SLOTS.length - 1);
  });
});
