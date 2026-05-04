describe("Campaign Feature", () => {
  test("should calculate campaign progress percentage correctly", () => {
    const raised = 500
    const goal = 1000

    const progress = (raised / goal) * 100

    expect(progress).toBe(50)
  })
})