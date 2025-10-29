import { describe, it, expect } from "vitest";
import { getPaginatedData } from "./helpers";

describe("getPaginatedData", () => {
  it("应该返回正确的分页数据和总数", () => {
    const data = [
      {
        id: 1,
        name: "Alice"
      },
      {
        id: 2,
        name: "Bob"
      },
      {
        id: 3,
        name: "Charlie"
      },
      {
        id: 4,
        name: "David"
      },
      {
        id: 5,
        name: "Eve"
      }
    ];
    const { paginatedData, total } = getPaginatedData(data, {
      page: 1,
      pageSize: 2
    });
    expect(paginatedData).toEqual([
      {
        id: 1,
        name: "Alice"
      },
      {
        id: 2,
        name: "Bob"
      }
    ]);

    expect(total).toBe(5);
  });
});
